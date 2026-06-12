import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../api';
import CourseCard from '../components/CourseCard';

const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    coursesAPI.getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    if (search) params.search = search;

    coursesAPI.list(params)
      .then(r => { setCourses(r.data.courses); setTotal(r.data.total); })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [category, difficulty, page, search]);

  const setFilter = (key, val) => {
    const params = Object.fromEntries(searchParams);
    if (val) params[key] = val;
    else delete params[key];
    delete params.page;
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', search);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Courses</h1>
        <p className="text-gray-500">Master cybersecurity from the ground up</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 sticky top-20 space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch}>
              <label className="cyber-label text-xs">Search</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="cyber-input text-sm"
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </form>

            {/* Category */}
            <div>
              <p className="cyber-label text-xs mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!category ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setFilter('category', cat.slug)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${category === cat.slug ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-gray-600">{cat.course_count}</span>
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
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors capitalize ${!difficulty ? 'bg-cyber-500/10 text-cyber-500' : 'text-gray-400 hover:bg-dark-700'}`}
                >
                  All Levels
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

        {/* Course Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${total} course${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-xl font-semibold text-gray-300 mb-2">No courses found</p>
              <p className="text-gray-500">Try different filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map(course => <CourseCard key={course.id} course={course} />)}
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
