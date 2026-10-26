import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { trainingService } from '../../services/trainingService';

export default function TrainingsCatalogPage() {
  const { employee } = useSelector((state) => state.auth);
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const res = await trainingService.getTrainings();
      setTrainings(res.data);
    } catch (err) {
      console.error('Failed to load trainings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleEnroll = async (trainingId) => {
    setActionLoadingId(trainingId);
    try {
      await trainingService.enrollTraining(trainingId);
      setNotification({ open: true, message: 'Successfully enrolled in training program!', severity: 'success' });
      fetchTrainings();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to enroll',
        severity: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleWithdraw = async (trainingId) => {
    setActionLoadingId(trainingId);
    try {
      await trainingService.withdrawTraining(trainingId);
      setNotification({ open: true, message: 'Withdrawn from training session.', severity: 'info' });
      fetchTrainings();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to withdraw',
        severity: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Training & Development Catalog"
        subtitle="Explore upcoming skill-building workshops and professional development modules."
      />

      {isLoading ? (
        <LoadingSpinner message="Loading training catalog..." />
      ) : trainings.length === 0 ? (
        <EmptyState
          title="No Scheduled Programs"
          description="There are currently no active training courses open for registration."
          icon={SchoolOutlinedIcon}
        />
      ) : (
        <Grid container spacing={3}>
          {trainings.map((t) => {
            const isEnrolled =
              employee &&
              t.enrolledEmployees &&
              t.enrolledEmployees.some((emp) => (emp._id ? emp._id === employee._id : emp === employee._id));
            const enrolledCount = t.enrolledEmployees ? t.enrolledEmployees.length : 0;
            const isFull = enrolledCount >= t.capacity;

            return (
              <Grid item xs={12} md={6} key={t._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', borderRadius: 3 }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {t.title}
                      </Typography>
                      <StatusChip status={t.status} size="small" />
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, minHeight: 40 }}>
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
                          {new Date(t.startDate).toLocaleDateString()} to {new Date(t.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: isFull ? 'error.main' : 'text.secondary', fontWeight: isFull ? 600 : 400 }}>
                          Capacity: {enrolledCount} / {t.capacity} participants {isFull && '(Full)'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                    {isEnrolled ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={actionLoadingId === t._id}
                        onClick={() => handleWithdraw(t._id)}
                      >
                        {actionLoadingId === t._id ? 'Processing...' : 'Withdraw'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        disabled={isFull || actionLoadingId === t._id || t.status !== 'Scheduled'}
                        onClick={() => handleEnroll(t._id)}
                      >
                        {actionLoadingId === t._id ? 'Enrolling...' : isFull ? 'Class Full' : 'Enroll Now'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
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
