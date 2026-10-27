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
  TextField,
  Button,
  Grid,
  Typography,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { attendanceService } from '../../services/attendanceService';

export default function MyAttendancePage() {
  const [activeTab, setActiveTab] = useState(0); // 0 = 30-Day Calendar, 1 = Detailed Table Logs

  // Calendar State
  const [calendarData, setCalendarData] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Table Logs State
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tableLoading, setTableLoading] = useState(true);

  // Quick Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // 1. Fetch Calendar Matrix
  const fetchCalendar = async () => {
    setCalendarLoading(true);
    try {
      const res = await attendanceService.getMyCalendar();
      setCalendarData(res);
    } catch (err) {
      console.error('Failed to load attendance calendar', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  // 2. Fetch History Logs
  const fetchHistory = async () => {
    setTableLoading(true);
    try {
      const params = {
        page: page + 1,
        limit,
      };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await attendanceService.getMyHistory(params);
      setRecords(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load attendance history', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      fetchHistory();
    }
  }, [page, limit, activeTab]);

  // Mark Present Handler
  const handleMarkPresent = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn('Marked present via Attendance page');
      setNotification({ open: true, message: 'You have been marked Present successfully!', severity: 'success' });
      await Promise.all([fetchCalendar(), fetchHistory()]);
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Check-in failed',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Check-Out Handler
  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkOut('Checked out for the day');
      setNotification({ open: true, message: 'Checked out successfully! Work hours updated.', severity: 'success' });
      await Promise.all([fetchCalendar(), fetchHistory()]);
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Check-out failed',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Today Handler (for testing)
  const handleResetToday = async () => {
    setActionLoading(true);
    try {
      await attendanceService.resetTodayAttendance();
      setNotification({ open: true, message: "Today's attendance has been reset. You can mark present again.", severity: 'info' });
      await Promise.all([fetchCalendar(), fetchHistory()]);
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to reset attendance',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(0);
    fetchHistory();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setPage(0);
    setTimeout(fetchHistory, 0);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setDialogOpen(true);
  };

  const summary = calendarData?.summary || {
    totalDays: 30,
    workingDays: 22,
    presentDays: 0,
    lateDays: 0,
    halfDays: 0,
    leaveDays: 0,
    absentDays: 0,
    totalWorkHours: 0,
    attendancePercentage: 0,
  };

  const daysList = calendarData?.days || [];
  const todayItem = daysList.find((d) => d.isToday);
  const isTodayPresent = todayItem && todayItem.status === 'Present';
  const isTodayCheckedOut = todayItem && Boolean(todayItem.checkOut);

  // Status Color Mapping for 30-Day Cards
  const getStatusCardStyles = (status, isToday) => {
    switch (status) {
      case 'Present':
        return {
          bg: '#F0FDF4',
          border: '#86EFAC',
          textColor: '#15803D',
          badgeBg: '#DCFCE7',
          badgeText: '#166534',
        };
      case 'Late':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          textColor: '#B45309',
          badgeBg: '#FEF3C7',
          badgeText: '#92400E',
        };
      case 'Half Day':
        return {
          bg: '#FFF7ED',
          border: '#FDBA74',
          textColor: '#C2410C',
          badgeBg: '#FFEDD5',
          badgeText: '#9A3412',
        };
      case 'On Leave':
        return {
          bg: '#F0F9FF',
          border: '#BAE6FD',
          textColor: '#0369A1',
          badgeBg: '#E0F2FE',
          badgeText: '#075985',
        };
      case 'Weekend':
        return {
          bg: '#F8FAFC',
          border: '#E2E8F0',
          textColor: '#64748B',
          badgeBg: '#F1F5F9',
          badgeText: '#475569',
        };
      case 'Absent':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          textColor: '#B91C1C',
          badgeBg: '#FEE2E2',
          badgeText: '#991B1B',
        };
      default: // 'Not Marked' or pending
        return {
          bg: isToday ? '#F5F3FF' : '#F8FAFC',
          border: isToday ? '#C4B5FD' : '#E2E8F0',
          textColor: isToday ? '#6D28D9' : '#64748B',
          badgeBg: isToday ? '#EDE9FE' : '#F1F5F9',
          badgeText: isToday ? '#5B21B6' : '#475569',
        };
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Attendance"
        subtitle="Visual 30-day attendance calendar, punctuality analytics, and historical work hour logs."
        action={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {!isTodayPresent ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                disabled={actionLoading}
                onClick={handleMarkPresent}
                sx={{
                  py: 1.1,
                  px: 2.5,
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  backgroundColor: '#16A34A',
                  '&:hover': { backgroundColor: '#15803D' },
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                }}
              >
                {actionLoading ? 'Recording...' : 'Mark Present (Check-In)'}
              </Button>
            ) : !isTodayCheckedOut ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<CheckCircleOutlineIcon sx={{ color: '#16A34A !important' }} />}
                  label="Present Today"
                  sx={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 700 }}
                />
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<LogoutIcon />}
                  disabled={actionLoading}
                  onClick={handleCheckOut}
                >
                  Mark Check-Out
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label="Present (Checked Out)"
                  sx={{ backgroundColor: '#E2E8F0', color: '#334155', fontWeight: 700 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetToday}
                  disabled={actionLoading}
                >
                  Reset Today (Demo)
                </Button>
              </Box>
            )}
          </Box>
        }
      />

      {/* Top 30-Day Metrics Bar */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present (Past 30 Days)"
            value={`${summary.presentDays} Days`}
            subtitle={`${summary.workingDays} official working days`}
            icon={CheckCircleOutlineIcon}
            color="#16A34A"
            iconBg="#DCFCE7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Punctuality"
            value={`${summary.attendancePercentage}%`}
            subtitle={`${summary.lateDays} late • ${summary.halfDays} half days`}
            icon={AccessTimeIcon}
            color="#2563EB"
            iconBg="#EFF6FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Hours Logged"
            value={`${summary.totalWorkHours}h`}
            subtitle={`Avg ${(summary.totalWorkHours / (summary.presentDays || 1)).toFixed(1)}h per present day`}
            icon={AccessTimeIcon}
            color="#7C3AED"
            iconBg="#EDE9FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Leaves"
            value={`${summary.leaveDays} Days`}
            subtitle={`${summary.absentDays} unexcused absence`}
            icon={EventBusyIcon}
            color="#D97706"
            iconBg="#FEF3C7"
          />
        </Grid>
      </Grid>

      {/* Tabs: 30-Day Calendar vs. Detailed Logs Table */}
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            px: 2,
            pt: 1,
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              minHeight: 48,
            },
          }}
        >
          <Tab
            icon={<CalendarMonthIcon fontSize="small" />}
            iconPosition="start"
            label="30-Day Attendance Calendar"
          />
          <Tab
            icon={<TableRowsIcon fontSize="small" />}
            iconPosition="start"
            label="Detailed Attendance Table Logs"
          />
        </Tabs>

        {/* TAB 0: 30-DAY CALENDAR VIEW */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Calendar Legend */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                p: 2,
                mb: 3,
                backgroundColor: '#F8FAFC',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                  Calendar Legend (Past 30 Days):
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#16A34A' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>Present</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#D97706' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>Late</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EA580C' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>Half Day</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0284C7' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>On Leave</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#DC2626' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>Absent</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#94A3B8' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>Weekend</Typography>
                </Box>
              </Box>
            </Box>

            {calendarLoading ? (
              <LoadingSpinner message="Generating your 30-day attendance calendar..." />
            ) : daysList.length === 0 ? (
              <EmptyState
                title="No Calendar Data"
                description="Unable to compute the 30-day attendance matrix. Please try again."
              />
            ) : (
              <Grid container spacing={2}>
                {daysList.map((day) => {
                  const style = getStatusCardStyles(day.status, day.isToday);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={day.date}>
                      <Card
                        onClick={() => handleDayClick(day)}
                        elevation={0}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: style.bg,
                          border: `1.5px solid ${day.isToday ? '#6366F1' : style.border}`,
                          borderRadius: 2.5,
                          p: 1.5,
                          transition: 'all 0.2s ease-in-out',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                            borderColor: day.isToday ? '#4F46E5' : '#94A3B8',
                          },
                        }}
                      >
                        {day.isToday && (
                          <Chip
                            label="TODAY"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: '#4F46E5',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              height: 18,
                            }}
                          />
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                            {day.dayNumber}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                            {day.month} • {day.dayOfWeek}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 1.25 }}>
                          <Chip
                            label={day.status}
                            size="small"
                            sx={{
                              backgroundColor: style.badgeBg,
                              color: style.badgeText,
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 22,
                              borderRadius: '6px',
                            }}
                          />
                        </Box>

                        <Box sx={{ fontSize: '0.75rem', color: '#475569' }}>
                          {day.checkIn ? (
                            <>
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.72rem' }}>
                                In: <strong>{new Date(day.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                {day.checkOut && (
                                  <> • Out: <strong>{new Date(day.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></>
                                )}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#0F172A', mt: 0.25 }}>
                                {day.workHours > 0 ? `${day.workHours} hrs logged` : 'Clocked in'}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', display: 'block' }}>
                              {day.isToday ? 'Click to Mark Present' : day.remarks || 'No punch logged'}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* TAB 1: DETAILED AUDIT TABLE LOGS */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Date Filter Bar */}
            <Box component="form" onSubmit={handleFilter} sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<FilterAltOutlinedIcon />}
                    disabled={!startDate || !endDate}
                  >
                    Filter Logs
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={handleResetFilter}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Records Table */}
            {tableLoading ? (
              <LoadingSpinner message="Fetching attendance history logs..." />
            ) : records.length === 0 ? (
              <EmptyState
                title="No Attendance Records"
                description="No attendance entries were found for the selected time period."
              />
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Check-In</TableCell>
                        <TableCell>Check-Out</TableCell>
                        <TableCell>Work Hours</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records.map((row) => (
                        <TableRow key={row._id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {new Date(row.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            {row.checkOut
                              ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {row.workHours ? `${row.workHours} hrs` : 'In Progress'}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={row.status} />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {row.remarks || '—'}
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
          </Box>
        )}
      </Paper>

      {/* Day Details Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Attendance Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedDay?.formattedDate}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => setDialogOpen(false)}
            sx={{ minWidth: 32, p: 0.5, color: '#64748B' }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {selectedDay && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Attendance Status
                </Typography>
                <StatusChip status={selectedDay.status} />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Clock-In Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {selectedDay.checkIn
                    ? new Date(selectedDay.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Clock-Out Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {selectedDay.checkOut
                    ? new Date(selectedDay.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Logged Work Hours
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
                  {selectedDay.workHours ? `${selectedDay.workHours} hours` : '0 hours'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Day Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedDay.isWeekend ? 'Weekend Off' : 'Official Working Day'}
                </Typography>
              </Box>

              {selectedDay.remarks && (
                <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, mb: 0.5 }}>
                    Remarks / Notes
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    {selectedDay.remarks}
                  </Typography>
                </Box>
              )}

              {selectedDay.isToday && !selectedDay.checkIn && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => {
                    setDialogOpen(false);
                    handleMarkPresent();
                  }}
                  sx={{ mt: 1, backgroundColor: '#16A34A', '&:hover': { backgroundColor: '#15803D' } }}
                >
                  Mark Present Today
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
