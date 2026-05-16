import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { PAGE_LOCATION } from './define/define';
import './App.css';
import Login from './page/auth/Login';
import Home from './page/Home';
import Page404 from './page/error/404';
import ProtectedRouteClient from './ProtectedRouteClient';
import ProtectedRouteAdmin from './ProtectedRouteAdmin';
import Register from './page/auth/Register';
import UnProtectedRoute from './UnProtectedRoute';
import Layout from './layout/Layout';
import LoginAdmin from './admin/page/auth/Login';
import AdminHome from './admin/page/Home';
import UserInfo from './page/user/Info';
import ChangePassword from './page/user/ChangePw';
import Forget from './page/auth/Forget';
import CourseCreate from './admin/page/course/Create';
import CourseIndex from './admin/page/course/Index';
import { ThemeProvider } from '@material-tailwind/react';
import CourseUpdate from './admin/page/course/Update';
import CourseDetail from './admin/page/course/Detail';
import LessonIndex from './admin/page/course/lesson/Index';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // Admin routes
      {
        path: '/admin',
        children: [
          {
            path: 'auth',
            element: <UnProtectedRoute />,
            children: [
              { path: 'login', element: <LoginAdmin /> },
            ],
          },
          {
            element: <ProtectedRouteAdmin />,
            children: [
              {
                element: <Layout />,
                children: [
                  { index: true, element: <AdminHome /> },
                  { 
                    path: 'course', 
                    children: [
                      { index: true, element: <CourseIndex />},
                      { path: 'create', element: <CourseCreate /> },
                      { path: 'update', element: <CourseUpdate />},
                      { path: ':id', element: <CourseDetail /> },
                      { path: ':id/lesson', element: <LessonIndex /> }
                    ] 
                  }, 
                ]
              }
            ],
          },
        ],
      },
      {
        path: '/',
        children: [
          {
            path: 'auth',
            element: <UnProtectedRoute />,
            children: [
              { index: true, element: <Login /> },
              { path: 'login', element: <Login /> },
              { path: 'register', element: <Register /> },
              { path: 'forget', element: <Forget /> }
            ],
          },
          // Client routes
          {
            element: <ProtectedRouteClient />,
            children: [
              {
                element: <Layout />,
                children: [
                  { index: true, element: <Home /> },
                  { path: 'home', element: <Home /> },
                  { 
                    path: 'user', 
                    children: [
                      { index: true, element: <UserInfo />},
                      { path: PAGE_LOCATION.USER_INFO, element: <UserInfo /> },
                      { path: PAGE_LOCATION.USER_CHANGE_PW, element: <ChangePassword /> },
                    ]
                  }
                ],
              },
            ],
          }
        ]
      },
      // 404
      { path: '*', element: <Page404 /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);