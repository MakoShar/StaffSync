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
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { announcementService } from '../../services/announcementService';

const AUDIENCES = ['All', 'Department', 'Managers'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
];

export default function AnnouncementAdminPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All');
  const [targetDepartment, setTargetDepartment] = useState('Engineering');
  const [priority, setPriority] = useState('Medium');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Dialog
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await announcementService.getAnnouncements();
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setTitle('');
    setContent('');
    setTargetAudience('All');
    setTargetDepartment('Engineering');
    setPriority('Medium');
    setExpiresAt('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (ann) => {
    setIsEditing(true);
    setSelectedId(ann._id);
    setTitle(ann.title);
    setContent(ann.content);
    setTargetAudience(ann.targetAudience);
    setTargetDepartment(ann.targetDepartment || 'Engineering');
    setPriority(ann.priority);
    setExpiresAt(ann.expiresAt ? ann.expiresAt.split('T')[0] : '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !content) {
      setFormError('Please provide both title and content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        content,
        targetAudience,
        targetDepartment: targetAudience === 'Department' ? targetDepartment : null,
        priority,
        expiresAt: expiresAt || null,
      };

      if (isEditing) {
        await announcementService.updateAnnouncement(selectedId, payload);
        setNotification({ open: true, message: 'Announcement updated successfully!', severity: 'success' });
      } else {
        await announcementService.createAnnouncement(payload);
        setNotification({ open: true, message: 'Announcement published successfully!', severity: 'success' });
      }

      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await announcementService.deleteAnnouncement(deleteTargetId);
      setNotification({ open: true, message: 'Announcement deleted successfully.', severity: 'info' });
      setDeleteTargetId(null);
      fetchAnnouncements();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to delete announcement',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Announcement Management"
        subtitle="Publish corporate announcements, broadcast notifications, and configure audience targeting."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
          >
            Post Announcement
          </Button>
        }
      />

      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Fetching announcement list..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No Announcements Found"
            description="You have not published any announcements yet."
            actionLabel="Create First Announcement"
            onAction={openCreateModal}
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title & Summary</TableCell>
                  <TableCell>Target Audience</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Date Published</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {row.title}
                      <Box component="span" sx={{ display: 'block', fontSize: '0.8rem', color: 'text.secondary' }}>
                        {row.content.substring(0, 80)}...
                      </Box>
                    </TableCell>
                    <TableCell>
                      {row.targetAudience === 'Department' ? `${row.targetDepartment} Dept` : row.targetAudience}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.priority} />
                    </TableCell>
                    <TableCell>
                      {row.author ? `${row.author.firstName} ${row.author.lastName}` : 'Administration'}
                    </TableCell>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditModal(row)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTargetId(row._id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEditing ? 'Edit Announcement' : 'Publish Announcement'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Announcement Title"
              size="small"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Town Hall Meeting & Product Roadmap"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Target Audience"
                size="small"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                {AUDIENCES.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a === 'All' ? 'All Organization' : a}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Priority Level"
                size="small"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {targetAudience === 'Department' && (
              <TextField
                select
                fullWidth
                label="Target Department"
                size="small"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              fullWidth
              label="Expiration Date (Optional)"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />

            <TextField
              fullWidth
              label="Announcement Content"
              multiline
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed announcement information..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setModalOpen(false)} color="inherit" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement? This action cannot be reversed."
        confirmText="Yes, Delete"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTargetId(null)}
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
