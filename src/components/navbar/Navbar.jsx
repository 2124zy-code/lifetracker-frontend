import React, { useState, useEffect } from 'react';
import { Button, Avatar, Dropdown, Tag, Typography } from 'antd';
import { RobotOutlined, UserOutlined, LogoutOutlined, ThunderboltFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const Navbar = ({ energyIndex = 80, onOpenAiReview }) => {
  const { user, logout, setAuthModalVisible } = useAuth();
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <strong>{user?.nickname || user?.username}</strong>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>@{user?.username}</div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header
      className="glass-panel"
      style={{
        margin: '16px auto',
        maxWidth: '1400px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: '16px',
        zIndex: 100,
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
          }}
        >
          <ThunderboltFilled style={{ color: '#FFFFFF', fontSize: '20px' }} />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#F3F4F6' }}>Life</span>
            <span style={{ color: '#10B981' }}>Tracker</span>
          </div>
          <div style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.5px' }}>
            个人时间审计与习惯管理平台
          </div>
        </div>
      </div>

      {/* Center: Live Clock & Energy Index */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '12px', fontFamily: 'JetBrains Mono' }}>
          <ClockCircleOutlined />
          <span>{currentTime}</span>
        </div>

        <Tag
          color="#064E3B"
          style={{
            border: '1px solid #10B981',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
          }}
        >
          <ThunderboltFilled style={{ color: '#F59E0B' }} />
          今日能量指数: <strong style={{ color: '#34D399' }}>{energyIndex}</strong>
        </Tag>
      </div>

      {/* Right: AI Review & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          type="primary"
          icon={<RobotOutlined />}
          onClick={onOpenAiReview}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
          }}
        >
          AI 每周精力诊断
        </Button>

        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Avatar
                src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username}
                style={{ border: '2px solid #10B981' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F3F4F6' }}>
                {user.nickname || user.username}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Button type="default" icon={<UserOutlined />} onClick={() => setAuthModalVisible(true)}>
            登录 / 体验
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
