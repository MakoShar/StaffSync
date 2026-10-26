import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Snackbar,
  MenuItem,
  Grid,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { leaveService } from '../../services/leaveService';

const LEAVE_TYPES = ['Casual', 'Sick', 'Annual', 'Maternity', 'Unpaid'];

export default function LeaveAdminPage() {
  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review Dialog
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const params = { page: page + 1, limit };
      if (status) params.status = status;
      if (leaveType) params.leaveType = leaveType;

      const res = await leaveService.getAllLeaves(params);
      setLeaves(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [page, limit, status, leaveType]);

  const openReviewDialog = (leave, actionStatus) => {
    setSelectedLeave(leave);
    setReviewStatus(actionStatus);
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
      fetchLeaves();
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

  return (
    <Box>
      <PageHeader
        title="Organization Leave Administration"
        subtitle="Review, audit, approve, or reject leave requests across all departments."
      />

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending Review</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Leave Type"
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Leave Types</MenuItem>
              {LEAVE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Fetching organization leave records..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No Leave Records Found"
            description="No applications match the selected status or category filters."
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reviewer Remarks</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.employee?.firstName} {row.employee?.lastName}
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {row.employee?.employeeId}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.employee?.department}</TableCell>
                      <TableCell>{row.leaveType}</TableCell>
                      <TableCell>
                        {new Date(row.startDate).toLocaleDateString()} to{' '}
                        {new Date(row.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.daysCount}d</TableCell>
                      <TableCell sx={{ maxWidth: 160, color: 'text.secondary', fontSize: '0.85rem' }}>
                        {row.reason}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {row.reviewRemarks || '—'}
                      </TableCell>
                      <TableCell align="right">
                        {row.status === 'Pending' ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => openReviewDialog(row, 'Approved')}
                              sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => openReviewDialog(row, 'Rejected')}
                              sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {row.status}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 15, 30]}
              component="div"
              count={total}
              rowsPerPage={limit}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {reviewStatus === 'Approved' ? 'Approve Leave Application' : 'Reject Leave Application'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {reviewStatus === 'Approved'
              ? `Confirm HR approval for ${selectedLeave?.daysCount} day(s) of ${selectedLeave?.leaveType} leave for ${selectedLeave?.employee?.firstName} ${selectedLeave?.employee?.lastName}.`
              : `Specify reason for rejecting ${selectedLeave?.employee?.firstName} ${selectedLeave?.employee?.lastName}'s leave application.`}
          </Typography>
          <TextField
            fullWidth
            label="HR Administrative Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Official remarks..."
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
