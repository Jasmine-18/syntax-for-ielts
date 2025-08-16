import React, {lazy, Suspense} from 'react';
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom';

// Lazy-loaded screens
const Dashboard = lazy (() => import ('./screens/Dashboard.jsx'));
const Speaking = lazy (() => import ('./screens/Speaking.jsx'));
const NotFound = lazy (() => import ('./screens/NotFound.jsx'));

const Loader = () => (
  <div style={{padding: 24, textAlign: 'center'}}>Loading…</div>
);

const router = createBrowserRouter ([
  {path: '/', element: <Navigate to="/dashboard" replace />},
  {path: '/dashboard', element: <Dashboard />},
  {path: '/speaking', element: <Speaking />},
  {path: '*', element: <NotFound />},
]);

export default function AppRoutes () {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
