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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { trainingService } from '../../services/trainingService';

export default function TrainingManagementPage() {
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('25');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !instructor || !startDate || !endDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be prior to start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await trainingService.createTraining({
        title,
        description,
        instructor,
        startDate,
        endDate,
        capacity: parseInt(capacity, 10) || 25,
      });

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setInstructor('');
      setStartDate('');
      setEndDate('');
      setNotification({ open: true, message: 'Training session scheduled successfully!', severity: 'success' });
      fetchTrainings();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create training');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Team Training Management"
        subtitle="Schedule workshops, professional upskilling seminars, and monitor team participant rosters."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormError('');
              setIsCreateOpen(true);
            }}
          >
            Schedule Program
          </Button>
        }
      />

      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Fetching scheduled programs..." />
        ) : trainings.length === 0 ? (
          <EmptyState
            title="No Training Programs Scheduled"
            description="You have not created any training programs yet."
            actionLabel="Schedule First Program"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Enrolled / Capacity</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainings.map((t) => (
                  <TableRow key={t._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {t.title}
                      <Box component="span" sx={{ display: 'block', fontSize: '0.8rem', color: 'text.secondary' }}>
                        {t.description.substring(0, 70)}...
                      </Box>
                    </TableCell>
                    <TableCell>{t.instructor}</TableCell>
                    <TableCell>
                      {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {t.enrolledEmployees?.length || 0} / {t.capacity} participants
                    </TableCell>
                    <TableCell>
                      <StatusChip status={t.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Schedule Training Modal */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Training Program</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Course Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack Microservices"
              required
              size="small"
            />

            <TextField
              fullWidth
              label="Course Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of syllabus and objectives..."
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Instructor Name"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
                size="small"
              />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                size="small"
              />
            </Box>

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
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsCreateOpen(false)} color="inherit" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Program'}
            </Button>
          </DialogActions>
        </Box>
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
