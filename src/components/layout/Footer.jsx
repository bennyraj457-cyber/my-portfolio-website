import React from 'react'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer id="portfolio-footer" className="relative z-20 w-full border-t border-black/10 bg-white py-12 px-6 sm:px-10 text-black">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* Paragraph Notice */}
        <p className="text-sm sm:text-base text-black/75 font-sans max-w-xl leading-relaxed">
          I'm currently working on improve the website design and other sections of this portfolio. More projects, case studies, and interactive experiments are on the way.
        </p>

        {/* Copyright */}
        <div className="text-xs text-black/50 font-mono pt-2">
          © {CURRENT_YEAR} Benny. Designed & Crafted with Vision.
        </div>
      </div>
    </footer>
  )
}

