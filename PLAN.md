# StaffSync — Comprehensive Implementation Plan

## 1. Project Requirements & Scope

StaffSync is an enterprise-grade Human Resource Management System (HRMS) built on the MERN stack. It replaces legacy spreadsheets and disparate tools with an integrated, secure, and responsive web application covering the full employee lifecycle, attendance tracking, leave requests, announcements, training programs, and reporting dashboards.

### In Scope
- **User Roles:** HR, Manager, Employee.
- **Authentication & RBAC:** JWT authentication, bcryptjs password hashing, role-based access control with resource-level permission boundaries.
- **Employee Lifecycle Management:** Employee records CRUD, department assignment, manager-team hierarchy, personal profile updates.
- **Attendance Tracking:** Employee check-in/out, duplicate check-in prevention, work hours calculation, personal/team/company attendance logs.
- **Leave Management:** Application workflow, conflict & date validation, multi-tier approvals (Manager/HR), cancellation, audit logs.
- **Company Announcements:** Targeted communication by role/department with priority levels and lifecycle states.
- **Training & Development:** Team training scheduling by managers, employee self-enrollment/withdrawal, capacity limits.
- **In-App Notification Engine:** Real-time event notifications for leave status changes, training updates, and announcements.
- **Dashboards & Real-time Reports:** Aggregated metrics for HR, team-scoped metrics for Managers, and personal stats for Employees.
- **Automated Testing & Production Builds:** Backend integration tests, API boundary validation, client build checks.

### Out of Scope (Future Phases)
- Hardware biometric device SDK integrations.
- SMS gateway and external SMTP integrations (real in-app notification engine provided).
- External payroll processing engines.

---

## 2. Functional & Non-Functional Requirements

### Functional Requirements
1. **FR-AUTH:** Users must be able to log in securely with email and password, receive a JWT, view their personal profile, and log out.
2. **FR-EMP-1:** HR can create, update, deactivate, search, and filter employee profiles.
3. **FR-EMP-2:** Employees can update permitted personal profile fields (phone, address, emergency contact) without modifying sensitive employment data (salary, designation, department).
4. **FR-MGR-1:** Managers can view their assigned team members and monitor team presence and leave requests.
5. **FR-ATT-1:** Employees can check in once per calendar day and check out when finished, calculating total work hours.
6. **FR-ATT-2:** Duplicate check-ins and check-outs prior to check-in must be rejected with descriptive errors.
7. **FR-ATT-3:** Historical attendance records cannot be tampered with by regular employees.
8. **FR-LEAVE-1:** Employees can submit leave requests specifying type, date range, and reason.
9. **FR-LEAVE-2:** The system must reject invalid date ranges (end date before start date, past dates) and overlapping leave requests.
10. **FR-LEAVE-3:** Managers can approve or reject leaves for their direct reports. HR can review organization-wide leaves. Self-approval is strictly prohibited.
11. **FR-ANN-1:** HR can publish announcements targeted to specific roles or departments with expiration dates.
12. **FR-TRN-1:** Managers and HR can create training programs. Employees can enroll subject to capacity constraints.
13. **FR-NOTIF-1:** System triggers notifications for leave status changes, new announcements, and training updates.
14. **FR-REP-1:** Dashboards must calculate real metrics via database aggregation pipelines without hardcoded values.

### Non-Functional Requirements
1. **NFR-SEC:** Passwords hashed with bcryptjs (salt rounds = 10). Passwords never returned in API responses. Security headers via Helmet. CORS configured strictly for allowed origins. Rate limiting on authentication routes.
2. **NFR-PERF:** API response time < 200ms for common queries. MongoDB compound indexes on high-frequency query paths (`{ employee: 1, date: 1 }`, `{ user: 1 }`, `{ status: 1 }`).
3. **NFR-REL:** Graceful error handling with standardized JSON error responses. Database connection retry and health checks.
4. **NFR-RESP:** Responsive design supporting mobile (320px+), tablet (768px+), and desktop (1024px+) viewports.
5. **NFR-ACC:** WCAG 2.1 AA compliant contrast ratios, accessible form labels, keyboard navigation in Material UI.

---

## 3. User Roles & Permission Matrix

| Operation / Capability | HR | Manager | Employee |
| :--- | :---: | :---: | :---: |
| Authenticate / View Own Profile | ✅ | ✅ | ✅ |
| Update Personal Contact Details | ✅ | ✅ | ✅ (Restricted) |
| Create / Deactivate Employees | ✅ | ❌ | ❌ |
| Edit Employee Salary / Designation | ✅ | ❌ | ❌ |
| View Organization Directory | ✅ (Full) | ✅ (Full) | ✅ (Basic) |
| View Assigned Team Members | ✅ (All) | ✅ (Direct reports) | ❌ |
| Mark Daily Check-In / Check-Out | ✅ | ✅ | ✅ |
| View Personal Attendance History | ✅ | ✅ | ✅ |
| View Team Attendance Logs | ✅ (All) | ✅ (Direct reports) | ❌ |
| Apply for Leave | ✅ | ✅ | ✅ |
| View Personal Leave History | ✅ | ✅ | ✅ |
| Approve / Reject Team Leaves | ✅ (Org-wide) | ✅ (Direct reports only)| ❌ |
| Self-Approve Leave | ❌ | ❌ | ❌ |
| Create / Edit Announcements | ✅ | ❌ | ❌ |
| View Published Announcements | ✅ | ✅ | ✅ |
| Create Training Programs | ✅ | ✅ (Team scope) | ❌ |
| Enroll in Training Program | ✅ | ✅ | ✅ |
| View Notifications & Mark Read | ✅ | ✅ | ✅ |
| Access HR Analytics Dashboard | ✅ | ❌ | ❌ |
| Access Team Dashboard | ✅ | ✅ | ❌ |
| Access Personal Dashboard | ✅ | ✅ | ✅ |

---

## 4. Application Architecture

```
                               ┌──────────────────────────┐
                               │  Browser (React 18 SPA)  │
                               │  - Material UI v5        │
                               │  - Redux Toolkit         │
                               │  - React Router v6       │
                               └─────────────┬────────────┘
                                             │ HTTPS / JSON
                                             ▼
                               ┌──────────────────────────┐
                               │     Express.js API       │
                               │  - Helmet & CORS         │
                               │  - JWT Auth Middleware   │
                               │  - RBAC Guard Middleware │
                               │  - Error Handler         │
                               └─────────────┬────────────┘
                                             │
                      ┌──────────────────────┼──────────────────────┐
                      ▼                      ▼                      ▼
             ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
             │  Auth & Users   │    │ Attendance &    │    │ Training &      │
             │  Controllers    │    │ Leave Services  │    │ Announcements   │
             └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                      │                      │                      │
                      └──────────────────────┼──────────────────────┘
                                             ▼
                               ┌──────────────────────────┐
                               │    Mongoose ODM Layer    │
                               │  - Schema Validation     │
                               │  - Custom Indexes        │
                               │  - Query Aggregation     │
                               └─────────────┬────────────┘
                                             ▼
                               ┌──────────────────────────┐
                               │     MongoDB Cluster      │
                               │ (Atlas / Local Database) │
                               └──────────────────────────┘
```

---

## 5. Proposed Directory Structure

```
StaffSync/
├── README.md
├── PLAN.md
├── .gitignore
├── package.json
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   └── StatusChip.jsx
│   │   │   └── notifications/
│   │   │       └── NotificationMenu.jsx
│   │   ├── features/
│   │   │   ├── auth/authSlice.js
│   │   │   ├── employees/employeeSlice.js
│   │   │   ├── attendance/attendanceSlice.js
│   │   │   ├── leaves/leaveSlice.js
│   │   │   ├── announcements/announcementSlice.js
│   │   │   ├── trainings/trainingSlice.js
│   │   │   └── reports/reportSlice.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useNotification.js
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── NotFoundPage.jsx
│   │   │   │   └── UnauthorizedPage.jsx
│   │   │   ├── hr/
│   │   │   │   ├── HrDashboardPage.jsx
│   │   │   │   ├── EmployeeDirectoryPage.jsx
│   │   │   │   ├── EmployeeFormPage.jsx
│   │   │   │   ├── AttendanceAdminPage.jsx
│   │   │   │   ├── LeaveAdminPage.jsx
│   │   │   │   ├── AnnouncementAdminPage.jsx
│   │   │   │   └── ReportsPage.jsx
│   │   │   ├── manager/
│   │   │   │   ├── ManagerDashboardPage.jsx
│   │   │   │   ├── TeamMembersPage.jsx
│   │   │   │   ├── TeamAttendancePage.jsx
│   │   │   │   ├── LeaveApprovalsPage.jsx
│   │   │   │   └── TrainingManagementPage.jsx
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeDashboardPage.jsx
│   │   │   │   ├── MyAttendancePage.jsx
│   │   │   │   ├── ApplyLeavePage.jsx
│   │   │   │   ├── MyLeavesPage.jsx
│   │   │   │   └── MyTrainingsPage.jsx
│   │   │   └── shared/
│   │   │       ├── ProfilePage.jsx
│   │   │       ├── AnnouncementsPage.jsx
│   │   │       └── TrainingsCatalogPage.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── employeeService.js
│   │   │   ├── attendanceService.js
│   │   │   ├── leaveService.js
│   │   │   ├── announcementService.js
│   │   │   ├── trainingService.js
│   │   │   └── reportService.js
│   │   ├── theme/
│   │   │   └── theme.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── tests/
│       └── App.test.jsx
│
└── server/
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── config/
    │   │   ├── db.js
    │   │   └── env.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── employeeController.js
    │   │   ├── managerController.js
    │   │   ├── attendanceController.js
    │   │   ├── leaveController.js
    │   │   ├── announcementController.js
    │   │   ├── trainingController.js
    │   │   ├── notificationController.js
    │   │   └── reportController.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   ├── rbacMiddleware.js
    │   │   ├── errorMiddleware.js
    │   │   └── validateMiddleware.js
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Employee.js
    │   │   ├── Attendance.js
    │   │   ├── Leave.js
    │   │   ├── Announcement.js
    │   │   ├── Training.js
    │   │   └── Notification.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── employeeRoutes.js
    │   │   ├── managerRoutes.js
    │   │   ├── attendanceRoutes.js
    │   │   ├── leaveRoutes.js
    │   │   ├── announcementRoutes.js
    │   │   ├── trainingRoutes.js
    │   │   ├── notificationRoutes.js
    │   │   └── reportRoutes.js
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── attendanceService.js
    │   │   ├── leaveService.js
    │   │   ├── notificationService.js
    │   │   └── reportService.js
    │   ├── utils/
    │   │   ├── jwt.js
    │   │   ├── logger.js
    │   │   └── seeder.js
    │   └── app.js
    ├── tests/
    │   ├── auth.test.js
    │   ├── employee.test.js
    │   ├── attendance.test.js
    │   ├── leave.test.js
    │   └── rbac.test.js
    └── server.js
```

---

## 6. Database Schema Design & Relationships

### Collections & Relationships
```
[User] 1 ──── 1 [Employee]
                  │
                  ├──── 0..* [Attendance]
                  ├──── 0..* [Leave] (as applicant)
                  ├──── 0..* [Leave] (as reviewer)
                  ├──── 0..* [Training] (enrolled)
                  ├──── 0..* [Announcement] (author)
                  └──── 0..* [Employee] (direct reports via manager ref)

[User] 1 ──── 0..* [Notification] (recipient)
```

1. **User Schema**:
   - `email`: String, required, unique, lowercase, trimmed, indexed.
   - `password`: String, required (hashed with bcryptjs, select: false by default).
   - `role`: String, enum: `['HR', 'Manager', 'Employee']`, default: `'Employee'`.
   - `isActive`: Boolean, default: `true`.
   - `lastLogin`: Date.
   - Timestamps: `createdAt`, `updatedAt`.

2. **Employee Schema**:
   - `user`: ObjectId (ref: `'User'`), required, unique, indexed.
   - `employeeId`: String, required, unique, indexed (e.g., `EMP-1001`).
   - `firstName`: String, required, trimmed.
   - `lastName`: String, required, trimmed.
   - `phone`: String, trimmed.
   - `department`: String, required, enum: `['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations']`.
   - `designation`: String, required, trimmed.
   - `joiningDate`: Date, required.
   - `manager`: ObjectId (ref: `'Employee'`), default: null, indexed.
   - `address`: { `street`: String, `city`: String, `state`: String, `postalCode`: String }.
   - `emergencyContact`: { `name`: String, `relationship`: String, `phone`: String }.
   - `status`: String, enum: `['Active', 'On Leave', 'Terminated']`, default: `'Active'`.
   - Timestamps: `createdAt`, `updatedAt`.

3. **Attendance Schema**:
   - `employee`: ObjectId (ref: `'Employee'`), required, indexed.
   - `date`: Date, required (normalized UTC midnight `YYYY-MM-DD`).
   - `checkIn`: Date, required.
   - `checkOut`: Date, default: null.
   - `workHours`: Number, default: 0.
   - `status`: String, enum: `['Present', 'Half Day', 'Late', 'Absent']`, default: `'Present'`.
   - `remarks`: String.
   - Compound Index: `{ employee: 1, date: 1 }` with `{ unique: true }`.

4. **Leave Schema**:
   - `employee`: ObjectId (ref: `'Employee'`), required, indexed.
   - `leaveType`: String, enum: `['Casual', 'Sick', 'Annual', 'Maternity', 'Unpaid']`, required.
   - `startDate`: Date, required.
   - `endDate`: Date, required.
   - `daysCount`: Number, required, min: 1.
   - `reason`: String, required.
   - `status`: String, enum: `['Pending', 'Approved', 'Rejected', 'Cancelled']`, default: `'Pending'`.
   - `reviewer`: ObjectId (ref: `'Employee'`), default: null.
   - `reviewedAt`: Date.
   - `reviewRemarks`: String.
   - Index: `{ employee: 1, status: 1 }`, `{ status: 1, startDate: 1 }`.

5. **Announcement Schema**:
   - `title`: String, required.
   - `content`: String, required.
   - `author`: ObjectId (ref: `'Employee'`), required.
   - `targetAudience`: String, enum: `['All', 'Department', 'Managers']`, default: `'All'`.
   - `targetDepartment`: String, default: null.
   - `priority`: String, enum: `['Low', 'Medium', 'High', 'Urgent']`, default: `'Medium'`.
   - `isPublished`: Boolean, default: true.
   - `expiresAt`: Date.
   - Timestamps: `createdAt`, `updatedAt`.

6. **Training Schema**:
   - `title`: String, required.
   - `description`: String, required.
   - `instructor`: String, required.
   - `department`: String, default: null.
   - `startDate`: Date, required.
   - `endDate`: Date, required.
   - `capacity`: Number, default: 30.
   - `enrolledEmployees`: [ObjectId (ref: `'Employee'`)].
   - `status`: String, enum: `['Scheduled', 'In Progress', 'Completed', 'Cancelled']`, default: `'Scheduled'`.
   - Timestamps: `createdAt`, `updatedAt`.

7. **Notification Schema**:
   - `recipient`: ObjectId (ref: `'User'`), required, indexed.
   - `title`: String, required.
   - `message`: String, required.
   - `type`: String, enum: `['Leave', 'Attendance', 'Announcement', 'Training', 'System']`, required.
   - `relatedId`: ObjectId, default: null.
   - `isRead`: Boolean, default: false, indexed.
   - Timestamps: `createdAt`, `updatedAt`.

---

## 7. API Design & Endpoint Specifications

Prefix: `/api/v1`

### 1. Authentication (`/api/v1/auth`)
- `POST /auth/login` — Public. Body: `{ email, password }`. Returns: `{ token, user, employee }`.
- `GET /auth/me` — Protected (All). Returns: current user and linked employee profile.
- `POST /auth/logout` — Protected (All). Returns: `{ message: "Logged out successfully" }`.

### 2. Employees (`/api/v1/employees`)
- `GET /employees` — Protected (`HR`). Query: `page, limit, search, department, status`. Returns paginated employees.
- `GET /employees/directory` — Protected (All). Returns public directory list.
- `GET /employees/:id` — Protected (Self/Manager/HR). Returns full employee record.
- `POST /employees` — Protected (`HR`). Body: `{ email, password, firstName, lastName, phone, department, designation, joiningDate, manager, ... }`.
- `PUT /employees/:id` — Protected (`HR`). Updates employee details.
- `PATCH /employees/profile/me` — Protected (Self). Body: `{ phone, address, emergencyContact }`.
- `PATCH /employees/:id/status` — Protected (`HR`). Body: `{ status }`.

### 3. Managers & Teams (`/api/v1/managers`)
- `GET /managers` — Protected (`HR`). Returns list of all managers.
- `GET /managers/my-team` — Protected (`Manager`). Returns direct reports with recent presence status.

### 4. Attendance (`/api/v1/attendance`)
- `POST /attendance/check-in` — Protected (Self). Validates no existing check-in for today, records UTC time.
- `POST /attendance/check-out` — Protected (Self). Validates existing check-in, calculates hours, updates checkout.
- `GET /attendance/today` — Protected (Self). Returns today's check-in/out status.
- `GET /attendance/my-history` — Protected (Self). Query: `startDate, endDate, page, limit`.
- `GET /attendance/team` — Protected (`Manager`). Returns team members' attendance for date.
- `GET /attendance/all` — Protected (`HR`). Organization-wide attendance records with date filters.

### 5. Leaves (`/api/v1/leaves`)
- `POST /leaves` — Protected (Self). Body: `{ leaveType, startDate, endDate, reason }`. Validates dates & overlaps.
- `GET /leaves/my-leaves` — Protected (Self). Returns user's leave requests.
- `GET /leaves/team-leaves` — Protected (`Manager`). Returns pending/reviewed leaves for direct reports.
- `GET /leaves/all` — Protected (`HR`). Returns organization-wide leaves with filters.
- `PATCH /leaves/:id/review` — Protected (`Manager`, `HR`). Body: `{ status: 'Approved' | 'Rejected', remarks }`.
- `DELETE /leaves/:id` — Protected (Self). Cancels pending leave.

### 6. Announcements (`/api/v1/announcements`)
- `GET /announcements` — Protected (All). Returns announcements visible to user's role and department.
- `POST /announcements` — Protected (`HR`). Body: `{ title, content, targetAudience, targetDepartment, priority, expiresAt }`.
- `PUT /announcements/:id` — Protected (`HR`). Updates announcement.
- `DELETE /announcements/:id` — Protected (`HR`). Deletes/archives announcement.

### 7. Trainings (`/api/v1/trainings`)
- `GET /trainings` — Protected (All). Returns scheduled trainings.
- `POST /trainings` — Protected (`Manager`, `HR`). Body: `{ title, description, instructor, startDate, endDate, capacity }`.
- `POST /trainings/:id/enroll` — Protected (Self). Checks capacity and duplicate enrollment, adds employee.
- `POST /trainings/:id/withdraw` — Protected (Self). Removes employee from enrollment list.
- `PUT /trainings/:id` — Protected (`Manager`, `HR`). Updates training session.

### 8. Notifications (`/api/v1/notifications`)
- `GET /notifications` — Protected (All). Returns notifications with unread count.
- `PATCH /notifications/:id/read` — Protected (All). Marks single notification read.
- `PATCH /notifications/read-all` — Protected (All). Marks all user notifications read.

### 9. Reports & Analytics (`/api/v1/reports`)
- `GET /reports/hr-dashboard` — Protected (`HR`). Returns total active employees, department breakdown, today's attendance summary, pending leaves.
- `GET /reports/manager-dashboard` — Protected (`Manager`). Returns team size, today's team attendance count, pending team leave approvals.
- `GET /reports/employee-dashboard` — Protected (Self). Returns monthly attendance percentage, pending leave count, enrolled training count.

---

## 8. Frontend Pages, Components & Routing

### Routing Plan
- `/login` — Public (redirects to role dashboard if authenticated)
- `/unauthorized` — Error page for role denial
- `*` — 404 Not Found Page
- **Dashboard Layout Routes (`/app`):**
  - **Shared:**
    - `/app/profile` — View/update profile
    - `/app/announcements` — Company announcements feed
    - `/app/trainings` — Training catalog
  - **Employee:**
    - `/app/employee/dashboard`
    - `/app/employee/attendance`
    - `/app/employee/leaves`
    - `/app/employee/leaves/apply`
    - `/app/employee/trainings`
  - **Manager:**
    - `/app/manager/dashboard`
    - `/app/manager/team`
    - `/app/manager/attendance`
    - `/app/manager/leaves`
    - `/app/manager/trainings`
  - **HR:**
    - `/app/hr/dashboard`
    - `/app/hr/employees`
    - `/app/hr/employees/new`
    - `/app/hr/employees/:id/edit`
    - `/app/hr/attendance`
    - `/app/hr/leaves`
    - `/app/hr/announcements`
    - `/app/hr/reports`

### UI Design System (Material UI)
- **Palette:**
  - Primary: Deep Indigo `#1E293B` / Modern Royal Blue `#2563EB`
  - Secondary: Teal / Emerald `#0D9488`
  - Background: Clean Slate `#F8FAFC`, Paper `#FFFFFF`
  - Status Colors: Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`, Info `#0284C7`
- **Typography:** `Inter`, `Roboto`, `system-ui` with crisp contrast and structured hierarchy.
- **Components:** Responsive App Bar, Collapsible Sidebar with badge counters, dynamic KPI Cards, Material UI DataTables with pagination, confirmation modal dialogs, and accessible snackbars.

---

## 9. Testing & QA Strategy

1. **Backend Integration Tests:**
   - Vitest / Supertest suite running against in-memory MongoDB (`mongodb-memory-server`).
   - Test suites:
     - `auth.test.js`: Login success, bad password, expired/malformed token, session check.
     - `employee.test.js`: CRUD access boundaries, regular employee forbidden from modifying salary/designation.
     - `attendance.test.js`: Daily check-in, duplicate check-in rejection, check-out calculation.
     - `leave.test.js`: Date validation, overlapping request prevention, manager direct-report approval, self-approval prevention.
     - `rbac.test.js`: 403 Forbidden checks for unauthorized role endpoints.
2. **Frontend Build & Unit Tests:**
   - Vitest unit tests verifying route guards, authentication state handling, and render integrity.
   - Production Vite build verification (`npm run build`).

---

## 10. Security Checklist

- [x] Secure password hashing with `bcryptjs`.
- [x] Password fields excluded by default from database queries (`select: false`).
- [x] Stateless JWT with HMAC-SHA256 signature and expiration.
- [x] Rate limiting configured on `/api/v1/auth/login`.
- [x] HTTP headers secured with `helmet`.
- [x] Restrictive CORS configured for trusted client origin.
- [x] Role and resource-level authorization enforced on every protected route.
- [x] Input validation and sanitization on all POST/PUT/PATCH bodies.
- [x] No sensitive credentials or API keys hardcoded in version control.
- [x] Safe environment variable seeding via documented script.

---

## 11. Implementation Phases & Status

| Phase | Description | Status |
| :--- | :--- | :---: |
| **Phase 0** | Workspace inspection, README.md & PLAN.md documentation | **COMPLETED** |
| **Phase 1** | Project foundation: client & server setup, configs, health check | **COMPLETED** |
| **Phase 2** | Database schemas, JWT authentication, RBAC middleware, admin seeder | **COMPLETED** |
| **Phase 3** | Employee & Manager CRUD, team assignments, access boundaries | **COMPLETED** |
| **Phase 4** | Attendance module: check-in/out, logs, duplicate guards, audit | **COMPLETED** |
| **Phase 5** | Leave management: application, conflict checks, multi-tier approvals | **COMPLETED** |
| **Phase 6** | Announcements, training programs, and in-app notifications engine | **COMPLETED** |
| **Phase 7** | Dashboards & Reports: real-time aggregation metrics for all 3 roles | **COMPLETED** |
| **Phase 8** | Enterprise UI/UX: Material UI layouts, responsive design, feedback states | **COMPLETED** |
| **Phase 9** | Automated test suites execution, build verification, security audit | **COMPLETED** |
| **Phase 10**| Final end-to-end verification, startup validation, documentation handover | **COMPLETED** |

---

## 12. Definition of Done (DoD)

StaffSync is complete when:
1. All three user roles (HR, Manager, Employee) can log in, view role-tailored dashboards, and navigate their permitted workflows.
2. Server-side authorization strictly verifies role and resource ownership on all endpoints.
3. Attendance prevents duplicate check-ins and tracks daily presence accurately.
4. Leave workflows reject invalid date ranges and overlapping leaves, and enforce approval rules without self-approvals.
5. Announcements, trainings, and notifications interact seamlessly with live database events.
6. Dashboards display real-time calculated metrics from MongoDB aggregations.
7. Automated test suites pass successfully.
8. Frontend and backend production builds succeed without compilation errors.
9. Documentation (`README.md` and `PLAN.md`) accurately mirrors the final implementation.
