import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useContext, Suspense, lazy } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';

// Every page is lazy-loaded so the initial bundle only ships app shell +
// whichever single page the visitor actually landed on, instead of one
// ~580KB file containing the public site, the full student portal, and the
// full admin portal (with its 12 pages) all at once. Vite/Rollup splits
// each of these into its own chunk automatically; React.lazy + Suspense
// fetches it on first navigation to that route.
const Home = lazy(() => import('./pages/public/Home'));
const Courses = lazy(() => import('./pages/public/Courses'));
const CourseDetail = lazy(() => import('./pages/public/CourseDetail'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const VerifyCertificate = lazy(() => import('./pages/public/VerifyCertificate'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const Terms = lazy(() => import('./pages/public/Terms'));

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const Assignments = lazy(() => import('./pages/student/Assignments'));
const Fees = lazy(() => import('./pages/student/Fees'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const AdminEnrollments = lazy(() => import('./pages/admin/Enrollments'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminLeads = lazy(() => import('./pages/admin/Leads'));
const AdminAssignments = lazy(() => import('./pages/admin/Assignments'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminInstructors = lazy(() => import('./pages/admin/Instructors'));
const AdminAttendance = lazy(() => import('./pages/admin/Attendance'));
const AdminCertificates = lazy(() => import('./pages/admin/Certificates'));
const PaymentVoucher = lazy(() => import('./pages/admin/PaymentVoucher'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function AppRoutes() {
  const auth = useContext(AuthContext);
  const { isLoading } = useLoading();
  const { pathname } = useLocation();

  if (auth?.isInitializing) {
    return <LoadingSpinner />;
  }

  // Student/admin portal pages use their own app-style navigation (bottom
  // tab bar / drawer) and don't need the marketing Footer underneath them —
  // except the standalone voucher page, which intentionally keeps it (see
  // the route below).
  const isPortal = /^\/(student|admin)(\/|$)/.test(pathname) && !pathname.includes('/voucher');

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && <LoadingSpinner />}
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        {/* Not wrapped in PublicOnlyRoute: clicking the emailed reset link
            establishes a real (if temporary) Supabase session for recovery,
            which AuthContext picks up as `user` — wrapping this route would
            bounce the person straight to their dashboard before they can
            actually set a new password. */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />

        <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="fees" element={<Fees />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['SUPER_ADMIN', 'REGISTRAR']}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="assignments" element={<AdminAssignments />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Standalone (not nested in AdminLayout) so the printed voucher has
            no sidebar — only Navbar/Footer remain, hidden via .no-print. */}
        <Route
          path="/admin/payments/:id/voucher"
          element={<ProtectedRoute roles={['SUPER_ADMIN', 'REGISTRAR']}><PaymentVoucher /></ProtectedRoute>}
        />
      </Routes>
      </Suspense>
      {!isPortal && (
        <div className="mt-auto">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}