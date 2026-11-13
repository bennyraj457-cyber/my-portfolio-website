import { Outlet } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import BoatCursor from '../components/ui/BoatCursor'

export default function RootLayout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-bg-main overflow-x-hidden">
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Animated Sailboat Cursor */}
      <BoatCursor />
    </div>
  )
}
