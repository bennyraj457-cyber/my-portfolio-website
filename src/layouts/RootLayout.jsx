import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MagneticCapsuleButton from '../components/ui/MagneticCapsuleButton'

export default function RootLayout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-bg-main overflow-x-hidden">
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />

      {/* Global custom magnetic capsule follower */}
      <MagneticCapsuleButton />
    </div>
  )
}
