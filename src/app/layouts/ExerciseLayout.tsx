import { Outlet } from 'react-router-dom'

export function ExerciseLayout() {
  return (
    <div className="flex min-h-screen w-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_28%),linear-gradient(180deg,_#fffdf9_0%,_#f8fafc_100%)]">
      <main className="flex min-h-screen w-full flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
