import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme, Row, Col, Card, Statistic, Tag, Spin } from 'antd';
import { ThunderboltFilled, FireFilled, FieldTimeOutlined, TrophyFilled } from '@ant-design/icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/navbar/Navbar';
import EnergySphere3D from './components/3d/EnergySphere3D';
import HabitDashboard from './components/habit/HabitDashboard';
import TimeBlockAudit from './components/timeblock/TimeBlockAudit';
import HeatmapMatrix from './components/heatmap/HeatmapMatrix';
import AiReviewModal from './components/ai/AiReviewModal';
import LoginPage from './pages/LoginPage';
import { statApi } from './api/statApi';

const MainDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    energyIndex: 0,
    todayFocusHours: 0,
    todayCompletedHabits: 0,
    todayTotalHabits: 0,
    totalLoggedCount: 0,
    maxCurrentStreak: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await statApi.getSummary();
      if (res.data) {
        setSummary(res.data);
      }
    } catch (e) {
      console.error('Fetch summary error:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSummary();
    }
  }, [user, refreshTrigger]);

  const handleDataChanged = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchSummary();
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Navbar
        energyIndex={summary?.energyIndex || 0}
        onOpenAiReview={() => setAiModalVisible(true)}
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* Top Hero: 个人自律能量场 + 4项核心数据看板 */}
        <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
          {/* 左侧：自律能量场 */}
          <Col xs={24} lg={10}>
            <div
              className="glass-panel glass-panel-glow"
              style={{
                padding: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#E2E8F0' }}>
                    🌌 个人自律能量场
                  </span>
                  <Tag color="#064E3B" style={{ border: '1px solid #10B981', color: '#34D399' }}>
                    动态自律状态
                  </Tag>
                </div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  根据您今日的打卡与专注时长动态呈现自律状态
                </div>
              </div>

              <EnergySphere3D energyIndex={summary?.energyIndex || 0} />

              <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>核心状态</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#34D399' }}>
                    {summary?.energyIndex >= 80 ? '极速心流 ⚡' : summary?.energyIndex >= 50 ? '稳健自律 🚀' : '能量蓄力 🌱'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>今日打卡履约</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>
                    {summary?.todayCompletedHabits} / {summary?.todayTotalHabits}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>今日专注时长</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#A78BFA' }}>
                    {summary?.todayFocusHours} 小时
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* 右侧：4 项核心自律指标看板 */}
          <Col xs={24} lg={14}>
            <Row gutter={[16, 16]} style={{ height: '100%' }}>
              <Col xs={12} sm={12} style={{ height: '50%' }}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Statistic
                    title={<span style={{ color: '#9CA3AF', fontSize: '13px' }}>自律能量指数 (Energy Index)</span>}
                    value={summary?.energyIndex || 0}
                    suffix={<span style={{ fontSize: '16px', color: '#9CA3AF' }}>/ 100</span>}
                    valueStyle={{ color: '#10B981', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '32px' }}
                    prefix={<ThunderboltFilled style={{ color: '#F59E0B', marginRight: '6px' }} />}
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                    综合打卡完成率与专注时长计算
                  </div>
                </Card>
              </Col>

              <Col xs={12} sm={12} style={{ height: '50%' }}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Statistic
                    title={<span style={{ color: '#9CA3AF', fontSize: '13px' }}>今日深度专注总时长</span>}
                    value={summary?.todayFocusHours || 0}
                    suffix={<span style={{ fontSize: '16px', color: '#9CA3AF' }}>小时</span>}
                    valueStyle={{ color: '#8B5CF6', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '32px' }}
                    prefix={<FieldTimeOutlined style={{ color: '#8B5CF6', marginRight: '6px' }} />}
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                    涵盖深度工作与学习充电时间
                  </div>
                </Card>
              </Col>

              <Col xs={12} sm={12} style={{ height: '50%' }}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Statistic
                    title={<span style={{ color: '#9CA3AF', fontSize: '13px' }}>当前最高习惯连击 (Streak)</span>}
                    value={summary?.maxCurrentStreak || 0}
                    suffix={<span style={{ fontSize: '16px', color: '#9CA3AF' }}>天</span>}
                    valueStyle={{ color: '#F59E0B', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '32px' }}
                    prefix={<FireFilled style={{ color: '#EF4444', marginRight: '6px' }} />}
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                    连续每日坚持打卡天数
                  </div>
                </Card>
              </Col>

              <Col xs={12} sm={12} style={{ height: '50%' }}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Statistic
                    title={<span style={{ color: '#9CA3AF', fontSize: '13px' }}>历史累计签到总次数</span>}
                    value={summary?.totalLoggedCount || 0}
                    suffix={<span style={{ fontSize: '16px', color: '#9CA3AF' }}>次</span>}
                    valueStyle={{ color: '#3B82F6', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '32px' }}
                    prefix={<TrophyFilled style={{ color: '#3B82F6', marginRight: '6px' }} />}
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                    历史累计完成签到总次数
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Section 1: 习惯打卡矩阵 */}
        <HabitDashboard
          refreshTrigger={refreshTrigger}
          onDataChanged={handleDataChanged}
        />

        {/* Section 2: 24 小时时间流向审计器 */}
        <TimeBlockAudit
          onDataChanged={handleDataChanged}
        />

        {/* Section 3: 365 天发光热力图矩阵 */}
        <HeatmapMatrix
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* AI 复盘诊断弹窗 */}
      <AiReviewModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="正在进入 LifeTracker 空间..." />
      </div>
    );
  }

  return user ? <MainDashboard /> : <LoginPage />;
};

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#10B981',
          colorBgBase: '#0A0E1A',
          colorBgContainer: '#131C2E',
          colorBgElevated: '#1A2438',
          colorBorder: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
}
