import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const targetId = userId || authUser?.id;
  const isOwnProfile = !userId || String(userId) === String(authUser?.id);

  useEffect(() => {
    if (!targetId) return;
    usersAPI.getProfile(targetId)
      .then(r => {
        setProfile(r.data);
        setForm({ username: r.data.username || '', bio: r.data.bio || '' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await usersAPI.updateProfile(form);
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-gray-500">User not found</p>
    </div>
  );

  const levelProgress = ((profile.points || 0) % 500) / 500 * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 text-center sticky top-20">
            <div className="w-24 h-24 rounded-full bg-cyber-500/20 border-2 border-cyber-500/40 flex items-center justify-center text-4xl font-bold text-cyber-500 mx-auto mb-4">
              {profile.username?.[0]?.toUpperCase()}
            </div>

            {editing ? (
              <div className="space-y-3 text-left">
                <div>
                  <label className="cyber-label text-xs">Username</label>
                  <input
                    type="text"
                    className="cyber-input text-sm"
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="cyber-label text-xs">Bio</label>
                  <textarea
                    className="cyber-input text-sm resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="cyber-button text-sm flex-1">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="cyber-button-outline text-sm flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white mb-1">{profile.username}</h1>
                {profile.bio && <p className="text-sm text-gray-400 mb-3">{profile.bio}</p>}

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <span className="text-cyber-500 font-semibold font-mono">{profile.points || 0}</span> pts
                  </span>
                  <span className="text-dark-600">|</span>
                  <span>Level <span className="text-cyber-500 font-semibold">{profile.level}</span></span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Level {profile.level}</span>
                    <span>Level {profile.level + 1}</span>
                  </div>
                  <div className="h-1.5 bg-dark-600 rounded-full">
                    <div className="h-full bg-cyber-500 rounded-full" style={{ width: `${levelProgress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xl font-bold text-cyber-500">{profile.labs_solved || 0}</p>
                    <p className="text-xs text-gray-500">Labs Solved</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xl font-bold text-blue-400">{profile.courses_completed || 0}</p>
                    <p className="text-xs text-gray-500">Courses Done</p>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 w-full cyber-button-outline text-sm"
                  >
                    Edit Profile
                  </button>
                )}

                <p className="text-xs text-gray-600 mt-4">
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Achievements</h2>
            {profile.achievements?.length === 0 ? (
              <p className="text-gray-500 text-sm">No achievements yet. Solve labs and complete courses to earn them!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profile.achievements?.map(ach => (
                  <div
                    key={ach.id}
                    className="bg-dark-700 border border-dark-500 rounded-xl p-3 text-center hover:border-dark-400 transition-colors"
                    title={ach.description}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg"
                      style={{ background: `${ach.badge_color}20`, border: `1px solid ${ach.badge_color}50` }}
                    >
                      🏆
                    </div>
                    <p className="text-xs font-semibold text-gray-200">{ach.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(ach.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Recent Activity</h2>
            {profile.recentActivity?.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {profile.recentActivity?.map((activity, i) => (
                  <Link
                    key={i}
                    to={`/${activity.type === 'lab' ? 'labs' : 'courses'}/${activity.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      activity.type === 'lab' ? 'bg-cyber-500/10 text-cyber-500' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {activity.type === 'lab' ? '💻' : '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600 capitalize">{activity.type}</p>
                    </div>
                    <span className="text-xs text-gray-600">
                      {new Date(activity.activity_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
