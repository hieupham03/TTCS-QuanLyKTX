import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerify from './pages/OTPVerify';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/admin-Dashboard';
import AccountList from './pages/admin/admin-AccountList';
import BuildingList from './pages/admin/admin-BuildingList';
import RoomList from './pages/admin/admin-RoomList';
import RegistrationPeriods from './pages/admin/admin-RegistrationPeriods';
import RegistrationReview from './pages/admin/admin-RegistrationReview';
import StudentList from './pages/admin/admin-StudentList';
import ContractList from './pages/admin/admin-ContractList';
import InvoiceList from './pages/admin/admin-InvoiceList';
import RepairRequestList from './pages/admin/admin-RepairRequestList';
import ServicePriceList from './pages/admin/admin-ServicePriceList';
import ServiceMetricInput from './pages/admin/admin-ServiceMetricInput';

// Student Pages
import StudentLayout from './components/layout/student/StudentLayout';
import StudentDashboard from './pages/student/stu-Dashboard';
import StudentRegistration from './pages/student/stu-Registration';
import StudentInvoiceList from './pages/student/stu-InvoiceList';
import StudentRepairRequestList from './pages/student/stu-RepairRequestList';
import StudentProfile from './pages/student/stu-Profile';
import StudentRoomInfo from './pages/student/stu-RoomInfo';
import StudentContractList from './pages/student/stu-ContractList';

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
          <Route path="registrations" element={<RegistrationReview />} />
          <Route path="students" element={<StudentList />} />
          <Route path="contracts" element={<ContractList />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="repairs" element={<RepairRequestList />} />
          <Route path="service-prices" element={<ServicePriceList />} />
          <Route path="metrics" element={<ServiceMetricInput />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="room" element={<StudentRoomInfo />} />
          <Route path="register" element={<StudentRegistration />} />
          <Route path="invoices" element={<StudentInvoiceList />} />
          <Route path="repairs" element={<StudentRepairRequestList />} />
          <Route path="contracts" element={<StudentContractList />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;


