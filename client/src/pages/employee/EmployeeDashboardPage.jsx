import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportService } from '../../services/reportService';
import { attendanceService } from '../../services/attendanceService';

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getEmployeeDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load employee dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    setAttendanceActionLoading(true);
    try {
      await attendanceService.checkIn(remarks);
      setNotification({ open: true, message: 'Check-in recorded successfully!', severity: 'success' });
      setRemarks('');
      fetchDashboard();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Check-in failed',
        severity: 'error',
      });
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceActionLoading(true);
    try {
      await attendanceService.checkOut(remarks);
      setNotification({ open: true, message: 'Check-out recorded successfully! Work hours updated.', severity: 'success' });
      setRemarks('');
      fetchDashboard();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Check-out failed',
        severity: 'error',
      });
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const handleResetToday = async () => {
    setAttendanceActionLoading(true);
    try {
      await attendanceService.resetTodayAttendance();
      setNotification({ open: true, message: "Today's attendance has been reset. You can now mark present.", severity: 'info' });
      fetchDashboard();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to reset attendance',
        severity: 'error',
      });
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading employee dashboard..." />;
  }

  const { todayAttendance, monthlyStats, enrolledTrainings, recentAnnouncements } = data || {};

  return (
    <Box>
      <PageHeader
        title="Employee Portal"
        subtitle="Review your attendance status, leave balances, and workplace development programs."
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<AccessTimeIcon />}
              onClick={() => navigate('/app/employee/attendance')}
            >
              My Attendance Calendar
            </Button>
            <Button
              variant="contained"
              startIcon={<EventBusyIcon />}
              onClick={() => navigate('/app/employee/leaves')}
            >
              Apply for Leave
            </Button>
          </Box>
        }
      />

      {/* KPI Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Days Present (This Month)"
            value={monthlyStats?.daysPresent || 0}
            subtitle="Recorded working days"
            icon={CheckCircleOutlineIcon}
            color="#16A34A"
            iconBg="#DCFCE7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Work Hours (This Month)"
            value={`${monthlyStats?.totalHours || 0}h`}
            subtitle="Cumulative logged hours"
            icon={AccessTimeIcon}
            color="#2563EB"
            iconBg="#EFF6FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={monthlyStats?.pendingLeaves || 0}
            subtitle={`${monthlyStats?.approvedLeaves || 0} approved this year`}
            icon={EventBusyIcon}
            color="#D97706"
            iconBg="#FEF3C7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Enrolled Trainings"
            value={monthlyStats?.enrolledTrainingsCount || 0}
            subtitle="Active skill sessions"
            icon={SchoolOutlinedIcon}
            color="#7C3AED"
            iconBg="#EDE9FE"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Daily Clock-In / Clock-Out Widget */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Today's Attendance
              </Typography>
              {todayAttendance?.checkedIn && (
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                  onClick={handleResetToday}
                  disabled={attendanceActionLoading}
                >
                  Reset (Demo)
                </Button>
              )}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: todayAttendance?.checkedIn ? '#F0FDF4' : '#F8FAFC',
                border: todayAttendance?.checkedIn ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                mb: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', letterSpacing: '0.5px' }}>
                CURRENT PRESENCE STATUS
              </Typography>
              <Box sx={{ my: 1.5 }}>
                <StatusChip status={todayAttendance?.status || 'Not Checked In'} size="medium" />
              </Box>
              {todayAttendance?.checkInTime && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  Checked in at: <strong style={{ color: '#0F172A' }}>{new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </Typography>
              )}
              {todayAttendance?.checkOutTime && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
                  Checked out at: <strong style={{ color: '#0F172A' }}>{new Date(todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </Typography>
              )}
            </Box>

            {!todayAttendance?.checkedIn && (
              <Box>
                <TextField
                  fullWidth
                  placeholder="Optional check-in note or task summary..."
                  size="small"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircleOutlineIcon />}
                  disabled={attendanceActionLoading}
                  onClick={handleCheckIn}
                  sx={{
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: '1rem',
                    backgroundColor: '#16A34A',
                    '&:hover': { backgroundColor: '#15803D' },
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  {attendanceActionLoading ? 'Recording Attendance...' : 'Mark Present'}
                </Button>
              </Box>
            )}

            {todayAttendance?.checkedIn && !todayAttendance?.checkedOut && (
              <Box>
                <TextField
                  fullWidth
                  placeholder="Optional workday wrap-up note..."
                  size="small"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="large"
                  startIcon={<LogoutIcon />}
                  disabled={attendanceActionLoading}
                  onClick={handleCheckOut}
                  sx={{ py: 1.25, fontWeight: 700 }}
                >
                  {attendanceActionLoading ? 'Recording Check-Out...' : 'Mark Check-Out'}
                </Button>
              </Box>
            )}

            {todayAttendance?.checkedIn && todayAttendance?.checkedOut && (
              <Box>
                <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
                  You have completed your attendance check-in and check-out for today!
                </Alert>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={handleResetToday}
                  disabled={attendanceActionLoading}
                >
                  Reset Today's Attendance (Test Again)
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2.5 }} />

            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={() => navigate('/app/employee/attendance')}
              sx={{ fontWeight: 600, fontSize: '0.875rem' }}
            >
              View Full 30-Day Attendance Calendar →
            </Button>
          </Paper>
        </Grid>

        {/* Right Column: Active Trainings & Recent Announcements */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Enrolled Training Sessions
              </Typography>
              <Button size="small" onClick={() => navigate('/app/trainings')}>
                View Catalog
              </Button>
            </Box>

            {enrolledTrainings && enrolledTrainings.length > 0 ? (
              <Grid container spacing={2}>
                {enrolledTrainings.map((tr) => (
                  <Grid item xs={12} sm={6} key={tr._id}>
                    <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {tr.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                          Instructor: {tr.instructor}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {new Date(tr.startDate).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                You are not currently enrolled in any training sessions. Visit the Training Catalog to register!
              </Typography>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Company News & Updates
              </Typography>
              <Button size="small" onClick={() => navigate('/app/announcements')}>
                All Announcements
              </Button>
            </Box>

            {recentAnnouncements && recentAnnouncements.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentAnnouncements.map((ann) => (
                  <Box
                    key={ann._id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {ann.title}
                      </Typography>
                      <StatusChip status={ann.priority} size="small" />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {ann.content.substring(0, 110)}...
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No recent announcements.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

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
