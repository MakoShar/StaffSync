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
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { leaveService } from '../../services/leaveService';

const LEAVE_TYPES = ['Casual', 'Sick', 'Annual', 'Maternity', 'Unpaid'];

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Leave Modal state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Cancel dialog state
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await leaveService.getMyLeaves({ page: page + 1, limit });
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
  }, [page, limit]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!startDate || !endDate || !reason) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be prior to start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason,
      });
      setIsApplyOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setNotification({ open: true, message: 'Leave request submitted successfully!', severity: 'success' });
      fetchLeaves();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    setIsCanceling(true);
    try {
      await leaveService.cancelLeave(cancelTargetId);
      setNotification({ open: true, message: 'Leave request cancelled.', severity: 'info' });
      setCancelTargetId(null);
      fetchLeaves();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to cancel leave',
        severity: 'error',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Leave Applications"
        subtitle="Submit time-off requests, monitor approval status, and review historical leave logs."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormError('');
              setIsApplyOpen(true);
            }}
          >
            Apply for Leave
          </Button>
        }
      />

      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Fetching your leave records..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No Leave Applications"
            description="You have not submitted any leave applications yet."
            actionLabel="Apply for Leave"
            onAction={() => setIsApplyOpen(true)}
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Review Remarks</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.leaveType}</TableCell>
                      <TableCell>
                        {new Date(row.startDate).toLocaleDateString()} to{' '}
                        {new Date(row.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.daysCount} day(s)</TableCell>
                      <TableCell sx={{ maxWidth: 220, color: 'text.secondary', fontSize: '0.85rem' }}>
                        {row.reason}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {row.reviewRemarks || '—'}
                      </TableCell>
                      <TableCell align="right">
                        {row.status === 'Pending' && (
                          <Tooltip title="Cancel Request">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setCancelTargetId(row._id)}
                            >
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
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

      {/* Apply Leave Dialog */}
      <Dialog open={isApplyOpen} onClose={() => setIsApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Apply for Leave</DialogTitle>
        <Box component="form" onSubmit={handleApplySubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Leave Type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              size="small"
            >
              {LEAVE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t} Leave
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Reason for Request"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide details regarding your leave request..."
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsApplyOpen(false)} color="inherit" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelTargetId)}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this pending leave request? This action cannot be reversed."
        confirmText="Yes, Cancel Leave"
        confirmColor="error"
        isLoading={isCanceling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTargetId(null)}
      />

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
