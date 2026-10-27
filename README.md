# StaffSync — Modern Human Resource Management System (HRMS)

StaffSync is an enterprise-grade, centralized Human Resource Management System (HRMS) built on the MERN stack (MongoDB, Express.js, React, Node.js). It streamlines core organizational operations including workforce administration, attendance tracking, leave request lifecycles, team training programs, company-wide announcements, notification broadcasts, and role-specific analytics reporting.

---

## 1. Problem Statement & Project Objectives

### Problem Statement
Traditional human resource workflows are often fragmented across disparate spreadsheets, paper-based forms, manual email approval chains, and disconnected software tools. This fragmentation leads to:
- Time-consuming administrative overhead and reporting delays.
- Inaccurate attendance records, buddy punching, and lack of real-time presence visibility.
- Confusing leave tracking with unverified overlapping dates and lack of audit trails.
- Siloed manager-team communications and delayed leave review cycles.
- Ineffective dissemination of critical organizational announcements and training initiatives.

### Project Objectives
StaffSync provides a unified, secure, and responsive web platform designed to:
- **Centralize Identity & Access Management:** Provide robust role-based access control (RBAC) across three distinct organizational roles: **HR**, **Manager**, and **Employee**.
- **Automate Core HR Lifecycles:** Digitize employee onboarding, attendance marking/tracking, leave requests with strict server-side validation, and training enrollments.
- **Enforce Backend Authority:** Guarantee that all permissions, team boundaries, and workflow state transitions are securely validated on the server.
- **Provide Actionable Insights:** Deliver real-time, data-driven dashboards and reports calculated dynamically from MongoDB data.
- **Deliver an Enterprise UI/UX:** Offer a responsive, clean, accessible Material UI frontend that works seamlessly across desktop, tablet, and mobile screens.

---

## 2. Key Features & Supported User Roles

StaffSync strictly enforces role-based workflows across three core roles:

| Module | HR Administrator | Department/Team Manager | Employee |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | Login, session handling, view profile | Login, session handling, view profile | Login, session handling, update permitted profile fields (phone, address, emergency contact) |
| **Employee Directory** | Full CRUD: Create, View, Edit, Deactivate, search & filter all employees | View authorized team members and basic directory contact cards | View self profile and organization directory listing |
| **Manager Administration** | Assign/reassign managers to departments and employees | View assigned direct reports | View designated direct manager |
| **Attendance Management** | Org-wide attendance monitoring, date/status filtering, summary metrics | View team attendance logs, monitor daily check-in status | "Mark Present" check-in/out button, 30-Day visual Attendance Calendar with status color matrix, punctuality statistics, detailed audit logs |
| **Leave Management** | Organization-wide leave oversight, administrative review, balance adjustments | Review, approve, or reject direct reports' leave requests with remarks | Submit leave requests, view personal leave status/history, prevent overlapping requests |
| **Announcements** | Create, edit, publish, target, and archive organizational announcements | View published announcements relevant to audience | View published announcements relevant to audience |
| **Training & Development**| Org-wide training program oversight and tracking | Create, update, and manage training sessions for team | Browse programs, self-enroll/withdraw (capacity & duplicate check) |
| **In-App Notifications** | Receive system alerts, approval summaries, and workflow events | Receive notifications on team leave requests and training updates | Receive instant alerts on leave approvals, rejections, and announcements |
| **Reports & Analytics** | Real-time metrics: headcount, department distribution, attendance rate, leave status | Team-scoped analytics: team presence, pending leave approvals, training completion | Personal statistics: annual leave balances, monthly attendance percentage, enrolled courses |

---

## 3. Technology Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4.x)
- **Database:** MongoDB with Mongoose ODM (v8.x)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), secure password hashing (`bcryptjs`)
- **Security & Middleware:** `helmet` for HTTP headers, `cors` for restricted origin handling, `express-rate-limit` for brute-force protection, centralized asynchronous error handling
- **Validation:** Express middleware with schema sanitization and strict validation rules
- **Testing:** Vitest / Supertest with in-memory MongoDB runner (`mongodb-memory-server`)

### Frontend
- **Framework & Build:** React 18+ with Vite
- **UI Component Library:** Material UI (MUI v5+), `@mui/icons-material`
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router v6 (protected routes with role-based guards)
- **HTTP Client:** Axios (configured with interceptors for JWT injection and centralized 401 handling)
- **Data Visualization:** Chart.js / Recharts for reporting analytics
- **Testing:** Vitest, React Testing Library

---

## 4. High-Level Architecture

StaffSync adopts a decoupled client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React / Vite Client                   │
│   (Material UI, Redux Toolkit, Protected Layouts)      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Express.js API Server                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middlewares: Helmet, CORS, Rate Limit, Auth, RBAC│  │
│  └──────────────────────────┬───────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │ Controllers: Auth, Employee, Leave, Attend, etc. │  │
│  └──────────────────────────┬───────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │ Services & Business Rules Layer                  │  │
│  └──────────────────────────┬───────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │ Mongoose Models & Data Layer                     │  │
│  └──────────────────────────┬───────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Database                     │
│  (Users, Employees, Attendance, Leaves, Notifications) │
└────────────────────────────────────────────────────────┘
```

---

## 5. Project Folder Structure

```
StaffSync/
├── README.md                          # Comprehensive project documentation
├── PLAN.md                            # Detailed implementation roadmap & tracking
├── .gitignore                         # Root git ignore rules
├── package.json                       # Root orchestration scripts
│
├── client/                            # Frontend Single Page Application
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── app/                       # Redux store configuration
│       │   └── store.js
│       ├── assets/                    # Static assets, branding, and icons
│       ├── components/                # Reusable UI primitives (Cards, Modals, Tables, Status Chips)
│       ├── features/                  # Redux slices by domain (auth, employees, leaves, attendance, etc.)
│       ├── hooks/                     # Custom React hooks (useAuth, useNotification)
│       ├── layouts/                   # DashboardLayout, AuthLayout, Navbar, Sidebar
│       ├── pages/                     # Routed view components
│       │   ├── auth/                  # Login, Unauthorized, NotFound
│       │   ├── hr/                    # HR Dashboard, Directory, LeaveAdmin, Reports
│       │   ├── manager/               # Manager Dashboard, TeamAttendance, LeaveApprovals
│       │   ├── employee/              # Employee Dashboard, MyAttendance, ApplyLeave
│       │   └── shared/                # Profile, Announcements, Trainings
│       ├── routes/                    # AppRoutes, ProtectedRoute guard
│       ├── services/                  # Axios API clients
│       ├── theme/                     # Material UI enterprise theme palette & typography
│       ├── utils/                     # Formatting helpers, date formatters, error parsers
│       ├── App.jsx
│       └── main.jsx
│
└── server/                            # Backend REST API Server
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── config/                    # Database connection, env loader, constants
    │   ├── controllers/               # HTTP request handlers
    │   ├── middleware/                # authMiddleware, rbacMiddleware, validate, errorHandler
    │   ├── models/                    # Mongoose Schemas (User, Employee, Attendance, Leave, etc.)
    │   ├── routes/                    # API route definitions (/api/v1/...)
    │   ├── services/                  # Business logic & aggregation pipelines
    │   ├── utils/                     # Token generators, seeders, logger
    │   ├── validators/                # Input validation schemas & sanitizers
    │   └── app.js                     # Express app setup and middleware registration
    ├── tests/                         # Automated unit & integration tests
    └── server.js                      # HTTP server entry point and lifecycle handler
```

---

## 6. Database Collections & Schema Design

StaffSync uses normalized relational references inside MongoDB via Mongoose:

1. **`users`**:
   - Authentication credentials and account authority.
   - Fields: `email` (unique, lowercase), `password` (hashed with bcrypt), `role` (`'HR' | 'Manager' | 'Employee'`), `isActive` (boolean), `lastLogin` (date), timestamps.
2. **`employees`**:
   - Organizational profile associated 1-to-1 with a User record.
   - Fields: `user` (ref: User), `employeeId` (unique string, e.g. "EMP-1001"), `firstName`, `lastName`, `phone`, `department` (e.g., "Engineering", "HR", "Sales", "Marketing"), `designation`, `joiningDate`, `manager` (ref: Employee, nullable for top executives), `address`, `emergencyContact`, `status` (`'Active' | 'On Leave' | 'Terminated'`), timestamps.
3. **`attendances`**:
   - Daily attendance records with check-in and check-out logs.
   - Fields: `employee` (ref: Employee), `date` (normalized UTC start-of-day), `checkIn` (timestamp), `checkOut` (timestamp), `workHours` (number), `status` (`'Present' | 'Half Day' | 'Late' | 'Absent'`), `remarks`, timestamps.
   - Indexes: Compound unique index on `{ employee: 1, date: 1 }` to prevent duplicate daily check-ins.
4. **`leaves`**:
   - Formal leave applications and multi-step review state.
   - Fields: `employee` (ref: Employee), `leaveType` (`'Casual' | 'Sick' | 'Annual' | 'Maternity' | 'Unpaid'`), `startDate` (date), `endDate` (date), `daysCount` (number), `reason` (string), `status` (`'Pending' | 'Approved' | 'Rejected' | 'Cancelled'`), `reviewer` (ref: Employee), `reviewedAt` (timestamp), `reviewRemarks` (string), timestamps.
5. **`announcements`**:
   - Corporate announcements with targeting and lifecycle status.
   - Fields: `title`, `content`, `author` (ref: Employee), `targetAudience` (`'All' | 'Department' | 'Managers'`), `targetDepartment` (optional string), `priority` (`'Low' | 'Medium' | 'High' | 'Urgent'`), `isPublished` (boolean), `expiresAt` (date), timestamps.
6. **`trainings`**:
   - Professional development modules and participant rosters.
   - Fields: `title`, `description`, `instructor` (string / ref: Employee), `department` (optional), `startDate` (date), `endDate` (date), `capacity` (number), `enrolledEmployees` (array of refs: Employee), `status` (`'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'`), timestamps.
7. **`notifications`**:
   - Direct user notifications for workflow events.
   - Fields: `recipient` (ref: User), `title`, `message`, `type` (`'Leave' | 'Attendance' | 'Announcement' | 'Training' | 'System'`), `relatedId` (ObjectId), `isRead` (boolean), timestamps.

---

## 7. Authentication & Authorization Approach

1. **Authentication:**
   - Stateless JWT tokens containing `{ userId, role, employeeId }`.
   - Sent via standard `Authorization: Bearer <token>` header or Secure HTTP-only cookies.
   - Passwords hashed using `bcryptjs` with a cost factor of 10.
   - Plaintext passwords and password hashes are never returned in JSON payloads.
2. **Role-Based Access Control (RBAC):**
   - Implemented via reusable server-side middleware: `authorize(['HR'])`, `authorize(['HR', 'Manager'])`.
   - Resource-level checks verify team ownership:
     - Managers can only view or approve leave for their assigned direct reports (`manager._id === employee.manager`).
     - Employees can only view or mutate their own profile and attendance records (`employee.user === req.user._id`).
   - Route-level and UI-level guards ensure unauthorized users are redirected with clean `403 Forbidden` feedback.

---

## 8. System Prerequisites & Specifications

To ensure smooth development, deployment, and usage of the StaffSync HRM Tool Web Application, the following software and hardware requirements must be met:

### 1. Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux (cross-platform support).
- **Node.js (v16 or above):** Runtime environment for executing frontend tooling and server-side Express API routing.
- **npm (v8 or above):** Package manager required to manage frontend and backend dependencies.
- **React.js:** Single-page application library for building dynamic, responsive UI.
- **Express.js:** Lightweight web framework for RESTful API endpoints.
- **MongoDB:** Community Server or MongoDB Atlas cluster for document persistence (with embedded `mongodb-memory-server` fallback for zero-config development).
- **Web Browser:** Google Chrome or Mozilla Firefox (latest version) for real-time interface rendering.
- **Development Tools:** Visual Studio Code (recommended editor) and Postman / REST Client (for API endpoint testing).

### 2. Hardware Requirements
- **Processor:** Intel Core i5 (8th Gen or above) / AMD Ryzen 5 or better.
- **RAM:** Minimum 8 GB (16 GB recommended) for concurrent dev servers, IDE, and browser testing.
- **Storage:** At least 1 GB free disk space for package dependencies, MongoDB storage, and builds.
- **Display Resolution:** 1366x768 or higher recommended for optimal layout and dashboard visibility.

---

## 9. Environment Variable Setup

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/staffsync
JWT_SECRET=super_secret_jwt_key_staffsync_enterprise_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Initial Admin Seeding Configuration
SEED_HR_EMAIL=admin@staffsync.internal
SEED_HR_PASSWORD=AdminStaffSync2026!
SEED_HR_FIRSTNAME=System
SEED_HR_LASTNAME=Administrator
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 10. Installation & Startup Instructions

### 1. Root Installation (All dependencies)
```bash
# Clone the repository
git clone https://github.com/MakoShar/StaffSync.git
cd StaffSync

# Install root, backend, and frontend packages
npm run install:all
```

### 2. Backend Startup
```bash
cd server
npm install
npm run seed     # One-time safe initialization of HR admin and test demo data
npm run dev      # Launches Express API server with nodemon on port 5000
```

### 3. Frontend Startup
```bash
cd client
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
```

---

## 11. API Endpoints Documentation (`/api/v1`)

### Authentication (`/api/v1/auth`)
- `POST /auth/login` — Public. Authenticates user, returns JWT and user profile.
- `GET /auth/me` — Protected (All). Returns current authenticated user profile.
- `POST /auth/logout` — Protected (All). Invalidates session.

### Employees (`/api/v1/employees`)
- `GET /employees` — Protected (`HR`). Lists all employees with pagination, search, and department filter.
- `GET /employees/directory` — Protected (All). Returns public directory list (name, department, email, designation).
- `GET /employees/:id` — Protected (Self / Manager / HR). Returns detailed employee profile.
- `POST /employees` — Protected (`HR`). Creates new employee and associated User account.
- `PUT /employees/:id` — Protected (`HR`). Updates employee operational details.
- `PATCH /employees/profile/me` — Protected (Self). Updates permitted personal fields (phone, address, emergency contact).
- `PATCH /employees/:id/status` — Protected (`HR`). Deactivates/activates employee.

### Managers & Teams (`/api/v1/managers`)
- `GET /managers` — Protected (`HR`). Lists all employees with manager designation.
- `GET /managers/my-team` — Protected (`Manager`). Returns direct reports of the authenticated manager.

### Attendance (`/api/v1/attendance`)
- `POST /attendance/check-in` — Protected (Self). Records daily check-in timestamp.
- `POST /attendance/check-out` — Protected (Self). Records daily check-out timestamp and calculates work hours.
- `GET /attendance/today` — Protected (Self). Returns today's check-in status.
- `GET /attendance/my-history` — Protected (Self). Returns user's attendance records with date filters.
- `GET /attendance/team` — Protected (`Manager`). Returns attendance logs for direct reports.
- `GET /attendance/all` — Protected (`HR`). Organization-wide attendance records with filtering and export.

### Leaves (`/api/v1/leaves`)
- `POST /leaves` — Protected (Self). Submits a new leave request (validates date ranges & conflicts).
- `GET /leaves/my-leaves` — Protected (Self). Lists authenticated employee's leave applications.
- `GET /leaves/team-leaves` — Protected (`Manager`). Lists pending and reviewed leaves for direct reports.
- `GET /leaves/all` — Protected (`HR`). Organization-wide leave applications with status filter.
- `PATCH /leaves/:id/review` — Protected (`Manager`, `HR`). Approves or rejects leave with remarks.
- `DELETE /leaves/:id` — Protected (Self). Cancels a pending leave request.

### Announcements (`/api/v1/announcements`)
- `GET /announcements` — Protected (All). Fetches announcements visible to the user's role/department.
- `POST /announcements` — Protected (`HR`). Creates a new announcement.
- `PUT /announcements/:id` — Protected (`HR`). Updates an announcement.
- `DELETE /announcements/:id` — Protected (`HR`). Archives or deletes an announcement.

### Training & Development (`/api/v1/trainings`)
- `GET /trainings` — Protected (All). Lists available training programs.
- `POST /trainings` — Protected (`Manager`, `HR`). Creates a new training session.
- `POST /trainings/:id/enroll` — Protected (Self). Enrolls authenticated employee in training session.
- `POST /trainings/:id/withdraw` — Protected (Self). Withdraws from enrolled training session.
- `PUT /trainings/:id` — Protected (`Manager`, `HR`). Modifies training details or schedule.

### Notifications (`/api/v1/notifications`)
- `GET /notifications` — Protected (All). Fetches notifications for authenticated user.
- `PATCH /notifications/:id/read` — Protected (All). Marks a notification as read.
- `PATCH /notifications/read-all` — Protected (All). Marks all user notifications as read.

### Reports & Analytics (`/api/v1/reports`)
- `GET /reports/hr-dashboard` — Protected (`HR`). Real-time metrics: active employees, department count, today's attendance rate, pending leaves.
- `GET /reports/manager-dashboard` — Protected (`Manager`). Team attendance rate, pending approvals, team size.
- `GET /reports/employee-dashboard` — Protected (Self). Personal attendance summary, leave balances, upcoming trainings.

---

## 12. Testing Instructions

StaffSync includes automated tests covering authentication, access control, core business rules, and API boundaries.

```bash
# Run backend tests
cd server
npm test

# Run backend test with coverage
npm run test:coverage

# Run frontend tests
cd client
npm test
```

---

## 13. Build & Deployment Instructions

### Production Build
```bash
# Build the client bundle
cd client
npm run build
# Artifacts are generated in client/dist/
```

### Production Deployment Strategy
1. **Hosting on Vercel (Recommended):**
   - **Unified Monorepo Deployment**: StaffSync includes pre-configured [vercel.json](file:///home/anoop/Documents/SkillWallet/vercel.json) and [api/index.js](file:///home/anoop/Documents/SkillWallet/api/index.js) for zero-config Vercel deployment.
   - **Client SPA Routing**: Includes [client/vercel.json](file:///home/anoop/Documents/SkillWallet/client/vercel.json) ensuring all React Router routes resolve cleanly without 404 errors on page reload.
   - **Serverless API**: The Express backend runs as a Vercel Serverless Function with cached MongoDB connections.
   - **Required Vercel Environment Variables**:
     - `MONGODB_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
     - `JWT_SECRET`: Secure random string (min 32 characters)
     - `NODE_ENV`: `production`
     - `CORS_ORIGIN`: Your production Vercel domain (e.g. `https://your-staffsync.vercel.app` or `*`)
2. **Containerized Deployment (Docker):** A multi-stage Docker build bundles the Vite frontend into an Nginx static server or serves it directly through Express static middleware.
3. **Database:** Scalable MongoDB Atlas cluster with automated backups and replica sets (ensure Network Access has `0.0.0.0/0` allowed in Atlas).

---

## 14. Security Considerations

- **Password Hashing:** Passwords hashed with `bcryptjs` (salt rounds: 10).
- **JWT Protection:** Short-lived access tokens with robust signature validation.
- **Resource Ownership Validation:** Server-side verification ensures employees cannot inspect or modify peer records.
- **Rate Limiting:** Protects `/api/v1/auth/login` against credential brute-forcing.
- **Security Headers:** Express configured with `helmet` to mitigate clickjacking and XSS attacks.
- **Sanitization:** Input validation middleware strips unauthorized keys from request bodies.
- **CORS:** Restricted to allowed frontend origins with credentials support.

---

## 15. Known Limitations & Future Improvements

- **Biometric Integration:** Attendance is currently captured via the web application interface; future enhancements can integrate biometric hardware or geofencing.
- **Third-Party Calendar Integration:** Integration with Google Calendar and Microsoft Outlook for approved leaves and scheduled training sessions.
- **File Attachments:** Cloud storage integration (e.g. AWS S3) for medical certificates on sick leave requests.
- **Push & Email Notifications:** WebSockets / SendGrid email transport for real-time push and inbox notifications.
