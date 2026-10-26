import React from 'react';
import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  // Attendance & Employee Status
  Present: { color: 'success', bg: '#DCFCE7', text: '#15803D' },
  Active: { color: 'success', bg: '#DCFCE7', text: '#15803D' },
  'Half Day': { color: 'warning', bg: '#FEF3C7', text: '#B45309' },
  Late: { color: 'warning', bg: '#FEF3C7', text: '#B45309' },
  Absent: { color: 'error', bg: '#FEE2E2', text: '#B91C1C' },
  'On Leave': { color: 'info', bg: '#E0F2FE', text: '#0369A1' },
  Terminated: { color: 'default', bg: '#F1F5F9', text: '#475569' },

  // Leave Status
  Approved: { color: 'success', bg: '#DCFCE7', text: '#15803D' },
  Pending: { color: 'warning', bg: '#FEF3C7', text: '#B45309' },
  Rejected: { color: 'error', bg: '#FEE2E2', text: '#B91C1C' },
  Cancelled: { color: 'default', bg: '#F1F5F9', text: '#64748B' },

  // Priority
  Low: { color: 'info', bg: '#F0FDF4', text: '#166534' },
  Medium: { color: 'info', bg: '#E0F2FE', text: '#0369A1' },
  High: { color: 'warning', bg: '#FEF3C7', text: '#B45309' },
  Urgent: { color: 'error', bg: '#FEE2E2', text: '#B91C1C' },

  // Training
  Scheduled: { color: 'info', bg: '#E0F2FE', text: '#0369A1' },
  'In Progress': { color: 'warning', bg: '#FEF3C7', text: '#B45309' },
  Completed: { color: 'success', bg: '#DCFCE7', text: '#15803D' },
};

export default function StatusChip({ status, size = 'small' }) {
  const config = STATUS_CONFIG[status] || {
    bg: '#F1F5F9',
    text: '#475569',
  };

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        backgroundColor: config.bg,
        color: config.text,
        border: 'none',
        borderRadius: '6px',
      }}
    />
  );
}
