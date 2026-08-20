import axios from 'axios';
import { message } from 'antd';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动注入 JWT Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifetracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一解包与错误提示
client.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code && res.code !== 200) {
      if (res.code === 401) {
        localStorage.removeItem('lifetracker_token');
        localStorage.removeItem('lifetracker_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      message.error(res.message || '操作失败');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '网络连接异常，请检查后端服务';
    message.error(msg);
    return Promise.reject(error);
  }
);

export default client;
