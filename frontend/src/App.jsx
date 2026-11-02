import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// ── Public pages ─────────────────────────────────────────────────────
const LandingPage             = lazy(() => import('./pages/public/LandingPage'));
const LoginPage               = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage            = lazy(() => import('./pages/public/RegisterPage'));

const UnauthorizedPage        = lazy(() => import('./pages/public/UnauthorizedPage'));

// ── Student pages ─────────────────────────────────────────────────────
const StudentDashboard        = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfilePage      = lazy(() => import('./pages/student/StudentProfilePage'));
const BrowseJobsPage          = lazy(() => import('./pages/student/BrowseJobsPage'));
const JobDetailsPage          = lazy(() => import('./pages/student/JobDetailsPage'));
const MyApplicationsPage      = lazy(() => import('./pages/student/MyApplicationsPage'));
const ResumeManagerPage       = lazy(() => import('./pages/student/ResumeManagerPage'));
const InterviewSchedulePage   = lazy(() => import('./pages/student/InterviewSchedulePage'));
const NotificationsPage       = lazy(() => import('./pages/student/NotificationsPage'));

// ── Recruiter pages ───────────────────────────────────────────────────
const RecruiterDashboard      = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const CreateEditJobPage       = lazy(() => import('./pages/recruiter/CreateEditJobPage'));
const ManageJobsPage          = lazy(() => import('./pages/recruiter/ManageJobsPage'));
const ApplicantManagementPage = lazy(() => import('./pages/recruiter/ApplicantManagementPage'));
const CompanyProfilePage      = lazy(() => import('./pages/recruiter/CompanyProfilePage'));
const RecruiterAnalyticsPage  = lazy(() => import('./pages/recruiter/RecruiterAnalyticsPage'));

// ── Admin pages ───────────────────────────────────────────────────────
const AdminDashboard            = lazy(() => import('./pages/admin/AdminDashboard'));
const RecruiterVerificationPage = lazy(() => import('./pages/admin/RecruiterVerificationPage'));
const JobApprovalPage           = lazy(() => import('./pages/admin/JobApprovalPage'));
const StudentManagementPage     = lazy(() => import('./pages/admin/StudentManagementPage'));

// ── Full-page loading spinner ─────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-900 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600/40 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">Loading CampusHire…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* ─── Public Routes ─────────────────────────────────── */}
              <Route element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
              </Route>

              {/* Auth pages — standalone (no navbar/footer) */}
              <Route path="login"        element={<LoginPage />} />
              <Route path="register"     element={<RegisterPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />

              {/* ─── Student Routes ────────────────────────────────── */}
              <Route
                path="student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"     element={<StudentDashboard />} />
                <Route path="profile"       element={<StudentProfilePage />} />
                <Route path="jobs"          element={<BrowseJobsPage />} />
                <Route path="jobs/:id"      element={<JobDetailsPage />} />
                <Route path="applications"  element={<MyApplicationsPage />} />
                <Route path="resume"        element={<ResumeManagerPage />} />
                <Route path="interviews"    element={<InterviewSchedulePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* ─── Recruiter Routes ──────────────────────────────── */}
              <Route
                path="recruiter"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"           element={<RecruiterDashboard />} />
                <Route path="jobs"                element={<ManageJobsPage />} />
                <Route path="jobs/create"         element={<CreateEditJobPage />} />
                <Route path="jobs/:id/edit"       element={<CreateEditJobPage />} />
                <Route path="jobs/:id/applicants" element={<ApplicantManagementPage />} />
                <Route path="company"             element={<CompanyProfilePage />} />
                <Route path="analytics"           element={<RecruiterAnalyticsPage />} />
              </Route>

              {/* ─── Admin Routes ──────────────────────────────────── */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"  element={<AdminDashboard />} />
                <Route path="recruiters" element={<RecruiterVerificationPage />} />
                <Route path="jobs"        element={<JobApprovalPage />} />
                <Route path="jobs/create" element={<CreateEditJobPage />} />
                <Route path="students"    element={<StudentManagementPage />} />
              </Route>

              {/* ─── Catch-all ─────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
