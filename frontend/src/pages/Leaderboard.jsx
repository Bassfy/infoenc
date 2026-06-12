import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const rankColors = ['text-yellow-400', 'text-gray-400', 'text-orange-600'];
const rankIcons = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    labsAPI.getLeaderboard({ period, limit: 50 })
      .then(r => setEntries(r.data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="text-cyber-500">Hacker</span> Leaderboard
        </h1>
        <p className="text-gray-500">Top hackers ranked by points and labs solved</p>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2 justify-center mb-8">
        {[
          { key: 'all', label: 'All Time' },
          { key: 'week', label: 'This Week' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === key ? 'bg-cyber-500 text-dark-950' : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && !loading && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-400/20 border-2 border-gray-400/50 flex items-center justify-center text-xl font-bold text-gray-300 mx-auto mb-2">
              {entries[1].username?.[0]?.toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-gray-300">{entries[1].username}</p>
            <p className="text-xs text-gray-500">{entries[1].points || entries[1].period_points} pts</p>
            <div className="h-16 bg-gray-400/20 border-t-2 border-gray-400/50 rounded-t-lg mt-2 w-20 mx-auto flex items-center justify-center text-2xl">
              🥈
            </div>
          </div>
          {/* 1st */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 flex items-center justify-center text-2xl font-bold text-yellow-300 mx-auto mb-2">
              {entries[0].username?.[0]?.toUpperCase()}
            </div>
            <p className="text-sm font-bold text-yellow-300">{entries[0].username}</p>
            <p className="text-xs text-yellow-500">{entries[0].points || entries[0].period_points} pts</p>
            <div className="h-24 bg-yellow-400/20 border-t-2 border-yellow-400/50 rounded-t-lg mt-2 w-24 mx-auto flex items-center justify-center text-3xl">
              🥇
            </div>
          </div>
          {/* 3rd */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-orange-600/20 border-2 border-orange-600/50 flex items-center justify-center text-lg font-bold text-orange-400 mx-auto mb-2">
              {entries[2].username?.[0]?.toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-orange-400">{entries[2].username}</p>
            <p className="text-xs text-gray-500">{entries[2].points || entries[2].period_points} pts</p>
            <div className="h-12 bg-orange-600/20 border-t-2 border-orange-600/50 rounded-t-lg mt-2 w-16 mx-auto flex items-center justify-center text-xl">
              🥉
            </div>
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-dark-700/50 border-b border-dark-600 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Hacker</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-2 text-right">Labs</div>
          <div className="col-span-2 text-right">Level</div>
        </div>

        {loading ? (
          <div className="space-y-px">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="h-14 bg-dark-700/50 animate-pulse border-b border-dark-700" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No entries yet</div>
        ) : (
          <div>
            {entries.map((entry, index) => {
              const isCurrentUser = user?.id === entry.id;
              return (
                <Link
                  key={entry.id}
                  to={`/profile/${entry.id}`}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors items-center ${
                    isCurrentUser ? 'bg-cyber-500/5' : ''
                  }`}
                >
                  <div className="col-span-1">
                    {index < 3 ? (
                      <span className="text-lg">{rankIcons[index]}</span>
                    ) : (
                      <span className="text-gray-500 font-mono text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
                      isCurrentUser
                        ? 'bg-cyber-500/20 border-cyber-500/50 text-cyber-500'
                        : 'bg-dark-700 border-dark-500 text-gray-400'
                    }`}>
                      {entry.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isCurrentUser ? 'text-cyber-500' : 'text-gray-200'}`}>
                        {entry.username}
                        {isCurrentUser && <span className="text-xs text-gray-500 ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-600">Lv. {entry.level}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-semibold font-mono ${index === 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {(entry.points || entry.period_points || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-sm text-gray-400">
                    {entry.labs_solved || 0}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded-full">
                      Lv.{entry.level}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
