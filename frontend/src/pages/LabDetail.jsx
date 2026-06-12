import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { labsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Terminal from '../components/Terminal';

const difficultyColors = {
  easy: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  medium: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  hard: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  insane: 'text-red-400 border-red-400/30 bg-red-400/10',
};

export default function LabDetail() {
  const { slug } = useParams();
  const { user } = useNavigate ? { user: null } : {};
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    labsAPI.get(slug)
      .then(r => setLab(r.data))
      .catch(() => navigate('/labs'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!authUser) { navigate('/login'); return; }
    if (!flag.trim()) return;

    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await labsAPI.submitFlag(slug, flag.trim());
      setResult(data);
      if (data.correct) {
        setLab(prev => ({
          ...prev,
          completion: { completed_at: new Date().toISOString(), points_earned: prev.points },
        }));
      }
    } catch (err) {
      setResult({ correct: false, message: err.response?.data?.error || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminalFlag = (terminalFlag) => {
    setFlag(terminalFlag);
    setActiveTab('submit');
  };

  const requestHint = async () => {
    if (!authUser) { navigate('/login'); return; }
    setLoadingHint(true);
    try {
      const { data } = await labsAPI.getHint(slug, hintIndex);
      setHint(data.hint);
      setHintIndex(h => h + 1);
    } catch {
      setHint('No more hints available.');
    } finally {
      setLoadingHint(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!lab) return null;

  const isSolved = !!lab.completion;
  const hints = typeof lab.hints === 'string' ? JSON.parse(lab.hints || '[]') : (lab.hints || []);
  const tools = typeof lab.tools_needed === 'string' ? JSON.parse(lab.tools_needed || '[]') : (lab.tools_needed || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/labs" className="hover:text-cyber-500 transition-colors">Labs</Link>
        <span>/</span>
        <span className="text-gray-300">{lab.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{lab.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${difficultyColors[lab.difficulty] || ''}`}>
                    {lab.difficulty}
                  </span>
                  <span className="text-gray-500 capitalize bg-dark-700 px-2.5 py-0.5 rounded-full text-xs">{lab.lab_type}</span>
                  <span className="text-yellow-400 font-semibold text-xs flex items-center gap-1">
                    ⚡ {lab.points} points
                  </span>
                  <span className="text-gray-500 text-xs">{lab.solve_count} solves</span>
                </div>
              </div>
              {isSolved && (
                <div className="flex items-center gap-2 text-cyber-500 bg-cyber-500/10 border border-cyber-500/30 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Solved
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dark-800 border border-dark-600 p-1 rounded-xl">
            {['description', 'terminal', 'submit'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-cyber-500 text-dark-950'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab === 'terminal' ? '💻 Terminal' : tab === 'submit' ? '🚩 Submit Flag' : '📋 Description'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
              {lab.description ? (
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">{lab.description}</div>
              ) : (
                <p className="text-gray-500">No description available.</p>
              )}

              {tools.length > 0 && (
                <div className="pt-4 border-t border-dark-600">
                  <h3 className="font-semibold text-white mb-2 text-sm">Recommended Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool, i) => (
                      <span key={i} className="text-xs bg-dark-700 border border-dark-500 text-gray-300 px-2.5 py-1 rounded-full font-mono">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-dark-600">
                <p className="text-xs text-gray-500 font-mono">Flag format: <span className="text-cyber-500">{lab.flag_format}</span></p>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <Terminal labSlug={slug} onFlagFound={handleTerminalFlag} />
          )}

          {activeTab === 'submit' && (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Submit Flag</h2>

              {isSolved && !result && (
                <div className="bg-cyber-500/10 border border-cyber-500/30 rounded-xl p-4 mb-4 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-cyber-500 font-semibold">Challenge Solved!</p>
                    <p className="text-sm text-gray-400">You earned {lab.completion?.points_earned} points</p>
                  </div>
                </div>
              )}

              {result && (
                <div className={`rounded-xl p-4 mb-4 border ${result.correct ? 'bg-cyber-500/10 border-cyber-500/30 text-cyber-500' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{result.correct ? '✅' : '❌'}</span>
                    <p className="font-medium">{result.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="cyber-label">Your Flag</label>
                  <input
                    type="text"
                    className="cyber-input font-mono"
                    placeholder={lab.flag_format}
                    value={flag}
                    onChange={e => setFlag(e.target.value)}
                    disabled={isSolved}
                  />
                </div>
                {!isSolved && (
                  <button type="submit" disabled={submitting || !flag.trim()} className="cyber-button">
                    {submitting ? 'Checking...' : 'Submit Flag 🚩'}
                  </button>
                )}
              </form>

              <p className="text-xs text-gray-600 mt-3">Attempts: {lab.attempts || 0}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Lab Info */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Lab Info</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Category', value: lab.category_name || lab.lab_type, color: lab.category_color },
                { label: 'Difficulty', value: lab.difficulty, capitalize: true },
                { label: 'Points', value: `${lab.points} pts`, yellow: true },
                { label: 'Total Solves', value: lab.solve_count },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-gray-500">{item.label}</span>
                  <span
                    className={`font-medium ${item.capitalize ? 'capitalize' : ''} ${item.yellow ? 'text-yellow-400' : 'text-gray-200'}`}
                    style={item.color ? { color: item.color } : {}}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hints */}
          {hints.length > 0 && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3">Hints</h3>
              {hint && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                  <p className="text-yellow-300 text-sm">{hint}</p>
                </div>
              )}
              {hintIndex < hints.length && (
                <button
                  onClick={requestHint}
                  disabled={loadingHint}
                  className="w-full cyber-button-outline text-sm"
                >
                  {loadingHint ? 'Loading...' : `Get Hint ${hintIndex + 1}/${hints.length}`}
                </button>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {!isSolved && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('terminal')}
                  className="w-full text-left px-4 py-2.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
                >
                  <span>💻</span> Open Terminal
                </button>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="w-full text-left px-4 py-2.5 bg-cyber-500/10 hover:bg-cyber-500/20 border border-cyber-500/20 rounded-lg text-sm text-cyber-500 transition-colors flex items-center gap-2"
                >
                  <span>🚩</span> Submit Flag
                </button>
              </div>
            </div>
          )}

          {!authUser && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-center">
              <p className="text-gray-400 text-sm mb-3">Login to submit flags and earn points</p>
              <Link to="/login" className="cyber-button text-sm">Login to Play</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
