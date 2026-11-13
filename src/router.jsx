import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/Home'

const AboutPage = lazy(() => import('./pages/About'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<div className="min-h-screen bg-[#0077b6]" />}>
            <AboutPage />
          </Suspense>
        ),
      },
    ],
  },
])

