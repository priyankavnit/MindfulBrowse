import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to initiate login:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Mindful Browse
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Sign in to view your browsing insights and wellness metrics
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={isLoading}
            fullWidth
            sx={{ maxWidth: 300 }}
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
