import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TotalTimeDisplayProps {
  totalSeconds: number;
}

const TotalTimeDisplay: React.FC<TotalTimeDisplayProps> = ({ totalSeconds }) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <AccessTimeIcon color="primary" />
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Total Browsing Time
        </Typography>
      </Box>
      <Typography 
        variant="h3" 
        component="div"
        sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
      >
        {hours}h {minutes}m
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        Past 24 hours
      </Typography>
    </Paper>
  );
};

export default TotalTimeDisplay;
