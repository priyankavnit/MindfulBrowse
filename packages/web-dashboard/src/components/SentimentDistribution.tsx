import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SentimentDistributionProps {
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const SentimentDistribution: React.FC<SentimentDistributionProps> = ({ distribution }) => {
  const data = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          distribution.positive * 100,
          distribution.neutral * 100,
          distribution.negative * 100,
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',  // Green for positive
          'rgba(158, 158, 158, 0.8)', // Gray for neutral
          'rgba(244, 67, 54, 0.8)',   // Red for negative
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(158, 158, 158, 1)',
          'rgba(244, 67, 54, 1)',
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
        Content Sentiment
      </Typography>
      <Box sx={{ maxWidth: { xs: 250, sm: 300 }, mx: 'auto', mt: 2 }}>
        <Pie data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default SentimentDistribution;
