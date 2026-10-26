import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'Employee';

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileOpen) {
      onMobileClose();
    }
  };

  const hrLinks = [
    { label: 'HR Dashboard', path: '/app/hr/dashboard', icon: DashboardIcon },
    { label: 'Employee Directory', path: '/app/hr/employees', icon: PeopleOutlineIcon },
    { label: 'Attendance Records', path: '/app/hr/attendance', icon: AccessTimeIcon },
    { label: 'Leave Requests', path: '/app/hr/leaves', icon: EventBusyIcon },
    { label: 'Announcements', path: '/app/hr/announcements', icon: CampaignOutlinedIcon },
    { label: 'Reports & Analytics', path: '/app/hr/reports', icon: BarChartOutlinedIcon },
  ];

  const managerLinks = [
    { label: 'Manager Dashboard', path: '/app/manager/dashboard', icon: DashboardIcon },
    { label: 'My Team', path: '/app/manager/team', icon: SupervisedUserCircleIcon },
    { label: 'Team Attendance', path: '/app/manager/attendance', icon: AccessTimeIcon },
    { label: 'Leave Approvals', path: '/app/manager/leaves', icon: EventBusyIcon },
    { label: 'Team Training', path: '/app/manager/trainings', icon: SchoolOutlinedIcon },
  ];

  const employeeLinks = [
    { label: 'My Dashboard', path: '/app/employee/dashboard', icon: DashboardIcon },
    { label: 'My Attendance', path: '/app/employee/attendance', icon: AccessTimeIcon },
    { label: 'Leave Applications', path: '/app/employee/leaves', icon: EventBusyIcon },
    { label: 'My Training', path: '/app/employee/trainings', icon: SchoolOutlinedIcon },
  ];

  const sharedLinks = [
    { label: 'Company Feed', path: '/app/announcements', icon: CampaignOutlinedIcon },
    { label: 'Training Catalog', path: '/app/trainings', icon: SchoolOutlinedIcon },
    { label: 'My Profile', path: '/app/profile', icon: PersonOutlineIcon },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand logo header */}
      <Box
        sx={{
          height: 64,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          S
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            StaffSync
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600 }}>
            ENTERPRISE HRMS
          </Typography>
        </Box>
      </Box>

      {/* Navigation lists */}
      <Box sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto' }}>
        {/* Role Specific Section */}
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1,
            display: 'block',
            fontWeight: 700,
            color: '#94A3B8',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {role === 'HR' ? 'Administration' : role === 'Manager' ? 'Team Management' : 'Employee Portal'}
        </Typography>

        <List disablePadding sx={{ mb: 2 }}>
          {(role === 'HR' ? hrLinks : role === 'Manager' ? managerLinks : employeeLinks).map((item) => {
            const Icon = item.icon;
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isSelected ? 'primary.main' : '#64748B',
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Shared Workflows Section */}
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1,
            display: 'block',
            fontWeight: 700,
            color: '#94A3B8',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Workplace & Connect
        </Typography>

        <List disablePadding>
          {sharedLinks.map((item) => {
            const Icon = item.icon;
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isSelected ? 'primary.main' : '#64748B',
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer system status */}
      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          StaffSync v1.0.0
        </Typography>
        <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
          ● All Systems Operational
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #E2E8F0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #E2E8F0',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
