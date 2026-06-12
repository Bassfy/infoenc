import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        processQueue(error);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        return api(original);
      } catch (err) {
        processQueue(err);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const coursesAPI = {
  list: (params) => api.get('/courses', { params }),
  get: (slug) => api.get(`/courses/${slug}`),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getLesson: (lessonId) => api.get(`/courses/lesson/${lessonId}`),
  completeLesson: (lessonId) => api.post(`/courses/lesson/${lessonId}/complete`),
  getMyCourses: () => api.get('/courses/my'),
  getCategories: () => api.get('/courses/categories'),
};

export const labsAPI = {
  list: (params) => api.get('/labs', { params }),
  get: (slug) => api.get(`/labs/${slug}`),
  submitFlag: (slug, flag) => api.post(`/labs/${slug}/submit`, { flag }),
  getHint: (slug, index) => api.get(`/labs/${slug}/hint`, { params: { index } }),
  getLeaderboard: (params) => api.get('/labs/leaderboard', { params }),
};

export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationsRead: () => api.put('/users/notifications/read'),
};

export default api;
