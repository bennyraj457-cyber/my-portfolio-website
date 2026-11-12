import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="p-4 border-b flex gap-4">
      <Link to="/" className="font-bold">Home</Link>
      <Link to="/about" className="font-bold">About</Link>
    </nav>
  )
}

