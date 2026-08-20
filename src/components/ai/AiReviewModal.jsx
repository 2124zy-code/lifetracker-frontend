import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Tag, Spin, Row, Col, Typography, Card } from 'antd';
import { RobotOutlined, CheckCircleFilled, WarningFilled, RocketFilled, SyncOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { aiApi } from '../../api/aiApi';

const { Title, Paragraph, Text } = Typography;

const AiReviewModal = ({ visible, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getWeeklyReview();
      if (res.data) {
        setReport(res.data);
      }
    } catch (e) {
      console.error('Fetch AI review error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchReview();
    }
  }, [visible]);

  useEffect(() => {
    if (!report || !chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const radarData = [
      report.radar.energyVitality || 80,
      report.radar.deepFocus || 85,
      report.radar.scheduleRegularity || 75,
      report.radar.disciplineStreak || 80,
      report.radar.lifeBalance || 70,
    ];

    const option = {
      backgroundColor: 'transparent',
      radar: {
        indicator: [
          { name: '精力充沛度', max: 100 },
          { name: '深度专注力', max: 100 },
          { name: '作息规律度', max: 100 },
          { name: '自律坚韧度', max: 100 },
          { name: '生活平衡度', max: 100 },
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#9CA3AF',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(16, 185, 129, 0.03)', 'rgba(16, 185, 129, 0.08)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
      series: [
        {
          name: '精力透视',
          type: 'radar',
          data: [
            {
              value: radarData,
              name: '本周精力维度',
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: { color: '#10B981' },
              lineStyle: { width: 2, color: '#10B981' },
              areaStyle: { color: 'rgba(16, 185, 129, 0.35)' },
            },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [report]);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RobotOutlined style={{ color: '#10B981', fontSize: '20px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>AI 个人精力周度复盘</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="refresh" icon={<SyncOutlined />} onClick={fetchReview} loading={loading}>
          重新诊断
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          已阅并制定行动
        </Button>,
      ]}
      width={800}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="AI 正在深度解析您过去 7 天的时序精力与行为数据..." />
        </div>
      ) : report ? (
        <div>
          {/* 顶部评分与头衔 */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '2px' }}>AI 导师本周诊断评级:</div>
              <Title level={4} style={{ color: '#34D399', margin: 0 }}>
                {report.diagnosisTitle}
              </Title>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>综合自律指数</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#F59E0B', fontFamily: 'JetBrains Mono' }}>
                {report.overallScore} <span style={{ fontSize: '16px', color: '#9CA3AF' }}>/100</span>
              </div>
            </div>
          </div>

          <Row gutter={[20, 20]}>
            {/* 雷达图 */}
            <Col xs={24} md={11}>
              <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                <Text strong style={{ color: '#E2E8F0', fontSize: '13px' }}>
                  五维精力透视雷达
                </Text>
                <div ref={chartRef} style={{ width: '100%', height: '240px' }} />
              </div>
            </Col>

            {/* 核心总结与优势 */}
            <Col xs={24} md={13}>
              <Paragraph style={{ color: '#CBD5E1', fontSize: '13px', lineHeight: 1.6 }}>
                {report.summary}
              </Paragraph>

              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ color: '#34D399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <CheckCircleFilled /> 核心高光优势:
                </Text>
                {report.highlights?.map((h, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', paddingLeft: '16px' }}>
                    • {h}
                  </div>
                ))}
              </div>

              <div>
                <Text strong style={{ color: '#F59E0B', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <WarningFilled /> 潜在精力瓶颈预警:
                </Text>
                {report.bottlenecks?.map((b, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', paddingLeft: '16px' }}>
                    • {b}
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          {/* 下周落地建议 */}
          <div style={{ marginTop: '18px' }}>
            <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.7)' }}>
              <Text strong style={{ color: '#A78BFA', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <RocketFilled /> 下周落地行动建议 (Action Items):
              </Text>
              {report.actionRecommendations?.map((act, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Tag color="#1E1B4B" style={{ border: '1px solid #8B5CF6', color: '#C4B5FD', margin: 0, padding: '0 5px' }}>
                    0{i + 1}
                  </Tag>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6B7280' }}>
            <span>生成时间: {report.generatedAt}</span>
            <Tag color={report.isFallback ? 'default' : 'cyan'}>
              {report.isFallback ? '智能规则诊断' : 'AI 深度分析'}
            </Tag>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default AiReviewModal;
