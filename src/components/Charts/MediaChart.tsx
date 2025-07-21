import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MediaReport } from '../../services/supabase'

interface MediaChartProps {
  data: MediaReport[]
}

const MediaChart: React.FC<MediaChartProps> = ({ data }) => {
  const statusCount = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(statusCount).map(([status, count]) => ({
    name: status === 'olumlu' ? 'Olumlu' : status === 'olumsuz' ? 'Olumsuz' : 'Kritik',
    value: count,
    color: status === 'olumlu' ? '#22c55e' : status === 'olumsuz' ? '#f59e0b' : '#ef4444'
  }))

  const COLORS = chartData.map(item => item.color)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Basın Haberleri Durum Dağılımı</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 mb-2">Son Haberler</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="text-sm border-l-4 pl-3" style={{borderColor: item.status === 'olumlu' ? '#22c55e' : item.status === 'olumsuz' ? '#f59e0b' : '#ef4444'}}>
              <div className="font-medium">{item.news_topic}</div>
              <div className="text-gray-600">{item.month} - {item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MediaChart 