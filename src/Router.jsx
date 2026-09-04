import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Single source of truth for app routes.
// To add a new page: import its component above, then add a route entry below.
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      // "index" and "home" are aliases that just point back to "/".
      { path: 'index', element: <Navigate to="/" replace /> },
      { path: 'home', element: <Navigate to="/" replace /> },
      // { path: 'about', element: <About /> },
      // { path: 'work/:slug', element: <CaseStudy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
