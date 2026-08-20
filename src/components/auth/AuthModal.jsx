import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

const AuthModal = () => {
  const { authModalVisible, setAuthModalVisible, login, register } = useAuth();
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
    <Modal
      open={authModalVisible}
      onCancel={() => setAuthModalVisible(false)}
      footer={null}
      width={420}
      centered
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            margin: '0 auto 10px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          <ThunderboltFilled style={{ color: '#FFFFFF', fontSize: '24px' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F3F4F6', margin: 0 }}>
          LifeTracker 极客空间
        </h3>
        <Text style={{ fontSize: '12px', color: '#9CA3AF' }}>
          开启 3D 粒子星轨与高能自律审计
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: 'login',
            label: '用户登录',
            children: (
              <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名 (内置: demo)" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码 (内置: 123456)" />
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading} style={{ marginBottom: '10px' }}>
                  登录
                </Button>

                <Button
                  type="default"
                  block
                  onClick={handleDemoLogin}
                  loading={loading}
                  style={{
                    borderColor: '#10B981',
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.1)',
                  }}
                >
                  🚀 一键使用内置体验账号 (demo / 123456)
                </Button>
              </Form>
            ),
          },
          {
            key: 'register',
            label: '注册新用户',
            children: (
              <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, max: 20, message: '长度在 3~20 位' },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名 (仅支持字母/数字/下划线)" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, max: 32, message: '密码至少 6 位' },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="设置密码" />
                </Form.Item>

                <Form.Item name="nickname">
                  <Input prefix={<SmileOutlined />} placeholder="用户昵称 (选填)" />
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading}>
                  注册并自动登录
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default AuthModal;
