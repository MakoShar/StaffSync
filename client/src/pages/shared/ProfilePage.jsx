import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import EmergencyOutlinedIcon from '@mui/icons-material/ContactEmergencyOutlined';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import { employeeService } from '../../services/employeeService';
import { updateProfileData } from '../../features/auth/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, employee } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState(employee?.phone || '');
  const [street, setStreet] = useState(employee?.address?.street || '');
  const [city, setCity] = useState(employee?.address?.city || '');
  const [stateName, setStateName] = useState(employee?.address?.state || '');
  const [postalCode, setPostalCode] = useState(employee?.address?.postalCode || '');

  const [emergencyName, setEmergencyName] = useState(employee?.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(employee?.emergencyContact?.relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(employee?.emergencyContact?.phone || '');

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await employeeService.updateMyProfile({
        phone,
        address: { street, city, state: stateName, postalCode },
        emergencyContact: { name: emergencyName, relationship: emergencyRelation, phone: emergencyPhone },
      });
      dispatch(updateProfileData(response.data));
      setNotification({ open: true, message: 'Contact details updated successfully!', severity: 'success' });
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : user?.email;

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="View your organizational profile and update your personal contact details."
      />

      <Grid container spacing={3}>
        {/* Left Column: Organization & Identity (Read-only for security) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                backgroundColor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              {employee?.designation || 'Staff Member'}
            </Typography>
            <Chip
              label={user?.role || 'Employee'}
              size="small"
              sx={{ fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0284C7', mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                EMPLOYEE ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {employee?.employeeId || 'N/A'}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                DEPARTMENT
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {employee?.department || 'N/A'}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                CORPORATE EMAIL
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {user?.email || 'N/A'}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                REPORTING MANAGER
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {employee?.manager
                  ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.department})`
                  : 'Executive Leadership (None)'}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                JOINING DATE
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 3, textAlign: 'left', fontSize: '0.75rem' }}>
              Organizational fields (department, designation, manager) are managed strictly by HR Administration.
            </Alert>
          </Paper>
        </Grid>

        {/* Right Column: Editable Permitted Contact Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Box component="form" onSubmit={handleSaveContact}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactPhoneOutlinedIcon color="primary" fontSize="small" />
                Personal Contact Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State / Province"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmergencyOutlinedIcon color="error" fontSize="small" />
                Emergency Contact
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Emergency Phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  sx={{ px: 3, py: 1 }}
                >
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </Box>
            </Box>
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
