import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// Landmark ids in MediaPipe's 21-point hand model.
const WRIST = 0;
const INDEX_TIP = 8;
const INDEX_PIP = 6;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
// A finger counts as "extended" when its tip is this much farther from the wrist than its PIP
// joint, as a fraction of palm size — scale-invariant, so it works regardless of hand rotation
// or distance from the camera.
const EXTENSION_MARGIN_RATIO = 0.06;
// Index and middle tips must be at least this close (as a fraction of palm size) to count as a
// deliberate two-finger point, rather than the middle finger just happening to pass through an
// "extended" reading while curling closed on its own.
const TOGETHER_RATIO = 0.45;
// Finger speed (normalized units/sec) required to count as a flick.
const FLICK_VELOCITY_THRESHOLD = 0.8;
const SCROLL_MULTIPLIER = 900;
const MIN_SCROLL = 120;
const MAX_SCROLL = 1400;
const FLICK_COOLDOWN_MS = 350;
const HISTORY_SIZE = 4;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isExtended(hand, tipIdx, pipIdx, palmSize) {
  const wrist = hand[WRIST];
  return distance(wrist, hand[tipIdx]) > distance(wrist, hand[pipIdx]) + EXTENSION_MARGIN_RATIO * palmSize;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function HandScrollControl() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [debug, setDebug] = useState({ mode: null, velocity: 0 });
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  // { mode: 'one' | 'two' | null, points: [{ y, t }] }
  const gestureRef = useRef({ mode: null, points: [] });
  const cooldownUntilRef = useRef(0);
  const debugFrameRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    async function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      const result = landmarker.detectForVideo(video, now);
      const hand = result.landmarks && result.landmarks[0];
      const gesture = gestureRef.current;

      // One finger (index only) = flick up to scroll down. Two fingers held together
      // (index + middle) = flick down to scroll back up.
      let mode = null;
      if (hand) {
        const palmSize = distance(hand[WRIST], hand[MIDDLE_MCP]) || 1;
        const indexExtended = isExtended(hand, INDEX_TIP, INDEX_PIP, palmSize);
        const middleExtended = isExtended(hand, MIDDLE_TIP, MIDDLE_PIP, palmSize);
        const tipsTogether = distance(hand[INDEX_TIP], hand[MIDDLE_TIP]) < TOGETHER_RATIO * palmSize;
        if (indexExtended && middleExtended && tipsTogether) mode = 'two';
        else if (indexExtended && !middleExtended) mode = 'one';
      }

      // Resetting the point history the instant the mode changes (rather than lagging behind
      // a few frames) means a transitional pose — like fingers curling shut after a flick — can
      // never get blended into a different gesture's history and misread as a huge, fast move.
      if (gesture.mode !== mode) {
        gesture.mode = mode;
        gesture.points = [];
      }

      let velocity = 0;
      if (mode) {
        const tipY = mode === 'two' ? (hand[INDEX_TIP].y + hand[MIDDLE_TIP].y) / 2 : hand[INDEX_TIP].y;
        gesture.points.push({ y: tipY, t: now });
        while (gesture.points.length > HISTORY_SIZE) gesture.points.shift();

        if (gesture.points.length >= 2) {
          const first = gesture.points[0];
          const last = gesture.points[gesture.points.length - 1];
          const dt = (last.t - first.t) / 1000;
          if (dt > 0) {
            // y shrinks toward 0 moving up the frame, grows toward 1 moving down.
            const rawVelocity = mode === 'one' ? (first.y - last.y) / dt : (last.y - first.y) / dt;
            velocity = rawVelocity;
            if (rawVelocity > FLICK_VELOCITY_THRESHOLD && now > cooldownUntilRef.current) {
              const amount = clamp(rawVelocity * SCROLL_MULTIPLIER, MIN_SCROLL, MAX_SCROLL);
              window.scrollBy({ top: mode === 'one' ? amount : -amount, behavior: 'smooth' });
              cooldownUntilRef.current = now + FLICK_COOLDOWN_MS;
              gesture.points = [];
            }
          }
        }
      }

      debugFrameRef.current += 1;
      if (debugFrameRef.current % 5 === 0) {
        setDebug({ mode, velocity: Math.round(velocity * 100) / 100 });
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    async function start() {
      setStatus('loading');
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const modelAssetPath =
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
        let landmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numHands: 1,
          });
        } catch {
          // Some browsers/GPUs don't support the WebGL delegate — fall back to CPU.
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numHands: 1,
          });
        }
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        setStatus('ready');
        gestureRef.current = { mode: null, points: [] };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('Hand tracking failed to start:', err);
        if (!cancelled) setStatus('error');
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (landmarkerRef.current) landmarkerRef.current.close();
      landmarkerRef.current = null;
      streamRef.current = null;
      setStatus('idle');
    };
  }, [enabled]);

  return (
    <div className="hand-scroll-widget">
      <button type="button" className="hand-scroll-toggle" onClick={() => setEnabled((v) => !v)}>
        {enabled ? '✋ Stop gesture scroll' : '✋ Enable gesture scroll'}
      </button>
      {enabled && (
        <div className="hand-scroll-panel">
          <video ref={videoRef} className="hand-scroll-video" muted playsInline />
          <div className={`hand-scroll-status st-${status}`}>
            <span className="dot"></span>
            {status === 'ready' ? 'TRACKING — 1 finger up ↓ page · 2 fingers down ↑ page' : status.toUpperCase()}
          </div>
          {status === 'ready' && (
            <div className="hand-scroll-debug">
              MODE: {debug.mode ?? 'none'} · VEL: {debug.velocity}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
