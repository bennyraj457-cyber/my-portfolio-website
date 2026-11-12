import AboutBio from '../../components/about/AboutBio'
import AboutExperience from '../../components/about/AboutExperience'
import AboutEducation from '../../components/about/AboutEducation'

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">About Page</h1>
      <AboutBio />
      <AboutExperience />
      <AboutEducation />
    </div>
  )
}

