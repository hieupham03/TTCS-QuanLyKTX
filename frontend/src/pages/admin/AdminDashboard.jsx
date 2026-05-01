import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CalendarDays, 
    Plus, 
    DoorOpen, 
    CheckCircle2, 
    Users, 
    Wrench, 
    UserCheck, 
    Banknote, 
    AlertTriangle, 
    PenTool, 
    Clock, 
    ClipboardList,
    Loader2
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [billingMonth, setBillingMonth] = useState('2024-10'); // Or generate dynamically

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/dashboard?billingMonth=${billingMonth}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStats(response.data);
                setError('');
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [billingMonth]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-on-surface-variant font-medium">Đang tải dữ liệu tổng quan...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="bg-error-container/20 text-error p-6 rounded-xl border border-error/20 flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8" />
                    <div>
                        <h3 className="font-bold text-lg">Đã xảy ra lỗi</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Safely fallback to 0 if stats is somehow null
    const data = stats || {
        totalRooms: 0, availableRooms: 0, fullRooms: 0, maintenanceRooms: 0, activeStudents: 0,
        totalRevenue: 0, paidInvoicesCount: 0, unpaidInvoicesCount: 0,
        pendingRepairRequests: 0, inProgressRepairRequests: 0, pendingRegistrations: 0
    };

    // Calculate percentages for UI
    const totalInvoices = data.paidInvoicesCount + data.unpaidInvoicesCount;
    const paidPercentage = totalInvoices > 0 ? Math.round((data.paidInvoicesCount / totalInvoices) * 100) : 0;
    const unpaidPercentage = totalInvoices > 0 ? Math.round((data.unpaidInvoicesCount / totalInvoices) * 100) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold tracking-[0.1em] text-on-surface-variant uppercase mb-2 block">Giám sát hiệu suất</span>
                    <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline leading-none">Tổng quan Ký túc xá</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-outline-variant rounded-lg px-3 py-2 flex items-center gap-2">
                        <CalendarDays className="text-outline w-5 h-5" />
                        <select 
                            className="text-sm font-semibold border-none bg-transparent focus:ring-0 cursor-pointer p-0 pr-8 outline-none" 
                            value={billingMonth}
                            onChange={(e) => setBillingMonth(e.target.value)}
                        >
                            <option value="2024-10">Tháng 10 2024</option>
                            <option value="2024-09">Tháng 09 2024</option>
                            <option value="2024-08">Tháng 08 2024</option>
                        </select>
                    </div>
                    <button className="bg-gradient-to-br from-blue-600 to-blue-500 flex items-center gap-2 px-6 py-2.5 rounded shadow-lg shadow-primary/20 text-sm font-bold text-white hover:scale-[1.02] active:scale-95 transition-all">
                        <Plus className="w-5 h-5" />
                        Đăng ký mới
                    </button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="space-y-8">
                {/* Room & Students */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Thống kê Phòng & Sức chứa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tổng số phòng</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-black text-on-surface leading-none">{data.totalRooms}</p>
                                <DoorOpen className="text-primary/40 w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phòng trống</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-black text-on-surface leading-none">{data.availableRooms}</p>
                                <CheckCircle2 className="text-secondary/40 w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phòng đã đầy</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-black text-on-surface leading-none">{data.fullRooms}</p>
                                <Users className="text-primary/40 w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Đang bảo trì</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-black text-error leading-none">{data.maintenanceRooms}</p>
                                <Wrench className="text-error/40 w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-primary-container/10 p-5 rounded-xl shadow-sm border border-primary/20">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Sinh viên lưu trú</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-black text-primary leading-none">{data.activeStudents}</p>
                                <UserCheck className="text-primary/60 w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Financials */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Tổng quan Tài chính
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tổng doanh thu</p>
                                    <p className="text-3xl font-black text-on-surface mt-1">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalRevenue)}
                                    </p>
                                </div>
                                <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                    <Banknote className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-xs text-on-surface-variant">Tổng số <span className="font-bold text-secondary">Hóa đơn đã thanh toán</span> cho giai đoạn đã chọn</p>
                        </div>
                        
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full border-4 border-primary border-r-transparent flex items-center justify-center">
                                <span className="text-sm font-black text-primary">{paidPercentage}%</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Hóa đơn đã thanh toán</p>
                                <p className="text-2xl font-black text-on-surface">{data.paidInvoicesCount}</p>
                                <p className="text-xs text-on-surface-variant">Giao dịch đã hoàn tất</p>
                            </div>
                        </div>
                        
                        <div className="bg-error-container/10 p-6 rounded-xl shadow-sm border border-error/20 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full border-4 border-error/30 border-t-error flex items-center justify-center">
                                <span className="text-sm font-black text-error">{unpaidPercentage}%</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-error uppercase tracking-wider">Hóa đơn chưa thanh toán</p>
                                <p className="text-2xl font-black text-error">{data.unpaidInvoicesCount}</p>
                                <p className="text-xs text-error/60">Thanh toán còn nợ</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Operational */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        Yêu cầu vận hành
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-error flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Yêu cầu sửa chữa chờ xử lý</p>
                                <p className="text-2xl font-black text-on-surface mt-1">{data.pendingRepairRequests}</p>
                            </div>
                            <AlertTriangle className="text-error w-8 h-8" />
                        </div>
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-secondary flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Yêu cầu sửa chữa đang thực hiện</p>
                                <p className="text-2xl font-black text-on-surface mt-1">{data.inProgressRepairRequests}</p>
                            </div>
                            <PenTool className="text-secondary w-8 h-8" />
                        </div>
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đơn đăng ký chờ duyệt</p>
                                <p className="text-2xl font-black text-on-surface mt-1">{data.pendingRegistrations}</p>
                            </div>
                            <ClipboardList className="text-primary w-8 h-8" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
