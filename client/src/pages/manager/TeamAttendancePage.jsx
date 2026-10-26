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
  TextField,
  Button,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { attendanceService } from '../../services/attendanceService';

export default function TeamAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamAttendance = async (dateStr) => {
    setIsLoading(true);
    try {
      const res = await attendanceService.getTeamAttendance({ date: dateStr || selectedDate });
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to load team attendance', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAttendance(selectedDate);
  }, [selectedDate]);

  return (
    <Box>
      <PageHeader
        title="Team Attendance Oversight"
        subtitle="Review daily check-in, check-out, and punctuality status for all direct reports."
        action={
          <TextField
            label="Work Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        }
      />

      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Fetching team attendance for selected date..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No Direct Reports Found"
            description="You do not have any active direct reports assigned to your team."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Check-In Time</TableCell>
                  <TableCell>Check-Out Time</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((item) => {
                  const emp = item.employee;
                  const att = item.attendance;
                  return (
                    <TableRow key={emp._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {emp.firstName} {emp.lastName}
                        <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {emp.employeeId}
                        </Box>
                      </TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>
                        {att?.checkIn
                          ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {att?.checkOut
                          ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {att?.workHours ? `${att.workHours} hrs` : att?.checkIn ? 'In Progress' : '0 hrs'}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={item.status} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {att?.remarks || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
