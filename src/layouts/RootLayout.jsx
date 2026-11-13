import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MagneticCapsuleButton from '../components/ui/MagneticCapsuleButton'
import Preloader from '../components/ui/Preloader'

export default function RootLayout() {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true)

  const handlePreloaderComplete = () => {
    setIsPreloaderActive(false)
    window.__preloaderFinished = true
    window.dispatchEvent(new CustomEvent('preloader:done'))
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-bg-main overflow-x-hidden">
      {/* Editorial GSAP Preloader Overlay */}
      {isPreloaderActive && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

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
