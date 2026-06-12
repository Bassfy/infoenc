import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const stats = [
  { label: 'Active Learners', value: '12,000+' },
  { label: 'Lab Challenges', value: '250+' },
  { label: 'Expert Courses', value: '50+' },
  { label: 'Certifications', value: '8' },
];

const features = [
  {
    icon: '⚡',
    title: 'Hands-On Hacking Labs',
    description: 'Practice real-world attacks in isolated, safe environments. CTF challenges, vulnerable VMs, and guided exploitation scenarios.',
  },
  {
    icon: '🎓',
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals. Structured paths from beginner to expert covering all major cybersecurity domains.',
  },
  {
    icon: '🏆',
    title: 'Competitive Learning',
    description: 'Climb the leaderboard, earn badges, and track your progress. Compete in weekly CTF events and earn certificates.',
  },
  {
    icon: '🔐',
    title: 'Industry-Ready Skills',
    description: 'CEH, OSCP, and CompTIA-aligned content. Prepare for certifications and real penetration testing engagements.',
  },
  {
    icon: '🌐',
    title: 'Full Coverage',
    description: 'Web security, network hacking, malware analysis, forensics, cryptography, OSINT, and cloud security.',
  },
  {
    icon: '💬',
    title: 'Community & Mentorship',
    description: 'Join a community of hackers. Ask questions, share writeups, and get guidance from experienced professionals.',
  },
];

const tracks = [
  { name: 'Web Security', icon: '🌐', color: '#00ff88', count: 15, level: 'All Levels' },
  { name: 'Network Hacking', icon: '📡', color: '#0088ff', count: 12, level: 'Intermediate' },
  { name: 'Malware Analysis', icon: '🦠', color: '#ff4444', count: 8, level: 'Advanced' },
  { name: 'Cryptography', icon: '🔐', color: '#ff8800', count: 10, level: 'All Levels' },
  { name: 'Digital Forensics', icon: '🔍', color: '#8800ff', count: 9, level: 'Intermediate' },
  { name: 'Penetration Testing', icon: '🎯', color: '#ff0088', count: 18, level: 'All Levels' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950" />

        {/* Animated scan line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-500/30 to-transparent animate-scan pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-500 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-500 animate-pulse" />
              Cybersecurity Academy — Learn. Hack. Defend.
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Master
              <span className="block glow-text">Cybersecurity</span>
              <span className="text-gray-400">by Hacking</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Hands-on labs, expert courses, and real-world challenges. Build the skills
              to protect systems and launch ethical hacking careers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard" className="cyber-button text-lg px-8 py-4">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="cyber-button text-lg px-8 py-4">
                    Start Hacking Free →
                  </Link>
                  <Link to="/labs" className="cyber-button-outline text-lg px-8 py-4">
                    Explore Labs
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {stats.map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-extrabold text-cyber-500 font-mono">{value}</div>
                  <div className="text-sm text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tracks */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-cyber-500">Attack Path</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Structured learning paths designed to take you from zero to expert in each cybersecurity domain.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <Link
              key={track.name}
              to={`/courses?category=${track.name.toLowerCase().replace(/ /g, '-')}`}
              className="group bg-dark-800 border border-dark-600 rounded-xl p-6 hover:border-opacity-50 transition-all duration-300 hover:scale-[1.02]"
              style={{ '--track-color': track.color }}
            >
              <div className="text-3xl mb-3">{track.icon}</div>
              <h3 className="font-semibold text-white group-hover:text-white mb-1"
                style={{ color: 'inherit' }}>
                {track.name}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{track.level}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: track.color }}>
                  {track.count} courses
                </span>
                <svg className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="mt-3 h-0.5 rounded-full" style={{ background: `${track.color}30` }}>
                <div className="h-full rounded-full transition-all duration-500 group-hover:w-full w-1/3" style={{ background: track.color }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="text-cyber-500">Level Up</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-dark-800 border border-dark-600 rounded-xl p-6 hover:border-cyber-500/20 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-dark-800 border border-cyber-500/20 rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start <span className="text-cyber-500">Hacking?</span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join thousands of students mastering cybersecurity. Free to start, no credit card required.
              </p>
              <Link to="/register" className="cyber-button text-lg px-10 py-4">
                Create Free Account →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white">Info<span className="text-cyber-500">Enc</span> Academy</span>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} InfoEnc Academy. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link to="/courses" className="hover:text-cyber-500 transition-colors">Courses</Link>
              <Link to="/labs" className="hover:text-cyber-500 transition-colors">Labs</Link>
              <Link to="/leaderboard" className="hover:text-cyber-500 transition-colors">Leaderboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
