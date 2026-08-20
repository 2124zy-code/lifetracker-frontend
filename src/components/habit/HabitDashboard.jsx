import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, Row, Col, Progress, Tag, Popconfirm, message, Spin, Empty } from 'antd';
import { PlusOutlined, FireFilled, CheckOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, ReloadOutlined } from '@ant-design/icons';
import confetti from 'canvas-confetti';
import { habitApi } from '../../api/habitApi';

const PRESET_ICONS = ['🌅', '💻', '🏋️', '📖', '💧', '🧘', '🎯', '🥗', '⚡', '🚴'];
const PRESET_COLORS = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const HabitDashboard = ({ refreshTrigger, onDataChanged }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form] = Form.useForm();

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await habitApi.getList();
      if (res.data) {
        setHabits(res.data);
      }
    } catch (e) {
      console.error('Fetch habits error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [refreshTrigger]);

  const handleToggle = async (habit) => {
    try {
      const res = await habitApi.toggle(habit.id);
      if (res.data) {
        if (res.data.isLogged) {
          // 触发撒花庆祝
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.75 },
            colors: ['#10B981', '#34D399', '#F59E0B', '#8B5CF6'],
          });
        }
        message.success(res.message || (res.data.isLogged ? '打卡成功！' : '已取消打卡'));
        fetchHabits();
        if (onDataChanged) onDataChanged();
      }
    } catch (e) {
      console.error('Toggle habit error:', e);
    }
  };

  const handleOpenCreate = () => {
    setEditingHabit(null);
    form.resetFields();
    form.setFieldsValue({
      icon: '🔥',
      color: '#10B981',
      targetDays: 7,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    form.setFieldsValue({
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      targetDays: habit.targetDays,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingHabit) {
        await habitApi.update(editingHabit.id, values);
        message.success('习惯已更新！');
      } else {
        await habitApi.create(values);
        message.success('新习惯创建成功！');
      }
      setIsModalOpen(false);
      fetchHabits();
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error('Submit habit error:', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await habitApi.delete(id);
      message.success('习惯已删除');
      fetchHabits();
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error('Delete habit error:', e);
    }
  };

  const handleInjectDemo = async () => {
    try {
      await habitApi.injectDemo();
      message.success('已注入 30 天丰富体验数据！热力图与连击已生成');
      fetchHabits();
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error('Inject demo error:', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      await habitApi.resetDemo();
      message.info('数据已成功重置');
      fetchHabits();
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error('Reset demo error:', e);
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FireFilled style={{ color: '#F59E0B', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>自律习惯矩阵与连击</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="default"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={handleInjectDemo}
              style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
            >
              一键注入演示数据
            </Button>
            <Popconfirm title="确认清空所有打卡与时间块记录？" onConfirm={handleResetDemo}>
              <Button size="small" icon={<ReloadOutlined />} style={{ color: '#9CA3AF' }}>
                重置数据
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
            >
              新增习惯
            </Button>
          </div>
        </div>
      }
      style={{ width: '100%', marginBottom: '20px' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="正在加载自律习惯..." />
        </div>
      ) : habits.length === 0 ? (
        <Empty description="暂无习惯，点击右上角【新增习惯】或【一键注入演示数据】开启自律之旅" />
      ) : (
        <Row gutter={[16, 16]}>
          {habits.map((habit) => {
            const isLogged = habit.isLoggedToday;
            const weekRate = Math.min(100, Math.round((habit.weekCompletedDays / (habit.targetDays || 7)) * 100));

            return (
              <Col xs={24} sm={12} lg={6} key={habit.id}>
                <div
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    position: 'relative',
                    borderLeft: `4px solid ${habit.color || '#10B981'}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* 顶部：图标、名称与操作 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{habit.icon}</span>
                        <strong style={{ fontSize: '15px', color: '#F3F4F6' }}>{habit.name}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined style={{ color: '#9CA3AF' }} />}
                          onClick={() => handleOpenEdit(habit)}
                        />
                        <Popconfirm title="确认删除该习惯？" onConfirm={() => handleDelete(habit.id)}>
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined style={{ color: '#EF4444' }} />}
                          />
                        </Popconfirm>
                      </div>
                    </div>

                    {/* 连击与总打卡天数 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Tag
                        color={habit.currentStreak > 0 ? '#064E3B' : '#1F2937'}
                        style={{
                          border: `1px solid ${habit.currentStreak > 0 ? '#10B981' : '#374151'}`,
                          color: habit.currentStreak > 0 ? '#34D399' : '#9CA3AF',
                          fontWeight: 600,
                        }}
                      >
                        <FireFilled style={{ color: habit.currentStreak > 0 ? '#F59E0B' : '#6B7280', marginRight: '4px' }} />
                        {habit.currentStreak} 天连击
                      </Tag>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        累计: {habit.totalLoggedDays} 天
                      </span>
                    </div>

                    {/* 周目标进度条 */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
                        <span>本周完成: {habit.weekCompletedDays}/{habit.targetDays} 天</span>
                        <span>{weekRate}%</span>
                      </div>
                      <Progress
                        percent={weekRate}
                        showInfo={false}
                        strokeColor={habit.color || '#10B981'}
                        trailColor="rgba(255, 255, 255, 0.08)"
                        size="small"
                      />
                    </div>
                  </div>

                  {/* 底部打卡按钮 */}
                  <Button
                    type={isLogged ? 'default' : 'primary'}
                    block
                    icon={isLogged ? <CheckOutlined /> : <FireFilled />}
                    onClick={() => handleToggle(habit)}
                    style={{
                      background: isLogged ? 'rgba(16, 185, 129, 0.15)' : undefined,
                      borderColor: isLogged ? '#10B981' : undefined,
                      color: isLogged ? '#10B981' : '#FFFFFF',
                      fontWeight: 600,
                    }}
                  >
                    {isLogged ? '今日已打卡 ✓' : '今日签到打卡'}
                  </Button>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* 创建 / 编辑习惯弹窗 */}
      <Modal
        title={editingHabit ? '编辑自律习惯' : '创建新自律习惯'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            name="name"
            label="习惯名称"
            rules={[{ required: true, message: '请输入习惯名称' }]}
          >
            <Input placeholder="如: 晨间有氧跑步 30 分钟" />
          </Form.Item>

          <Form.Item label="选择 Emoji 图标" name="icon">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {PRESET_ICONS.map((emoji) => (
                <Button
                  key={emoji}
                  size="small"
                  onClick={() => form.setFieldsValue({ icon: emoji })}
                >
                  {emoji}
                </Button>
              ))}
            </div>
            <Input placeholder="自定义 Emoji" style={{ width: 120 }} />
          </Form.Item>

          <Form.Item label="主题颜色" name="color">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {PRESET_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => form.setFieldsValue({ color: c })}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    cursor: 'pointer',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>
            <Input placeholder="#10B981" style={{ width: 120 }} />
          </Form.Item>

          <Form.Item
            name="targetDays"
            label="每周目标天数 (1~7 天)"
            rules={[{ required: true, message: '请输入每周目标天数' }]}
          >
            <InputNumber min={1} max={7} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default HabitDashboard;
