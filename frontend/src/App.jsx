import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';

import Home from './pages/public/Home';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Contact from './pages/public/Contact';
import VerifyCertificate from './pages/public/VerifyCertificate';

import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/MyCourses';
import Assignments from './pages/student/Assignments';
import Fees from './pages/student/Fees';

import AdminDashboard from './pages/admin/Dashboard';
import AdminCourses from './pages/admin/Courses';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminStudents from './pages/admin/Students';
import AdminPayments from './pages/admin/Payments';
import AdminLeads from './pages/admin/Leads';
import AdminAssignments from './pages/admin/Assignments';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminInstructors from './pages/admin/Instructors';
import AdminAttendance from './pages/admin/Attendance';
import AdminCertificates from './pages/admin/Certificates';

function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="kicker mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
        About the academy
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-5">About They Code It</h1>
      <p className="text-muted text-lg leading-relaxed">
        They Code It is a computer academy focused on structured, cohort-based learning — taking students
        from fundamentals to job-ready skills through onsite and online batches, real instructors, and
        recognized certification.
      </p>
    </div>
  );
}

function AppRoutes() {
  const auth = useContext(AuthContext);
  const { isLoading } = useLoading();

  if (auth?.isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && <LoadingSpinner />}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
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
        </Route>
      </Routes>
      <div className="mt-auto">
        <Footer />
      </div>
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
