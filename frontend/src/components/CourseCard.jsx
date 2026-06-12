import { Link } from 'react-router-dom';

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export default function CourseCard({ course }) {
  const {
    slug, title, short_description, thumbnail_url, difficulty,
    duration_minutes, enrolled_count, rating, is_free, price,
    category_name, category_color, instructor_name, progress_percent,
  } = course;

  const hours = Math.floor(duration_minutes / 60);
  const mins = duration_minutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <Link to={`/courses/${slug}`} className="block group">
      <div className="cyber-card h-full flex flex-col group-hover:scale-[1.02] transition-transform duration-200">
        {/* Thumbnail */}
        <div className="relative h-44 bg-dark-700 rounded-lg overflow-hidden mb-4">
          {thumbnail_url ? (
            <img src={thumbnail_url} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${category_color || '#00ff88'}15, ${category_color || '#00ff88'}05)` }}>
              <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 20 20" style={{ color: category_color || '#00ff88' }}>
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
          )}
          {progress_percent !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
              <div
                className="h-full bg-cyber-500 transition-all"
                style={{ width: `${progress_percent}%` }}
              />
            </div>
          )}
          <div className="absolute top-2 right-2">
            {is_free ? (
              <span className="px-2 py-0.5 bg-cyber-500/20 border border-cyber-500/30 text-cyber-500 text-xs font-semibold rounded-full">
                FREE
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-dark-800/90 text-gray-200 text-xs font-semibold rounded-full">
                ${price}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-3">
          {category_name && (
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: category_color || '#00ff88' }}>
              {category_name}
            </span>
          )}
          <h3 className="font-semibold text-gray-100 group-hover:text-cyber-500 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          {short_description && (
            <p className="text-sm text-gray-500 line-clamp-2">{short_description}</p>
          )}

          {instructor_name && (
            <p className="text-xs text-gray-500">by <span className="text-gray-400">{instructor_name}</span></p>
          )}

          <div className="mt-auto pt-3 border-t border-dark-600 flex items-center justify-between">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium difficulty-${difficulty}`}>
              {difficultyLabels[difficulty] || difficulty}
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {duration_minutes > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {durationStr}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {enrolled_count?.toLocaleString() || 0}
              </span>
              {rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
