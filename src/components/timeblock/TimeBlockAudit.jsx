import React, { useState, useEffect, useRef } from 'react';
import { Card, DatePicker, Button, Tag, Input, Row, Col, Spin, message, Typography } from 'antd';
import { FieldTimeOutlined, SaveOutlined, PieChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { timeblockApi } from '../../api/timeblockApi';
import dayjs from 'dayjs';

const { Text } = Typography;

const CATEGORIES = [
  { key: 'WORK', name: '深度工作', color: '#8B5CF6', emoji: '🟣' },
  { key: 'STUDY', name: '学习充电', color: '#3B82F6', emoji: '🔵' },
  { key: 'SPORT', name: '运动健身', color: '#10B981', emoji: '🟢' },
  { key: 'REST', name: '休闲放松', color: '#F59E0B', emoji: '🟡' },
  { key: 'SLEEP', name: '睡眠休息', color: '#6366F1', emoji: '💤' },
  { key: 'EMPTY', name: '清空未分配', color: '#1E293B', emoji: '⬜' },
];

const TimeBlockAudit = ({ onDataChanged }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [blocks, setBlocks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [categoryStats, setCategoryStats] = useState([]);
  const [focusHours, setFocusHours] = useState(0);
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchBlocks = async (date) => {
    setLoading(true);
    try {
      const res = await timeblockApi.getDayBlocks(date);
      if (res.data) {
        setBlocks(res.data.blocks || []);
        setCategoryStats(res.data.categoryStats || []);
        setFocusHours(res.data.totalFocusHours || 0);
        setSelectedIndices(new Set());
      }
    } catch (e) {
      console.error('Fetch timeblocks error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks(selectedDate);
  }, [selectedDate]);

  // 初始化与更新 ECharts 极坐标玫瑰图
  useEffect(() => {
    if (!chartRef.current || categoryStats.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chartData = categoryStats
      .filter((s) => s.blockCount > 0)
      .map((s) => ({
        value: s.totalHours,
        name: s.categoryName,
        itemStyle: { color: s.color },
      }));

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 小时 ({d}%)',
        backgroundColor: '#1E293B',
        borderColor: '#334155',
        textStyle: { color: '#F3F4F6' },
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: { color: '#9CA3AF', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name: '时间流向',
          type: 'pie',
          radius: ['35%', '68%'],
          center: ['50%', '42%'],
          roseType: 'radius',
          itemStyle: {
            borderRadius: 6,
            borderColor: '#0B0F19',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          data: chartData.length > 0 ? chartData : [{ value: 24, name: '未记录', itemStyle: { color: '#334155' } }],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [categoryStats]);

  // 处理单元格点击/滑动选择
  const handleBlockMouseDown = (index, e) => {
    setIsMouseDown(true);
    setSelectedIndices((prev) => {
      const next = new Set(e.ctrlKey || e.metaKey ? prev : []);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleBlockMouseEnter = (index) => {
    if (isMouseDown) {
      setSelectedIndices((prev) => new Set([...prev, index]));
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // 批量应用分类
  const handleApplyCategory = async (categoryKey) => {
    if (selectedIndices.size === 0) {
      message.warning('请先点击或框选需要归类的时间块格子');
      return;
    }

    const targetCategory = CATEGORIES.find((c) => c.key === categoryKey);
    const updatedBlocks = blocks.map((b) => {
      if (selectedIndices.has(b.blockIndex)) {
        return {
          ...b,
          category: categoryKey,
          categoryName: targetCategory.name,
          color: targetCategory.color,
          note: noteInput.trim() || b.note || '',
        };
      }
      return b;
    });

    setBlocks(updatedBlocks);

    // 提交到后端
    const payload = Array.from(selectedIndices).map((idx) => ({
      blockIndex: idx,
      category: categoryKey,
      note: noteInput.trim(),
    }));

    try {
      const res = await timeblockApi.saveBatch(selectedDate, payload);
      if (res.data) {
        setBlocks(res.data.blocks);
        setCategoryStats(res.data.categoryStats);
        setFocusHours(res.data.totalFocusHours);
        setSelectedIndices(new Set());
        setNoteInput('');
        message.success(`已成功更新 ${payload.length} 个时间块！`);
        if (onDataChanged) onDataChanged();
      }
    } catch (e) {
      console.error('Save timeblocks error:', e);
    }
  };

  const selectAll = () => {
    const all = new Set();
    for (let i = 0; i < 48; i++) all.add(i);
    setSelectedIndices(all);
  };

  const clearSelection = () => {
    setSelectedIndices(new Set());
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FieldTimeOutlined style={{ color: '#8B5CF6', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>24 小时时间流向审计</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={(d) => setSelectedDate(d ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
              allowClear={false}
              size="small"
              style={{ width: 130 }}
            />
          </div>
        </div>
      }
      style={{ width: '100%', marginBottom: '20px' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="正在加载时间块流向数据..." />
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {/* 左侧：48 格时间块交互网格 */}
          <Col xs={24} lg={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  已选 <strong style={{ color: '#10B981' }}>{selectedIndices.size}</strong> 个时间片
                  （支持鼠标连续拖选或按住 Ctrl 多选）
                </Text>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="small" onClick={selectAll} style={{ fontSize: '12px' }}>
                  全选
                </Button>
                <Button size="small" onClick={clearSelection} style={{ fontSize: '12px' }}>
                  取消选择
                </Button>
              </div>
            </div>

            {/* 48 格网格 (分为 4 个时间段：凌晨、上午、下午、夜晚) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '4px',
                marginBottom: '16px',
              }}
            >
              {blocks.map((b) => {
                const isSelected = selectedIndices.has(b.blockIndex);
                return (
                  <div
                    key={b.blockIndex}
                    className={`timeblock-item ${isSelected ? 'selected' : ''}`}
                    style={{
                      backgroundColor: b.color || '#1E293B',
                      color: '#FFFFFF',
                    }}
                    onMouseDown={(e) => handleBlockMouseDown(b.blockIndex, e)}
                    onMouseEnter={() => handleBlockMouseEnter(b.blockIndex)}
                    title={`${b.timeRange} - ${b.categoryName}${b.note ? ` (${b.note})` : ''}`}
                  >
                    <span>{b.timeRange.split(' - ')[0]}</span>
                  </div>
                );
              })}
            </div>

            {/* 分类打标工具栏 */}
            <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>
                ⚡ 快捷分类打标:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {CATEGORIES.map((c) => (
                  <Button
                    key={c.key}
                    size="small"
                    style={{
                      backgroundColor: c.color,
                      borderColor: c.color,
                      color: '#FFFFFF',
                      fontWeight: 500,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                    onClick={() => handleApplyCategory(c.key)}
                  >
                    {c.emoji} {c.name}
                  </Button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  size="small"
                  placeholder="可选填写行为备注 (如: 项目核心代码重构、跑步5km...)"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  style={{ background: '#0F172A', borderColor: '#334155' }}
                />
              </div>
            </div>
          </Col>

          {/* 右侧：极坐标流向统计玫瑰图 */}
          <Col xs={24} lg={8}>
            <div className="glass-panel" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0' }}>
                  <PieChartOutlined style={{ color: '#8B5CF6', marginRight: '6px' }} />
                  时间流向分布
                </span>
                <Tag color="#1E1B4B" style={{ border: '1px solid #8B5CF6' }}>
                  专注: <strong style={{ color: '#C4B5FD' }}>{focusHours}h</strong>
                </Tag>
              </div>

              <div ref={chartRef} style={{ width: '100%', height: '240px', flex: 1 }} />
            </div>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default TimeBlockAudit;
