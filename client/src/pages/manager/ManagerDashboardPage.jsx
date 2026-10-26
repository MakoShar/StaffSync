import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportService } from '../../services/reportService';
import { leaveService } from '../../services/leaveService';

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review Dialog State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getManagerDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load manager dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const openReviewDialog = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setRemarks('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedLeave) return;
    setIsSubmitting(true);
    try {
      await leaveService.reviewLeave(selectedLeave._id, reviewStatus, remarks);
      setNotification({
        open: true,
        message: `Leave request has been ${reviewStatus.toLowerCase()} successfully!`,
        severity: 'success',
      });
      setReviewModalOpen(false);
      fetchDashboard();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Review action failed',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading team management dashboard..." />;
  }

  const {
    teamSize = 0,
    presentCount = 0,
    teamAttendanceRate = 0,
    pendingApprovalsCount = 0,
    pendingApprovals = [],
    directReports = [],
  } = data || {};

  return (
    <Box>
      <PageHeader
        title="Manager Team Overview"
        subtitle="Manage your direct reports, track daily team presence, and review leave applications."
        action={
          <Button
            variant="contained"
            onClick={() => navigate('/app/manager/trainings')}
          >
            Manage Team Trainings
          </Button>
        }
      />

      {/* KPI Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={teamSize}
            subtitle="Assigned direct reports"
            icon={PeopleOutlineIcon}
            color="#2563EB"
            iconBg="#EFF6FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Today"
            value={presentCount}
            subtitle={`${teamAttendanceRate}% team presence today`}
            icon={CheckCircleOutlineIcon}
            color="#16A34A"
            iconBg="#DCFCE7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={pendingApprovalsCount}
            subtitle="Awaiting manager review"
            icon={EventBusyIcon}
            color="#D97706"
            iconBg="#FEF3C7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${teamAttendanceRate}%`}
            subtitle="Daily compliance"
            icon={AccessTimeIcon}
            color="#7C3AED"
            iconBg="#EDE9FE"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Leave Requests for Team */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Pending Team Leave Requests
              </Typography>
              <Button size="small" onClick={() => navigate('/app/manager/leaves')}>
                All Leave Records
              </Button>
            </Box>

            {pendingApprovals.length === 0 ? (
              <EmptyState
                title="All Caught Up!"
                description="There are currently no pending leave requests awaiting your review."
              />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingApprovals.map((req) => (
                      <TableRow key={req._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {req.employee?.firstName} {req.employee?.lastName}
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {req.employee?.employeeId}
                          </Typography>
                        </TableCell>
                        <TableCell>{req.leaveType}</TableCell>
                        <TableCell>
                          {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{req.daysCount}d</TableCell>
                        <TableCell sx={{ maxWidth: 160, color: 'text.secondary', fontSize: '0.8rem' }}>
                          {req.reason}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => openReviewDialog(req, 'Approved')}
                              sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => openReviewDialog(req, 'Rejected')}
                              sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Direct Reports Quick Roster */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Direct Reports Roster
              </Typography>
              <Button size="small" onClick={() => navigate('/app/manager/team')}>
                View Team
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {directReports.map((member) => (
                <Box
                  key={member._id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {member.firstName} {member.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {member.designation}
                    </Typography>
                  </Box>
                  <StatusChip status={member.status} size="small" />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {reviewStatus === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {reviewStatus === 'Approved'
              ? `Confirm approval of ${selectedLeave?.daysCount} day(s) of ${selectedLeave?.leaveType} leave for ${selectedLeave?.employee?.firstName} ${selectedLeave?.employee?.lastName}.`
              : `Specify reason for rejecting this leave request for ${selectedLeave?.employee?.firstName} ${selectedLeave?.employee?.lastName}.`}
          </Typography>
          <TextField
            fullWidth
            label="Manager Review Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add comments or instructions..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewModalOpen(false)} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewStatus === 'Approved' ? 'success' : 'error'}
            onClick={handleReviewSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : `Confirm ${reviewStatus}`}
          </Button>
        </DialogActions>
      </Dialog>

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
