import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDistributionProps {
  distribution: {
    news: number;
    social: number;
    entertainment: number;
    education: number;
    other: number;
  };
}

const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ distribution }) => {
  const data = {
    labels: ['News', 'Social', 'Entertainment', 'Education', 'Other'],
    datasets: [
      {
        data: [
          distribution.news * 100,
          distribution.social * 100,
          distribution.entertainment * 100,
          distribution.education * 100,
          distribution.other * 100,
        ],
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',  // Blue for news
          'rgba(156, 39, 176, 0.8)',  // Purple for social
          'rgba(255, 152, 0, 0.8)',   // Orange for entertainment
          'rgba(0, 150, 136, 0.8)',   // Teal for education
          'rgba(121, 85, 72, 0.8)',   // Brown for other
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(0, 150, 136, 1)',
          'rgba(121, 85, 72, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        Content Categories
      </Typography>
      <Box sx={{ maxWidth: { xs: 250, sm: 300 }, mx: 'auto', mt: 2 }}>
        <Pie data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default CategoryDistribution;
