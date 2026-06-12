import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModule, setOpenModule] = useState(0);

  useEffect(() => {
    coursesAPI.get(slug)
      .then(r => setCourse(r.data))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await coursesAPI.enroll(course.id);
      setCourse(prev => ({ ...prev, enrollment: { progress_percent: 0, is_completed: false } }));
    } catch (err) {
      alert(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!course) return null;

  const isEnrolled = !!course.enrollment;
  const totalLessons = course.modules?.reduce((acc, m) => acc + (JSON.parse(m.lessons || '[]').length), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/courses" className="hover:text-cyber-500 transition-colors">Courses</Link>
            <span>/</span>
            <span style={{ color: course.category_color }}>{course.category_name}</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>

          {course.short_description && (
            <p className="text-lg text-gray-400 mb-6">{course.short_description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
            <span className={`difficulty-${course.difficulty} px-2.5 py-1 rounded-full text-xs font-medium capitalize`}>
              {course.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {course.enrolled_count?.toLocaleString()} enrolled
            </span>
            {course.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                ⭐ {course.rating.toFixed(1)} ({course.rating_count} reviews)
              </span>
            )}
          </div>

          {/* What you'll learn */}
          {course.what_you_learn && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-8">
              <h2 className="font-semibold text-white mb-4">What You'll Learn</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {(typeof course.what_you_learn === 'string' ? JSON.parse(course.what_you_learn) : course.what_you_learn).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-cyber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Content */}
          <div>
            <h2 className="font-semibold text-white mb-4">Course Content</h2>
            <div className="space-y-2">
              {course.modules?.map((module, idx) => {
                const lessons = typeof module.lessons === 'string' ? JSON.parse(module.lessons || '[]') : (module.lessons || []);
                const isOpen = openModule === idx;
                return (
                  <div key={module.id} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenModule(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-dark-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-200">{module.title}</span>
                        <span className="text-xs text-gray-500">{lessons.length} lessons</span>
                      </div>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && lessons.length > 0 && (
                      <div className="border-t border-dark-700">
                        {lessons.filter(l => l && l.id).map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 border-b border-dark-700 last:border-0">
                            <div className="w-6 h-6 flex items-center justify-center">
                              {lesson.lesson_type === 'video' ? (
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : lesson.lesson_type === 'lab' ? (
                                <span className="text-xs">💻</span>
                              ) : (
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            {lesson.is_preview || isEnrolled ? (
                              <Link to={`/lesson/${lesson.id}`} className="text-sm text-gray-300 hover:text-cyber-500 flex-1 transition-colors">
                                {lesson.title}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-500 flex-1">{lesson.title}</span>
                            )}
                            <div className="flex items-center gap-2">
                              {lesson.is_preview && (
                                <span className="text-xs text-cyber-500 bg-cyber-500/10 px-2 py-0.5 rounded-full">Preview</span>
                              )}
                              {lesson.video_duration_seconds > 0 && (
                                <span className="text-xs text-gray-600">
                                  {Math.floor(lesson.video_duration_seconds / 60)}:{String(lesson.video_duration_seconds % 60).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor */}
          {course.instructor_name && (
            <div className="mt-8 bg-dark-800 border border-dark-600 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Your Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-cyber-500/20 border border-cyber-500/30 flex items-center justify-center text-xl font-bold text-cyber-500">
                  {course.instructor_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-200">{course.instructor_name}</p>
                  {course.instructor_bio && <p className="text-sm text-gray-500 mt-1">{course.instructor_bio}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
            <div className="h-48 bg-dark-700 flex items-center justify-center">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🔐</span>
              )}
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-white mb-1">
                {course.is_free ? <span className="text-cyber-500">Free</span> : `$${course.price}`}
              </div>

              {isEnrolled ? (
                <div>
                  <div className="flex items-center gap-2 text-cyber-500 text-sm mb-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enrolled
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{course.enrollment.progress_percent}%</span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full">
                      <div className="h-full bg-cyber-500 rounded-full" style={{ width: `${course.enrollment.progress_percent}%` }} />
                    </div>
                  </div>
                  {course.modules?.[0] && (
                    <Link to={`/lesson/${JSON.parse(course.modules[0].lessons || '[]')[0]?.id}`} className="cyber-button w-full text-center block">
                      {course.enrollment.progress_percent > 0 ? 'Continue Learning' : 'Start Course'}
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="cyber-button w-full mt-3"
                >
                  {enrolling ? 'Enrolling...' : course.is_free ? 'Enroll for Free' : `Enroll for $${course.price}`}
                </button>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Duration</span>
                  <span className="text-gray-200">
                    {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Lessons</span>
                  <span className="text-gray-200">{totalLessons} lessons</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Level</span>
                  <span className="text-gray-200 capitalize">{course.difficulty}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Certificate</span>
                  <span className="text-cyber-500">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
