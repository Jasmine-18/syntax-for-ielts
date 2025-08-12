import React, {lazy, Suspense} from 'react';
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom';

// Lazy-loaded screens
const Dashboard = lazy (() => import ('./screens/Dashboard.jsx'));
const Tests = lazy (() => import ('./screens/Tests'));
const TestDetail = lazy (() => import ('./screens/TestDetail'));
const Practice = lazy (() => import ('./screens/Practice'));
const Results = lazy (() => import ('./screens/Results'));
const Profile = lazy (() => import ('./screens/Profile'));
const Admin = lazy (() => import ('./screens/Admin'));
const NotFound = lazy (() => import ('./screens/NotFound'));
const Login = lazy (() => import ('./screens/Login'));

const Loader = () => (
  <div style={{padding: 24, textAlign: 'center'}}>Loading…</div>
);

const router = createBrowserRouter ([
  {path: '/', element: <Navigate to="/dashboard" replace />},
  {path: '/login', element: <Login />},
  {path: '/dashboard', element: <Dashboard />},
  {path: '/tests', element: <Tests />},
  {path: '/tests/:id', element: <TestDetail />},
  {path: '/practice/:skill', element: <Practice />},
  {path: '/results', element: <Results />},
  {path: '/profile', element: <Profile />},
  {path: '/admin', element: <Admin />},
  {path: '*', element: <NotFound />},
]);

export default function AppRoutes () {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
