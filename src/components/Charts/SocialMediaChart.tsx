import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { SocialMediaReport } from '../../services/supabase'

interface SocialMediaChartProps {
  data: SocialMediaReport[]
  chartType: 'line' | 'bar'
}

const SocialMediaChart: React.FC<SocialMediaChartProps> = ({ data, chartType }) => {
  const chartData = data.map(item => ({
    month: item.month,
    takipci: item.follower_count,
    gonderi: item.post_count
  }))

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sosyal Medya Trendleri</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="takipci" stroke="#8884d8" name="Takipçi Sayısı" />
            <Line type="monotone" dataKey="gonderi" stroke="#82ca9d" name="Gönderi Sayısı" />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="takipci" fill="#8884d8" name="Takipçi Sayısı" />
            <Bar dataKey="gonderi" fill="#82ca9d" name="Gönderi Sayısı" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default SocialMediaChart 