import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../features/auth/authSlice';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated && user) {
      if (user.role === 'HR') navigate('/app/hr/dashboard', { replace: true });
      else if (user.role === 'Manager') navigate('/app/manager/dashboard', { replace: true });
      else navigate('/app/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(clearError());
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Sign In
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter your authorized organization credentials to access your dashboard.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Corporate Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="medium"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="medium"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || !email || !password}
          sx={{ py: 1.25, fontWeight: 700 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to StaffSync'}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          QUICK DEMO ACCOUNTS
        </Typography>
      </Divider>

      <Stack spacing={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleDemoFill('admin@staffsync.internal', 'AdminStaffSync2026!')}
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            borderColor: '#E2E8F0',
            color: '#334155',
            '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
          }}
        >
          <span>HR Administrator</span>
          <Chip label="HR Role" size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#EDE9FE', color: '#6D28D9' }} />
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={() => handleDemoFill('manager@staffsync.internal', 'ManagerStaffSync2026!')}
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            borderColor: '#E2E8F0',
            color: '#334155',
            '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
          }}
        >
          <span>Sarah Connor</span>
          <Chip label="Manager Role" size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#E0F2FE', color: '#0284C7' }} />
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={() => handleDemoFill('employee@staffsync.internal', 'EmployeeStaffSync2026!')}
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            borderColor: '#E2E8F0',
            color: '#334155',
            '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
          }}
        >
          <span>Alex Rivers</span>
          <Chip label="Employee Role" size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#F1F5F9', color: '#475569' }} />
        </Button>
      </Stack>
    </Box>
  );
}
