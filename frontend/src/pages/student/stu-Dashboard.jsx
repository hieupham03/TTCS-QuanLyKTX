import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, 
    Home, 
    ReceiptText, 
    Wrench, 
    ArrowRight, 
    CreditCard,
    AlertCircle,
    CheckCircle2,
    Clock,
    Building2,
    CalendarDays
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [activeContract, setActiveContract] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [recentRepairs, setRecentRepairs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const studentCode = localStorage.getItem('studentCode');
            
            if (!studentCode) {
                // Fallback if studentCode is not in localStorage, try to get from user profile API if available
                // For now, assume it's there or handle error
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Student Profile
            const studentRes = await axios.get(`/api/students/${studentCode}`, { headers });
            setStudentData(studentRes.data);

            // Fetch Active Contract
            const contractRes = await axios.get(`/api/contracts/student/${studentCode}`, { headers });
            console.log("Student Contracts:", contractRes.data);
            const active = contractRes.data.find(c => c.status === 'ACTIVE');
            console.log("Active Contract:", active);
            setActiveContract(active);

            // Fetch Recent Invoices (if has room)
            if (active) {
                const invoiceRes = await axios.get(`/api/invoices?roomId=${active.room.id}`, { headers });
                setRecentInvoices(invoiceRes.data.slice(0, 3));
            }

            // Fetch Recent Repairs
            const repairRes = await axios.get(`/api/repair-requests?studentCode=${studentCode}`, { headers });
            setRecentRepairs(repairRes.data.slice(0, 3));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Chào {studentData?.fullName?.split(' ').pop()}, 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Chào mừng bạn trở lại hệ thống quản lý ký túc xá.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <CalendarDays size={20} />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hôm nay</p>
                        <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
            </div>

            {/* Top Grid: Profile & Room Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm overflow-hidden">
                                {studentData?.gender === 'MALE' ? <User size={40} /> : <User size={40} className="text-pink-400" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{studentData?.fullName}</h2>
                                <p className="text-sm font-medium text-slate-500">{studentData?.studentCode}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</span>
                                <span className="text-sm font-bold text-slate-900">{studentData?.className}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</span>
                                <span className="text-sm font-bold text-slate-900">{studentData?.phone}</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/student/profile" className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all relative z-10">
                        Xem chi tiết hồ sơ <ArrowRight size={16} />
                    </Link>
                    <User size={120} className="absolute -right-8 -bottom-8 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Room Info Card */}
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/10 text-white flex flex-col justify-between relative overflow-hidden">
                    {activeContract ? (
                        <>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded">Đang ở</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">• {activeContract.room.building.name}</span>
                                    </div>
                                    <h2 className="text-5xl font-black tracking-tighter">Phòng {activeContract.room.roomNumber}</h2>
                                    <p className="text-slate-400 mt-4 max-w-sm">
                                        Hợp đồng có hiệu lực từ {activeContract.period?.stayStartDate ? new Date(activeContract.period.stayStartDate).toLocaleDateString('vi-VN') : '...'} 
                                        đến {activeContract.period?.stayEndDate ? new Date(activeContract.period.stayEndDate).toLocaleDateString('vi-VN') : '...'}.
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                                        <CreditCard size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Tiền phòng</span>
                                    </div>
                                    <p className="text-2xl font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeContract.room.building.roomPrice)}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">mỗi tháng</p>
                                </div>
                            </div>
                            <div className="mt-8 relative z-10 flex gap-4">
                                <Link to="/student/invoices" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                                    Thanh toán hóa đơn <ArrowRight size={16} />
                                </Link>
                                <Link to="/student/repairs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all">
                                    Báo hỏng thiết bị
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center py-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                                <AlertCircle size={32} className="text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-bold">Bạn chưa có phòng ở</h2>
                            <p className="text-slate-400 mt-2 max-w-xs">Hãy đăng ký phòng trong các đợt mở đăng ký để bắt đầu cuộc sống tại ký túc xá.</p>
                        </div>
                    )}
                    <Building2 size={240} className="absolute -right-20 -bottom-20 text-white/5 pointer-events-none" />
                </div>
            </div>

            {/* Bottom Grid: Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Invoices */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <ReceiptText size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hóa đơn gần đây</h3>
                        </div>
                        <Link to="/student/invoices" className="text-xs font-bold text-blue-600 hover:underline">Tất cả</Link>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        {recentInvoices.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                                <ReceiptText size={48} className="opacity-20 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest italic">Chưa có hóa đơn nào</p>
                            </div>
                        ) : (
                            recentInvoices.map(invoice => (
                                <div key={invoice.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${invoice.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {invoice.status === 'PAID' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Tháng {invoice.billingMonth}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.totalAmount)}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        invoice.status === 'PAID' ? 'bg-white text-green-600 border-green-100' : 'bg-white text-red-600 border-red-100'
                                    }`}>
                                        {invoice.status === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Repair Requests */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Wrench size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Yêu cầu sửa chữa</h3>
                        </div>
                        <Link to="/student/repairs" className="text-xs font-bold text-blue-600 hover:underline">Tất cả</Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {recentRepairs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                                <Wrench size={48} className="opacity-20 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest italic">Chưa có yêu cầu nào</p>
                            </div>
                        ) : (
                            recentRepairs.map(repair => (
                                <div key={repair.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{repair.description}</p>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                            repair.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-100' :
                                            repair.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {repair.status === 'DONE' ? 'Đã xong' : repair.status === 'IN_PROGRESS' ? 'Đang sửa' : 'Chờ xử lý'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Clock size={12} />
                                        {new Date(repair.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
