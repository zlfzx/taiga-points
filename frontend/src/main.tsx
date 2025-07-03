// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, Navigate, redirect, RouterProvider } from 'react-router'
import { projectsLoader, projectLoader } from './loaders/projectLoader.ts'
import Login from './pages/Login.tsx'
import Projects from './pages/Projects.tsx'
import Project from './pages/Project.tsx'
import P from './pages/P.tsx'
import axios from 'axios'
import { protectedLoader } from './auth/protectedLoader.ts'
import Fallback from './components/fallback.tsx'
import { ErrorBoundary } from './components/error-boundary.tsx'
import { isAuthenticated } from './auth/auth.ts'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      // { index: true, Component: Home, },
      { index: true, element: <Navigate to="/auth" replace /> },
      { 
        path: 'auth', 
        loader: () => {
          if (isAuthenticated()) {
            return redirect('/projects');
          }
        },
        Component: Login, 
      },
      {
        loader: protectedLoader,
        children: [
          {
            path: 'projects',
            loader: projectsLoader,
            Component: Projects,
          },
          {
            path: 'project/:slug',
            loader: projectLoader,
            Component: Project,
          },
          {
            path: 'p',
            Component: P
          }
        ]
      }
    ],
    HydrateFallback: Fallback,
    ErrorBoundary: ErrorBoundary
  }
])

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <RouterProvider router={router} />
  // </StrictMode>,
)
