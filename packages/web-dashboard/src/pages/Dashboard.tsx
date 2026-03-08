import React from 'react';
import { Box, Container, Typography, Button, AppBar, Toolbar, Grid, CircularProgress, Alert, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useInsights } from '../hooks/useInsights';
import {
  TotalTimeDisplay,
  SentimentDistribution,
  CategoryDistribution,
  DoomscrollAlert,
} from '../components';

const Dashboard: React.FC = () => {
  const { logout, userEmail } = useAuth();
  const { insights, loading, error, lastRefresh, refetch } = useInsights();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mindful Browse Dashboard
          </Typography>
          {userEmail && (
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {userEmail}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={2}
          gap={{ xs: 2, sm: 0 }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              Your Browsing Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Past 24 hours of browsing activity
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            {lastRefresh && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </Typography>
            )}
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              color="primary"
              aria-label="refresh insights"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {insights && !loading && (
          <>
            <DoomscrollAlert count={insights.doomscroll_sessions} />
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={6} lg={4}>
                <TotalTimeDisplay totalSeconds={insights.total_time_seconds} />
              </Grid>
              
              <Grid item xs={12} md={6} lg={4}>
                <SentimentDistribution distribution={insights.sentiment_distribution} />
              </Grid>
              
              <Grid item xs={12} md={6} lg={4}>
                <CategoryDistribution distribution={insights.category_distribution} />
              </Grid>
            </Grid>
          </>
        )}

        {!loading && !error && !insights && (
          <Alert severity="info">
            No browsing data available yet. Start browsing with the extension installed to see your insights.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
