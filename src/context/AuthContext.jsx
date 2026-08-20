import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifetracker_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('lifetracker_token');
      if (token) {
        try {
          const res = await authApi.me();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('lifetracker_user', JSON.stringify(res.data));
          }
        } catch (e) {
          console.error('Failed to fetch user info:', e);
          localStorage.removeItem('lifetracker_token');
          localStorage.removeItem('lifetracker_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setAuthModalVisible(true);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res.data) {
      localStorage.setItem('lifetracker_token', res.data.token);
      const userInfo = {
        id: res.data.userId,
        username: res.data.username,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
      };
      localStorage.setItem('lifetracker_user', JSON.stringify(userInfo));
      setUser(userInfo);
      setAuthModalVisible(false);
      message.success(`欢迎回来，${userInfo.nickname || userInfo.username}！`);
      return userInfo;
    }
  };

  const register = async (username, password, nickname) => {
    const res = await authApi.register({ username, password, nickname });
    if (res.data) {
      localStorage.setItem('lifetracker_token', res.data.token);
      const userInfo = {
        id: res.data.userId,
        username: res.data.username,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
      };
      localStorage.setItem('lifetracker_user', JSON.stringify(userInfo));
      setUser(userInfo);
      setAuthModalVisible(false);
      message.success(`注册成功！已为您初始化 4 个自律习惯。`);
      return userInfo;
    }
  };

  const logout = () => {
    localStorage.removeItem('lifetracker_token');
    localStorage.removeItem('lifetracker_user');
    setUser(null);
    message.info('已退出登录');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        authModalVisible,
        setAuthModalVisible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
