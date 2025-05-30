// src/api/auth.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5001'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  verifySecurityQuestion: (data) => api.post('/verify-security', {
    username: data.username,
    security_answer: data.security_answer || '' // 添加默认空值
  }),
  resetPassword: (data) => api.post('/reset-password', data),
  logout: () => api.get('/logout'),
  apiUserProfile: (data) => api.put('/api/user/profile', data), // 更新用户信息
  uploadAudio: (data) => api.post('/upload/audio', data), // 上传用户音频
  apiUserSongs: (data) => api.get('/api/user/songs', data), // 获取用户歌曲列表
}

export default api