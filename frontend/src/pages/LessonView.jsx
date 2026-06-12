import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../api';

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    coursesAPI.getLesson(lessonId)
      .then(r => {
        setLesson(r.data);
        setCompleted(r.data.progress?.is_completed || false);
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleComplete = async () => {
    if (completed) return;
    setCompleting(true);
    try {
      await coursesAPI.completeLesson(lessonId);
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!lesson) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/courses" className="hover:text-cyber-500 transition-colors">Courses</Link>
        <span>/</span>
        <Link to={`/courses/${lesson.course_id}`} className="hover:text-cyber-500 transition-colors">Course</Link>
        <span>/</span>
        <span className="text-gray-300">{lesson.title}</span>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        {/* Video Player */}
        {lesson.video_url && (
          <div className="aspect-video bg-dark-900">
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
              <p className="text-gray-500 text-sm mt-1 capitalize">{lesson.lesson_type} lesson</p>
            </div>
            <button
              onClick={handleComplete}
              disabled={completing || completed}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                completed
                  ? 'bg-cyber-500/10 text-cyber-500 border border-cyber-500/30 cursor-default'
                  : 'cyber-button'
              }`}
            >
              {completed ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </>
              ) : completing ? 'Marking...' : 'Mark Complete'}
            </button>
          </div>

          {/* Lesson Content */}
          {lesson.content && (
            <div className="prose prose-invert prose-sm max-w-none">
              <div
                className="text-gray-300 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          )}

          {/* Resources */}
          {lesson.resources && (
            <div className="mt-8 border-t border-dark-600 pt-6">
              <h3 className="font-semibold text-white mb-3">Resources</h3>
              <div className="space-y-2">
                {(typeof lesson.resources === 'string' ? JSON.parse(lesson.resources) : lesson.resources).map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-cyber-500 hover:text-cyber-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {r.title || r.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
