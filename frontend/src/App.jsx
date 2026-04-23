import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardLayout from './dashboard/components/DashboardLayout';
import ProtectedRoute from './dashboard/components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostDetail from './pages/BlogPostDetail';
import Signup from './pages/signup/Signup';

import LoginPage from './dashboard/pages/LoginPage';
import DashboardHome from './dashboard/pages/DashboardHome';
import EmployeesPage from './dashboard/pages/EmployeesPage';
import EmployeeDetailPage from './dashboard/pages/EmployeeDetailPage';
import CertsPage from './dashboard/pages/CertsPage';
import BookingsPage from './dashboard/pages/BookingsPage';
import BookingDetailPage from './dashboard/pages/BookingDetailPage';
import NotificationsPage from './dashboard/pages/NotificationsPage';
import SettingsPage from './dashboard/pages/SettingsPage';
import SubscriptionInactivePage from './dashboard/pages/SubscriptionInactivePage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Marketing site */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />

        {/* Subscription inactive — outside protected route so cancelled users can access */}
        <Route path="/dashboard/inactive" element={<SubscriptionInactivePage />} />

        {/* Dashboard - protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/employees" element={<EmployeesPage />} />
            <Route path="/dashboard/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/dashboard/certs" element={<CertsPage />} />
            <Route path="/dashboard/bookings" element={<BookingsPage />} />
            <Route path="/dashboard/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;