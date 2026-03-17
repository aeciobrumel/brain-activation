import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '../layouts/AppLayout'
import { ExerciseLayout } from '../layouts/ExerciseLayout'
import { DailyTrainingPage } from '../../pages/DailyTrainingPage'
import { ExerciseLibraryPage } from '../../pages/ExerciseLibraryPage'
import { FullscreenExercisePage } from '../../pages/FullscreenExercisePage'
import { FullscreenSessionPage } from '../../pages/FullscreenSessionPage'
import { HomePage } from '../../pages/HomePage'
import { ProgressPage } from '../../pages/ProgressPage'
import { QuickActivationPage } from '../../pages/QuickActivationPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'daily-training', element: <DailyTrainingPage /> },
      { path: 'quick-activation', element: <QuickActivationPage /> },
      { path: 'library', element: <ExerciseLibraryPage /> },
      { path: 'progress', element: <ProgressPage /> },
    ],
  },
  {
    element: <ExerciseLayout />,
    children: [
      { path: '/exercise/:exerciseId', element: <FullscreenExercisePage /> },
      { path: '/session/:mode', element: <FullscreenSessionPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
