import { Link } from 'react-router-dom';

const labTypeIcons = {
  web: '🌐',
  network: '📡',
  crypto: '🔐',
  forensics: '🔍',
  reversing: '⚙️',
  pwn: '💀',
  osint: '👁️',
  steganography: '🎭',
  misc: '🎯',
};

const difficultyColors = {
  easy: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)' },
  medium: { text: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.3)' },
  hard: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)' },
  insane: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', border: 'rgba(248, 113, 113, 0.3)' },
};

export default function LabCard({ lab }) {
  const { slug, title, short_description, difficulty, points, lab_type, solve_count, is_solved, flag_format } = lab;
  const colors = difficultyColors[difficulty] || difficultyColors.easy;

  return (
    <Link to={`/labs/${slug}`} className="block group">
      <div className={`relative bg-dark-800 rounded-xl p-5 border transition-all duration-300 h-full flex flex-col group-hover:scale-[1.02] ${
        is_solved
          ? 'border-cyber-500/30 bg-cyber-500/5'
          : 'border-dark-600 hover:border-dark-500'
      }`}>
        {is_solved && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-cyber-500 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-dark-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl leading-none mt-0.5">
            {labTypeIcons[lab_type] || '🎯'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 group-hover:text-cyber-500 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 font-mono">{flag_format}</p>
          </div>
        </div>

        {short_description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{short_description}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium border capitalize"
            style={{ color: colors.text, background: colors.bg, borderColor: colors.border }}
          >
            {difficulty}
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              {points} pts
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {solve_count} solves
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
