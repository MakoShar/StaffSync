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
  LinearProgress,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportService } from '../../services/reportService';

export default function HrDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getHrDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load HR dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading HR analytics dashboard..." />;
  }

  const { metrics = {}, departmentDistribution = [], recentLeaves = [] } = data || {};

  return (
    <Box>
      <PageHeader
        title="HR Administration Dashboard"
        subtitle="Real-time workforce intelligence, presence metrics, and organizational lifecycle operations."
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<CampaignOutlinedIcon />}
              onClick={() => navigate('/app/hr/announcements')}
            >
              Post Announcement
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={() => navigate('/app/hr/employees')}
            >
              Manage Employees
            </Button>
          </Box>
        }
      />

      {/* Primary KPI Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Workforce"
            value={metrics.totalEmployees || 0}
            subtitle={`${metrics.activeEmployees || 0} currently active`}
            icon={PeopleOutlineIcon}
            color="#2563EB"
            iconBg="#EFF6FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Attendance Rate"
            value={`${metrics.attendanceRate || 0}%`}
            subtitle={`${metrics.todayAttendanceCount || 0} employees checked in`}
            icon={CheckCircleOutlineIcon}
            color="#16A34A"
            iconBg="#DCFCE7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={metrics.pendingLeaves || 0}
            subtitle={`${metrics.approvedLeavesThisMonth || 0} approved this month`}
            icon={EventBusyIcon}
            color="#D97706"
            iconBg="#FEF3C7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scheduled Trainings"
            value={metrics.scheduledTrainings || 0}
            subtitle="Organization-wide courses"
            icon={SchoolOutlinedIcon}
            color="#7C3AED"
            iconBg="#EDE9FE"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Department Headcount Breakdown */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Department Headcount Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Staff allocation across operational departments
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {departmentDistribution.map((item) => {
                const totalCount = metrics.activeEmployees || 1;
                const percentage = Math.round((item.count / totalCount) * 100);
                return (
                  <Box key={item.department}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.department}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {item.count} staff ({percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor:
                            item.department === 'Engineering'
                              ? '#2563EB'
                              : item.department === 'Human Resources'
                              ? '#7C3AED'
                              : item.department === 'Sales'
                              ? '#16A34A'
                              : '#D97706',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Leave Applications */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Leave Requests
              </Typography>
              <Button size="small" onClick={() => navigate('/app/hr/leaves')}>
                View All Leaves
              </Button>
            </Box>

            {recentLeaves.length === 0 ? (
              <EmptyState
                title="No Leave Records"
                description="No leave applications have been submitted recently."
              />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentLeaves.map((leave) => (
                      <TableRow key={leave._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {leave.employee?.firstName} {leave.employee?.lastName}
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {leave.employee?.employeeId}
                          </Typography>
                        </TableCell>
                        <TableCell>{leave.employee?.department}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{leave.daysCount}d</TableCell>
                        <TableCell>
                          <StatusChip status={leave.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
