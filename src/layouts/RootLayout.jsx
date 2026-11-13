import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BoatCursor from '../components/ui/BoatCursor'
import { SeaWaterBackground } from '../components/common'

export default function RootLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-[#0077b6]">
      {/* Fixed Header with Name Logo & Let's Talk CTA */}
      <Header />

      {/* Living Animated Sea Water Canvas across the entire website */}
      <SeaWaterBackground />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Animated Sailboat Cursor */}
      <BoatCursor />
    </div>
  )
}
