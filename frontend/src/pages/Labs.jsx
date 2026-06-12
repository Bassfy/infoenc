import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { labsAPI } from '../api';
import LabCard from '../components/LabCard';

const labTypes = ['web', 'network', 'crypto', 'forensics', 'reversing', 'pwn', 'osint', 'steganography', 'misc'];
const difficulties = ['easy', 'medium', 'hard', 'insane'];

export default function Labs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [labs, setLabs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const difficulty = searchParams.get('difficulty') || '';
  const lab_type = searchParams.get('lab_type') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (difficulty) params.difficulty = difficulty;
    if (lab_type) params.lab_type = lab_type;
    if (search) params.search = search;

    labsAPI.list(params)
      .then(r => { setLabs(r.data.labs); setTotal(r.data.total); })
      .catch(() => setLabs([]))
      .finally(() => setLoading(false));
  }, [difficulty, lab_type, page, search]);

  const setFilter = (key, val) => {
    const params = Object.fromEntries(searchParams);
    if (val) params[key] = val;
    else delete params[key];
    delete params.page;
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Hacking <span className="text-cyber-500">Labs</span>
        </h1>
        <p className="text-gray-500">Real-world CTF challenges. Capture the flag. Earn points.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 sticky top-20 space-y-6">
            {/* Search */}
            <div>
              <label className="cyber-label text-xs">Search</label>
              <input
                type="text"
                className="cyber-input text-sm"
                placeholder="Search labs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Type */}
            <div>
              <p className="cyber-label text-xs mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter('lab_type', '')}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!lab_type ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                >
                  All Types
                </button>
                {labTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter('lab_type', t)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors capitalize ${lab_type === t ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="cyber-label text-xs mb-2">Difficulty</p>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter('difficulty', '')}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!difficulty ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                >
                  All
                </button>
                {difficulties.map(d => (
                  <button
                    key={d}
                    onClick={() => setFilter('difficulty', d)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors capitalize ${difficulty === d ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Lab Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${total} lab${total !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl h-44 animate-pulse" />
              ))}
            </div>
          ) : labs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔒</p>
              <p className="text-xl font-semibold text-gray-300 mb-2">No labs found</p>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {labs.map(lab => <LabCard key={lab.id} lab={lab} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setSearchParams(prev => { const n = Object.fromEntries(prev); n.page = p; return n; })}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-cyber-500 text-dark-950' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
