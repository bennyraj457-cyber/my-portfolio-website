import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BoatCursor from '../components/ui/BoatCursor'
import { SeaWaterBackground } from '../components/common'

export default function RootLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-white">
      {/* Fixed Header with Name Logo & Let's Talk CTA */}
      <Header />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Animated Sailboat Cursor (Hero only) */}
      <BoatCursor />

      {/* Vercel Web Analytics tracker */}
      <Analytics />
    </div>
  )
}
