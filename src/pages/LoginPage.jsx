import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined, ThunderboltFilled, CheckCircleFilled, FireOutlined, FieldTimeOutlined, CalendarOutlined, RobotOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import EnergySphere3D from '../components/3d/EnergySphere3D';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await register(values.username, values.password, values.nickname);
    } catch (e) {
      console.error('Register error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo', '123456');
    } catch (e) {
      console.error('Demo login error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '960px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.85)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
      >
        {/* 左侧：品牌与沉浸式 3D 视觉展示 */}
        <div
          style={{
            padding: '36px 32px',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
                }}
              >
                <ThunderboltFilled style={{ color: '#FFFFFF', fontSize: '22px' }} />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  <span style={{ color: '#F3F4F6' }}>Life</span>
                  <span style={{ color: '#10B981' }}>Tracker</span>
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  个人时间审计与习惯管理平台
                </div>
              </div>
            </div>

            <Title level={3} style={{ color: '#F3F4F6', fontWeight: 700, margin: '0 0 10px 0', fontSize: '22px' }}>
              掌控时间流向 · 重塑自律习惯
            </Title>
            <Paragraph style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
              记录每日专注时间块，沉淀原子习惯签到，获取智能精力分析报告。
            </Paragraph>

            {/* 3D 能量球 */}
            <div
              style={{
                height: '190px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px 0',
              }}
            >
              <EnergySphere3D energyIndex={88} />
            </div>
          </div>

          {/* 4 项核心功能特性 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
              <CheckCircleFilled style={{ color: '#10B981', fontSize: '14px' }} />
              <span>原子习惯打卡</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
              <CheckCircleFilled style={{ color: '#8B5CF6', fontSize: '14px' }} />
              <span>时间流向审计</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
              <CheckCircleFilled style={{ color: '#F59E0B', fontSize: '14px' }} />
              <span>年度自律热力图</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#3B82F6', }}>
              <CheckCircleFilled style={{ color: '#3B82F6', fontSize: '14px' }} />
              <span>周度精力智能诊断</span>
            </div>
          </div>
        </div>

        {/* 右侧：登录与注册表单 */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F3F4F6', margin: '0 0 6px 0' }}>
              {activeTab === 'login' ? '欢迎回来' : '创建新账号'}
            </h3>
            <Text style={{ fontSize: '12px', color: '#9CA3AF' }}>
              {activeTab === 'login' ? '输入账号密码进入控制台' : '注册即刻初始化 4 项经典习惯模板'}
            </Text>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: <span style={{ fontSize: '14px', padding: '0 12px' }}>账号登录</span>,
                children: (
                  <Form form={loginForm} layout="vertical" onFinish={handleLogin} style={{ marginTop: '12px' }}>
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input
                        size="large"
                        prefix={<UserOutlined style={{ color: '#10B981' }} />}
                        placeholder="用户名 (内置体验: demo)"
                        style={{ background: '#0B1120', borderColor: '#334155' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password
                        size="large"
                        prefix={<LockOutlined style={{ color: '#10B981' }} />}
                        placeholder="密码 (内置密码: 123456)"
                        style={{ background: '#0B1120', borderColor: '#334155' }}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      style={{ height: '42px', fontSize: '14px', marginBottom: '12px' }}
                    >
                      登 录
                    </Button>

                    <Button
                      type="default"
                      size="large"
                      block
                      onClick={handleDemoLogin}
                      loading={loading}
                      style={{
                        height: '42px',
                        borderColor: '#10B981',
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      🚀 一键体验内置账号 (demo / 123456)
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: <span style={{ fontSize: '14px', padding: '0 12px' }}>免费注册</span>,
                children: (
                  <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: '12px' }}>
                    <Form.Item
                      name="username"
                      rules={[
                        { required: true, message: '请输入用户名' },
                        { min: 3, max: 20, message: '长度在 3~20 位' },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<UserOutlined style={{ color: '#10B981' }} />}
                        placeholder="用户名 (字母/数字/下划线)"
                        style={{ background: '#0B1120', borderColor: '#334155' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: '请输入密码' },
                        { min: 6, max: 32, message: '密码至少 6 位' },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        prefix={<LockOutlined style={{ color: '#10B981' }} />}
                        placeholder="设置密码"
                        style={{ background: '#0B1120', borderColor: '#334155' }}
                      />
                    </Form.Item>

                    <Form.Item name="nickname">
                      <Input
                        size="large"
                        prefix={<SmileOutlined style={{ color: '#10B981' }} />}
                        placeholder="昵称 (选填)"
                        style={{ background: '#0B1120', borderColor: '#334155' }}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      style={{ height: '42px', fontSize: '14px' }}
                    >
                      注册并自动登录
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
