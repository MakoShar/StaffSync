import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import NotFoundPage from '../pages/auth/NotFoundPage';

// Shared Pages
import ProfilePage from '../pages/shared/ProfilePage';
import AnnouncementsPage from '../pages/shared/AnnouncementsPage';
import TrainingsCatalogPage from '../pages/shared/TrainingsCatalogPage';

// Employee Pages
import EmployeeDashboardPage from '../pages/employee/EmployeeDashboardPage';
import MyAttendancePage from '../pages/employee/MyAttendancePage';
import MyLeavesPage from '../pages/employee/MyLeavesPage';
import MyTrainingsPage from '../pages/employee/MyTrainingsPage';

// Manager Pages
import ManagerDashboardPage from '../pages/manager/ManagerDashboardPage';
import TeamMembersPage from '../pages/manager/TeamMembersPage';
import TeamAttendancePage from '../pages/manager/TeamAttendancePage';
import LeaveApprovalsPage from '../pages/manager/LeaveApprovalsPage';
import TrainingManagementPage from '../pages/manager/TrainingManagementPage';

// HR Pages
import HrDashboardPage from '../pages/hr/HrDashboardPage';
import EmployeeDirectoryPage from '../pages/hr/EmployeeDirectoryPage';
import AttendanceAdminPage from '../pages/hr/AttendanceAdminPage';
import LeaveAdminPage from '../pages/hr/LeaveAdminPage';
import AnnouncementAdminPage from '../pages/hr/AnnouncementAdminPage';
import ReportsPage from '../pages/hr/ReportsPage';

// Helper component to redirect authenticated users to their primary dashboard
function RoleDefaultRedirect() {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'HR') return <Navigate to="/app/hr/dashboard" replace />;
  if (user.role === 'Manager') return <Navigate to="/app/manager/dashboard" replace />;
  return <Navigate to="/app/employee/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RoleDefaultRedirect />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<RoleDefaultRedirect />} />

          {/* Shared Routes */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="trainings" element={<TrainingsCatalogPage />} />

          {/* Employee Module */}
          <Route element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'HR']} />}>
            <Route path="employee/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="employee/attendance" element={<MyAttendancePage />} />
            <Route path="employee/leaves" element={<MyLeavesPage />} />
            <Route path="employee/trainings" element={<MyTrainingsPage />} />
          </Route>

          {/* Manager Module */}
          <Route element={<ProtectedRoute allowedRoles={['Manager', 'HR']} />}>
            <Route path="manager/dashboard" element={<ManagerDashboardPage />} />
            <Route path="manager/team" element={<TeamMembersPage />} />
            <Route path="manager/attendance" element={<TeamAttendancePage />} />
            <Route path="manager/leaves" element={<LeaveApprovalsPage />} />
            <Route path="manager/trainings" element={<TrainingManagementPage />} />
          </Route>

          {/* HR Module */}
          <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
            <Route path="hr/dashboard" element={<HrDashboardPage />} />
            <Route path="hr/employees" element={<EmployeeDirectoryPage />} />
            <Route path="hr/attendance" element={<AttendanceAdminPage />} />
            <Route path="hr/leaves" element={<LeaveAdminPage />} />
            <Route path="hr/announcements" element={<AnnouncementAdminPage />} />
            <Route path="hr/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
