import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerify from './pages/OTPVerify';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/AdminDashboard';
import AccountList from './pages/admin/AccountList';
import BuildingList from './pages/admin/BuildingList';
import RoomList from './pages/admin/RoomList';
import RegistrationPeriods from './pages/admin/RegistrationPeriods';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<AccountList />} />
          <Route path="buildings" element={<BuildingList />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="registration-periods" element={<RegistrationPeriods />} />
          {/* Add more admin routes here later */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;


