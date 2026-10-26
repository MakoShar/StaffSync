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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { employeeService } from '../../services/employeeService';

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'General Management',
];

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [empDepartment, setEmpDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [managerId, setManagerId] = useState('');
  const [empStatus, setEmpStatus] = useState('Active');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params = { page: page + 1, limit };
      if (search) params.search = search;
      if (department) params.department = department;
      if (status) params.status = status;

      const res = await employeeService.getEmployees(params);
      setEmployees(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagersList = async () => {
    try {
      const res = await employeeService.getManagers();
      setManagers(res.data);
    } catch (err) {
      console.error('Failed to load managers', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, limit, department, status]);

  useEffect(() => {
    fetchManagersList();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchEmployees();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setEmail('');
    setPassword('StaffSync2026!');
    setRole('Employee');
    setEmployeeId('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmpDepartment('Engineering');
    setDesignation('');
    setManagerId('');
    setEmpStatus('Active');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (emp) => {
    setIsEditing(true);
    setSelectedId(emp._id);
    setEmail(emp.user?.email || '');
    setPassword('');
    setRole(emp.user?.role || 'Employee');
    setEmployeeId(emp.employeeId);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setPhone(emp.phone || '');
    setEmpDepartment(emp.department);
    setDesignation(emp.designation);
    setManagerId(emp.manager?._id || '');
    setEmpStatus(emp.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await employeeService.updateEmployee(selectedId, {
          firstName,
          lastName,
          phone,
          department: empDepartment,
          designation,
          manager: managerId || null,
          status: empStatus,
          role,
        });
        setNotification({ open: true, message: 'Employee updated successfully!', severity: 'success' });
      } else {
        await employeeService.createEmployee({
          email,
          password,
          role,
          employeeId,
          firstName,
          lastName,
          phone,
          department: empDepartment,
          designation,
          manager: managerId || null,
        });
        setNotification({ open: true, message: 'New employee created successfully!', severity: 'success' });
      }
      setModalOpen(false);
      fetchEmployees();
      fetchManagersList();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Employee Directory & Administration"
        subtitle="Search, onboard, manage credentials, and configure organizational reporting lines."
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={openCreateModal}
          >
            Add New Employee
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search name, ID, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="contained" size="small">
                <SearchOutlinedIcon fontSize="small" />
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Status"
              value={status}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
              <MenuItem value="Terminated">Terminated</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Table */}
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner message="Loading employee directory..." />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No Employees Found"
            description="No employee records match the given search criteria."
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Corporate Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Reporting Manager</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{row.employeeId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.firstName} {row.lastName}
                      </TableCell>
                      <TableCell>{row.user?.email || 'N/A'}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell>
                        {row.manager
                          ? `${row.manager.firstName} ${row.manager.lastName}`
                          : '— None (Executive)'}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Employee">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEditModal(row)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
      </Paper>

      {/* Onboard / Edit Employee Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEditing ? 'Edit Employee Details' : 'Onboard New Employee'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID (e.g. EMP-101)"
                  size="small"
                  required
                  disabled={isEditing}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Account Authority (Role)"
                  size="small"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="HR">HR Administrator</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  size="small"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  size="small"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Corporate Email Address"
                  type="email"
                  size="small"
                  required
                  disabled={isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              {!isEditing && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temporary Password"
                    type="password"
                    size="small"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  size="small"
                  required
                  value={empDepartment}
                  onChange={(e) => setEmpDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation / Job Title"
                  size="small"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Assigned Manager"
                  size="small"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  <MenuItem value="">— None (Executive / Unassigned) —</MenuItem>
                  {managers.map((m) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} ({m.department})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>

              {isEditing && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Employment Status"
                    size="small"
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="On Leave">On Leave</MenuItem>
                    <MenuItem value="Terminated">Terminated</MenuItem>
                  </TextField>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setModalOpen(false)} color="inherit" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Employee'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
