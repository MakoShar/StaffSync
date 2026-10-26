import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

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
            backgroundColor: '#F1F5F9',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
          404 — Page Not Found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          The page or resource you are looking for does not exist or may have been relocated.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Sign In
        </Button>
      </Paper>
    </Box>
  );
}
