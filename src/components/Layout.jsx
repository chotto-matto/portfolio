import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SpoolWidget from './SpoolWidget';
import HandScrollControl from './HandScrollControl';

// Shared shell rendered around every route — add site-wide UI here.
export default function Layout() {
  return (
    <>
      <SpoolWidget />
      <HandScrollControl />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
