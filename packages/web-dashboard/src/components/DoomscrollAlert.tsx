import React from 'react';
import { Box, Typography, Alert, AlertTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DoomscrollAlertProps {
  count: number;
}

const DoomscrollAlert: React.FC<DoomscrollAlertProps> = ({ count }) => {
  if (count === 0) {
    return null;
  }

  return (
    <Box mb={3}>
      <Alert 
        severity="warning" 
        icon={<WarningAmberIcon />}
        sx={{ 
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderLeft: '4px solid #ff9800',
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
          Doomscroll Sessions Detected
        </AlertTitle>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {count} {count === 1 ? 'session' : 'sessions'} of prolonged negative content consumption in the past 24 hours.
        </Typography>
      </Alert>
    </Box>
  );
};

export default DoomscrollAlert;
