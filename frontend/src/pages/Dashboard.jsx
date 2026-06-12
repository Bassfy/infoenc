import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, color = 'cyber' }) {
  const colors = {
    cyber: 'border-cyber-500/20 bg-cyber-500/5 text-cyber-500',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
    yellow: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
  };

  return (
    <div className={`bg-dark-800 border rounded-xl p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-extrabold font-mono">{value}</span>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const nextLevel = (stats.level || 1) * 500;
  const levelProgress = Math.min(((stats.points || 0) % 500) / 500 * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-cyber-500">{user?.username}</span>
          </h1>
          <p className="text-gray-500 mt-1">Track your hacking progress</p>
        </div>
        <div className="hidden sm:block text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-500 text-sm">Level {stats.level || 1}</span>
            <span className="text-cyber-500 font-mono font-bold">{stats.points || 0} pts</span>
          </div>
          <div className="w-40 h-1.5 bg-dark-600 rounded-full mt-2">
            <div
              className="h-full bg-cyber-500 rounded-full transition-all duration-1000"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{500 - ((stats.points || 0) % 500)} pts to Level {(stats.level || 1) + 1}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🎯" label="Labs Solved" value={stats.labs_solved || 0} color="cyber" />
        <StatCard icon="🎓" label="Courses Enrolled" value={stats.courses_enrolled || 0} color="blue" />
        <StatCard icon="✅" label="Completed" value={stats.courses_completed || 0} color="purple" />
        <StatCard icon="🏆" label="Global Rank" value={`#${stats.rank || '—'}`} color="yellow" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* In Progress Courses */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Continue Learning</h2>
            <Link to="/courses/my" className="text-sm text-cyber-500 hover:text-cyber-400">View all →</Link>
          </div>
          {data?.inProgress?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No courses in progress</p>
              <Link to="/courses" className="cyber-button text-sm">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.inProgress?.map(course => (
                <Link key={course.id} to={`/courses/${course.slug}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-700 transition-colors">
                  <div className="w-12 h-12 bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-lg">📚</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{course.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-dark-600 rounded-full">
                        <div
                          className="h-full bg-cyber-500 rounded-full"
                          style={{ width: `${course.progress_percent || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{course.progress_percent || 0}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Lab Solves */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Lab Solves</h2>
            <Link to="/labs" className="text-sm text-cyber-500 hover:text-cyber-400">View labs →</Link>
          </div>
          {data?.recentLabs?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No labs solved yet</p>
              <Link to="/labs" className="cyber-button text-sm">Start a Lab</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentLabs?.map((lab, i) => (
                <Link key={i} to={`/labs/${lab.slug}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyber-500/10 border border-cyber-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{lab.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{lab.difficulty}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-yellow-400">+{lab.points} pts</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/courses', label: 'Browse Courses', icon: '📚', color: 'border-blue-500/20 hover:border-blue-500/40' },
          { to: '/labs', label: 'Hacking Labs', icon: '💻', color: 'border-cyber-500/20 hover:border-cyber-500/40' },
          { to: '/leaderboard', label: 'Leaderboard', icon: '🏆', color: 'border-yellow-500/20 hover:border-yellow-500/40' },
          { to: `/profile/${user?.id}`, label: 'My Profile', icon: '👤', color: 'border-purple-500/20 hover:border-purple-500/40' },
        ].map(({ to, label, icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`bg-dark-800 border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] ${color}`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-gray-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
