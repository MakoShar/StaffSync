import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { trainingService } from '../../services/trainingService';

export default function MyTrainingsPage() {
  const navigate = useNavigate();
  const { employee } = useSelector((state) => state.auth);
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawId, setWithdrawId] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchEnrolled = async () => {
    setIsLoading(true);
    try {
      const res = await trainingService.getTrainings();
      // Filter sessions where current employee is enrolled
      const enrolled = res.data.filter((t) =>
        t.enrolledEmployees?.some((e) => (e._id ? e._id === employee?._id : e === employee?._id))
      );
      setTrainings(enrolled);
    } catch (err) {
      console.error('Failed to load my trainings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolled();
  }, [employee]);

  const handleWithdraw = async (trainingId) => {
    setWithdrawId(trainingId);
    try {
      await trainingService.withdrawTraining(trainingId);
      setNotification({ open: true, message: 'Withdrawn from training session.', severity: 'info' });
      fetchEnrolled();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to withdraw',
        severity: 'error',
      });
    } finally {
      setWithdrawId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Training Programs"
        subtitle="Manage your enrolled skill workshops and track upcoming development sessions."
        action={
          <Button variant="contained" onClick={() => navigate('/app/trainings')}>
            Browse Catalog
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading your enrolled programs..." />
      ) : trainings.length === 0 ? (
        <EmptyState
          title="No Enrolled Programs"
          description="You are not registered for any upcoming training courses."
          actionLabel="Explore Training Catalog"
          onAction={() => navigate('/app/trainings')}
          icon={SchoolOutlinedIcon}
        />
      ) : (
        <Grid container spacing={3}>
          {trainings.map((t) => (
            <Grid item xs={12} md={6} key={t._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', borderRadius: 3 }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {t.title}
                    </Typography>
                    <StatusChip status={t.status} size="small" />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {t.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonOutlineIcon fontSize="small" sx={{ color: '#64748B' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Instructor: {t.instructor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Schedule: {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={withdrawId === t._id}
                    onClick={() => handleWithdraw(t._id)}
                  >
                    {withdrawId === t._id ? 'Processing...' : 'Withdraw Enrollment'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
