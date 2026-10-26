import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { employeeService } from '../../services/employeeService';

export default function TeamMembersPage() {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await employeeService.getMyTeam();
      setTeam(res.data);
    } catch (err) {
      console.error('Failed to load team members', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Direct Reports"
        subtitle="Manage and view contact information for all employees reporting directly to you."
      />

      {isLoading ? (
        <LoadingSpinner message="Loading team roster..." />
      ) : team.length === 0 ? (
        <EmptyState
          title="No Direct Reports"
          description="You currently do not have any employees assigned to report to you."
        />
      ) : (
        <Grid container spacing={3}>
          {team.map((emp) => (
            <Grid item xs={12} sm={6} md={4} key={emp._id}>
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        backgroundColor: 'primary.main',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                      }}
                    >
                      {emp.firstName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {emp.firstName} {emp.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {emp.designation}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                        {emp.employeeId}
                      </Typography>
                    </Box>
                    <StatusChip status={emp.status} size="small" />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {emp.user?.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {emp.phone || 'No phone recorded'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E2E8F0' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Joined on {new Date(emp.joiningDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
