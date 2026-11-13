import React from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-20 w-full border-t border-black/10 bg-white/70 backdrop-blur-md py-12 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* Paragraph Notice */}
        <p className="text-sm sm:text-base text-black/70 font-sans max-w-xl leading-relaxed">
          I'm currently working on the other sections of this portfolio. More projects, case studies, and interactive experiments are on the way.
        </p>

        {/* Copyright */}
        <div className="text-xs text-black/40 font-mono pt-2">
          © {currentYear} Benny. Designed & Crafted with Vision.
        </div>
      </div>
    </footer>
  )
}

