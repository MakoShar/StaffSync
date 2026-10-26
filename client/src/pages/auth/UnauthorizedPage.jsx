import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleReturn = () => {
    if (user?.role === 'HR') navigate('/app/hr/dashboard');
    else if (user?.role === 'Manager') navigate('/app/manager/dashboard');
    else navigate('/app/employee/dashboard');
  };

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          maxWidth: 480,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid #E2E8F0',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <LockPersonOutlinedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
          403 — Access Restricted
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          You do not have the required role or organization permission to access this resource. Please contact your system administrator if you believe this is an error.
        </Typography>
        <Button variant="contained" onClick={handleReturn}>
          Return to Permitted Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
