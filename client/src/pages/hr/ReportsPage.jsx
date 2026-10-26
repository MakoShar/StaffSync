import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Divider,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { reportService } from '../../services/reportService';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getHrDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner message="Generating comprehensive organizational reports..." />;
  }

  const { metrics = {}, departmentDistribution = [] } = data || {};

  return (
    <Box>
      <PageHeader
        title="Reports & Workforce Analytics"
        subtitle="Organizational headcount allocation, attendance punctuality metrics, and leave volume statistics."
        action={
          <Button
            variant="outlined"
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
          >
            Export / Print Report
          </Button>
        }
      />

      {/* Overview Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Active Staff"
            value={metrics.activeEmployees || 0}
            subtitle={`${metrics.totalEmployees || 0} total registered`}
            icon={PeopleOutlineIcon}
            color="#2563EB"
            iconBg="#EFF6FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Daily Attendance"
            value={`${metrics.attendanceRate || 0}%`}
            subtitle={`${metrics.todayAttendanceCount || 0} checked in`}
            icon={CheckCircleOutlineIcon}
            color="#16A34A"
            iconBg="#DCFCE7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leave Requests"
            value={metrics.pendingLeaves || 0}
            subtitle="Pending HR & Manager review"
            icon={EventBusyIcon}
            color="#D97706"
            iconBg="#FEF3C7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Departments"
            value={departmentDistribution.length}
            subtitle="Cross-functional units"
            icon={BarChartOutlinedIcon}
            color="#7C3AED"
            iconBg="#EDE9FE"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Department Ratio Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Workforce Distribution by Department
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Calculated dynamically from active employee database records.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {departmentDistribution.map((d) => {
                const total = metrics.activeEmployees || 1;
                const pct = Math.round((d.count / total) * 100);
                return (
                  <Box key={d.department}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {d.department}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {d.count} ({pct}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          backgroundColor:
                            d.department === 'Engineering'
                              ? '#2563EB'
                              : d.department === 'Human Resources'
                              ? '#7C3AED'
                              : d.department === 'Sales'
                              ? '#16A34A'
                              : d.department === 'Marketing'
                              ? '#F59E0B'
                              : '#64748B',
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Presence and Status Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Daily Presence & Operational Metrics
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Summary of employee punctuality and status for today.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534' }}>
                    Present on Time
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803D' }}>
                    Checked in prior to scheduled threshold
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                  {metrics.todayPresent || 0}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E' }}>
                    Late Arrivals
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B45309' }}>
                    Arrived after 09:30 threshold
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#92400E' }}>
                  {metrics.todayLate || 0}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E40AF' }}>
                    On Authorized Leave
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1D4ED8' }}>
                    Approved time off
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E40AF' }}>
                  {metrics.onLeaveEmployees || 0}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569' }}>
                    Pending Leave Requests
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Awaiting manager or HR review
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#475569' }}>
                  {metrics.pendingLeaves || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
