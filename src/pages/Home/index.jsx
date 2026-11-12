import HeroSection from '../../components/home/HeroSection'
import ProjectsSection from '../../components/home/ProjectsSection'
import SkillsSection from '../../components/home/SkillsSection'
import ContactSection from '../../components/home/ContactSection'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-16">
      <section id="hero">
        <HeroSection />
      </section>



      <section id="projects">
        <ProjectsSection />
      </section>


    </div>
  )
}
