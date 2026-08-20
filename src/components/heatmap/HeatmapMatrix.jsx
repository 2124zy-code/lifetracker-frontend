import React, { useState, useEffect } from 'react';
import { Card, Tooltip, Select, Spin, Tag } from 'antd';
import { FireOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { statApi } from '../../api/statApi';
import dayjs from 'dayjs';

const HeatmapMatrix = ({ refreshTrigger }) => {
  const [year, setYear] = useState(dayjs().year());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHeatmap = async (targetYear) => {
    setLoading(true);
    try {
      const res = await statApi.getHeatmap(targetYear);
      if (res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Fetch heatmap error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap(year);
  }, [year, refreshTrigger]);

  // 按周将 365 天组织为 53 列 x 7 行 (周日~周六)
  const renderGrid = () => {
    if (!data || !data.days || data.days.length === 0) return null;

    const weeks = [];
    let currentWeek = [];

    // 计算第一天是星期几 (0 = 周日, 1 = 周一, ...)
    const firstDay = dayjs(data.days[0].date);
    const startDayOfWeek = firstDay.day();

    // 填充第一周前面的空白
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    data.days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return (
      <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '10px' }}>
        {weeks.map((week, wIdx) => (
          <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day, dIdx) => {
              if (!day) {
                return (
                  <div
                    key={dIdx}
                    style={{ width: '13px', height: '13px', visibility: 'hidden' }}
                  />
                );
              }

              const tooltipContent = (
                <div style={{ fontSize: '12px', padding: '2px 4px' }}>
                  <div style={{ fontWeight: 600, color: '#10B981', marginBottom: '4px' }}>
                    {day.date}
                  </div>
                  <div>打卡进度: {day.completedHabits} / {day.totalHabits} 个</div>
                  <div>专注时长: {day.focusHours} 小时</div>
                  <div>综合活力: {day.score} 分 (阶梯 {day.level})</div>
                </div>
              );

              return (
                <Tooltip key={dIdx} title={tooltipContent} placement="top" mouseEnterDelay={0.05}>
                  <div className={`heatmap-cell level-${day.level}`} />
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined style={{ color: '#10B981', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>365 天自律打卡热力图</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Select
              value={year}
              onChange={setYear}
              size="small"
              options={[
                { value: 2026, label: '2026 年度' },
                { value: 2025, label: '2025 年度' },
                { value: 2024, label: '2024 年度' },
              ]}
              style={{ width: 110 }}
            />
          </div>
        </div>
      }
      style={{ width: '100%', marginBottom: '20px' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="正在聚合年度热力图数据..." />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Tag color="#064E3B" style={{ border: '1px solid #10B981', padding: '4px 10px', fontSize: '13px' }}>
              <FireOutlined style={{ color: '#10B981', marginRight: '5px' }} />
              年度活跃天数: <strong style={{ color: '#34D399' }}>{data?.totalActiveDays || 0}</strong> 天
            </Tag>
            <Tag color="#1E1B4B" style={{ border: '1px solid #8B5CF6', padding: '4px 10px', fontSize: '13px' }}>
              <TrophyOutlined style={{ color: '#A78BFA', marginRight: '5px' }} />
              最长自律连击: <strong style={{ color: '#C4B5FD' }}>{data?.maxStreak || 0}</strong> 天
            </Tag>
          </div>

          {renderGrid()}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              marginTop: '12px',
              fontSize: '11px',
              color: '#9CA3AF',
            }}
          >
            <span>低活跃</span>
            <div className="heatmap-cell level-0" />
            <div className="heatmap-cell level-1" />
            <div className="heatmap-cell level-2" />
            <div className="heatmap-cell level-3" />
            <div className="heatmap-cell level-4" />
            <span>极高活跃 🔥</span>
          </div>
        </>
      )}
    </Card>
  );
};

export default HeatmapMatrix;
