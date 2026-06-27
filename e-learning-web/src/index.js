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
import AdminCourseCreate from './admin/page/course/Create';
import AdminCourseIndex from './admin/page/course/Index';
import { ThemeProvider } from '@material-tailwind/react';
import AdminCourseUpdate from './admin/page/course/Update';
import AdminCourseDetail from './admin/page/course/Detail';
import AdminLessonIndex from './admin/page/course/lesson/Index';
import CourseIndex from './page/course/Index';
import CourseDetail from './page/course/Detail';
import LearnLesson from './page/course/Lesson';

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
                      { index: true, element: <AdminCourseIndex />},
                      { path: 'create', element: <AdminCourseCreate /> },
                      { path: 'update', element: <AdminCourseUpdate />},
                      { path: ':courseId', element: <AdminCourseDetail /> },
                      { path: ':courseId/lesson', element: <AdminLessonIndex /> }
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
          // Client routes
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
                  }, 
                  {
                    path: 'course',
                    children: [
                      { index: true, element: <CourseIndex /> },
                      { path: ':courseId', element: <CourseDetail /> }
                    ]
                  }
                ],
              },
              {
                path: `course/:courseId/learn`, 
                element: <LearnLesson />
              }
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