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
  MenuItem,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { attendanceService } from '../../services/attendanceService';

export default function AttendanceAdminPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(15);
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const params = { page: page + 1, limit };
      if (date) params.date = date;
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await attendanceService.getAllAttendance(params);
      setRecords(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load org attendance', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, limit, date, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAttendance();
  };

  return (
    <Box>
      <PageHeader
        title="Organization Attendance Administration"
        subtitle="Monitor workforce presence, verify daily logs, and oversee compliance across departments."
      />

      {/* Filter / Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Work Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search employee name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="contained" size="small">
                <SearchOutlinedIcon fontSize="small" />
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Attendance Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Late">Late</MenuItem>
              <MenuItem value="Half Day">Half Day</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Fetching attendance records..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No Attendance Records Found"
            description="No logs matched the specified date or search filter."
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Work Date</TableCell>
                    <TableCell>Check-In</TableCell>
                    <TableCell>Check-Out</TableCell>
                    <TableCell>Logged Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.employee?.firstName} {row.employee?.lastName}
                        <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>
                          {row.employee?.employeeId}
                        </Box>
                      </TableCell>
                      <TableCell>{row.employee?.department}</TableCell>
                      <TableCell>
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
                          : '— In Progress'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.workHours ? `${row.workHours} hrs` : '—'}
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
    </Box>
  );
}
