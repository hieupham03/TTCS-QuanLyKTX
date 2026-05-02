import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ReceiptText, 
    Download, 
    CalendarDays, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Droplets,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    X,
    Banknote
} from 'lucide-react';

const StudentInvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [activeContract, setActiveContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const invoicesPerPage = 5;

    const studentCode = localStorage.getItem('studentCode');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // 1. Get Active Contract to find RoomID
            const contractRes = await axios.get(`/api/contracts/student/${studentCode}`, { headers });
            const active = contractRes.data.find(c => c.status === 'ACTIVE');
            setActiveContract(active);

            if (active) {
                // 2. Fetch Invoices for that room
                const invoiceRes = await axios.get(`/api/invoices?roomId=${active.room.id}`, { headers });
                // Sort by ID/Date descending
                setInvoices(invoiceRes.data.sort((a, b) => b.id - a.id));
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const latestInvoice = invoices.length > 0 ? invoices[0] : null;

    // Pagination logic
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
    const totalPages = Math.ceil(invoices.length / invoicesPerPage);

    const handlePayClick = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.1em]">Tài khoản sinh viên</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Hóa đơn & Dịch vụ</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-100 shadow-sm">
                        <CalendarDays className="text-blue-600" size={18} />
                        <span className="text-sm font-bold text-slate-700">Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</span>
                    </div>
                </div>
            </header>

            {/* Current Bill & Metrics */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Billing Card */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="bg-slate-50 px-8 py-5 flex justify-between items-center border-b border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Chi tiết hóa đơn hiện tại</h3>
                        {latestInvoice?.status === 'UNPAID' ? (
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Chưa thanh toán</span>
                        ) : (
                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Đã hoàn thành</span>
                        )}
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền phòng (Tháng {latestInvoice?.billingMonth})</p>
                                    <p className="text-xl font-black text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeContract?.room?.building?.roomPrice || 0)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                    <Zap size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền điện</p>
                                        <p className="text-sm font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(latestInvoice?.electricityCost || 0)}</p>
                                    </div>
                                    <div className="mt-2 flex gap-4 text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span>Cũ: {latestInvoice?.oldElectricityIndex}</span>
                                        <ChevronRight size={10} className="mt-0.5" />
                                        <span>Mới: {latestInvoice?.newElectricityIndex}</span>
                                        <span className="ml-auto text-blue-600">Tổng: {latestInvoice?.newElectricityIndex - latestInvoice?.oldElectricityIndex} kWh</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                                    <Droplets size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền nước</p>
                                        <p className="text-sm font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(latestInvoice?.waterCost || 0)}</p>
                                    </div>
                                    <div className="mt-2 flex gap-4 text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span>Cũ: {latestInvoice?.oldWaterIndex}</span>
                                        <ChevronRight size={10} className="mt-0.5" />
                                        <span>Mới: {latestInvoice?.newWaterIndex}</span>
                                        <span className="ml-auto text-blue-600">Tổng: {latestInvoice?.newWaterIndex - latestInvoice?.oldWaterIndex} m³</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[2rem] flex flex-col justify-center items-center text-center text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Tổng cộng thanh toán</p>
                                <p className="text-4xl font-black tracking-tighter mb-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(latestInvoice?.totalAmount || 0)}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hạn chót: 10/{latestInvoice?.billingMonth}/{new Date().getFullYear()}</p>
                                
                                {latestInvoice?.status === 'UNPAID' && (
                                    <button 
                                        onClick={() => handlePayClick(latestInvoice)}
                                        className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        Thanh toán ngay <ArrowUpRight size={18} />
                                    </button>
                                )}
                            </div>
                            <ReceiptText size={160} className="absolute -right-12 -bottom-12 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                </div>

                {/* Metrics Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiêu thụ điện</p>
                                <h4 className="text-2xl font-black text-slate-900">+12.5%</h4>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="flex gap-1.5 items-end h-16">
                            <div className="w-full bg-slate-100 rounded-lg h-[40%]"></div>
                            <div className="w-full bg-slate-100 rounded-lg h-[65%]"></div>
                            <div className="w-full bg-slate-100 rounded-lg h-[55%]"></div>
                            <div className="w-full bg-blue-600 rounded-lg h-[85%]"></div>
                            <div className="w-full bg-blue-200 rounded-lg h-[70%]"></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Xu hướng 5 tháng gần nhất</p>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                        <div className="relative z-10">
                            <h4 className="text-lg font-black mb-2">Thanh toán trực tiếp</h4>
                            <p className="text-sm text-slate-400 mb-6">Vui lòng đến văn phòng Ban quản lý KTX để nộp tiền mặt hoặc chuyển khoản theo hướng dẫn.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Invoice History Table */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Lịch sử thanh toán</h3>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng cộng: {invoices.length} bản ghi</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Mã hóa đơn</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Kỳ hóa đơn</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Tổng tiền</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Ngày tạo</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Trạng thái</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentInvoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-900">INV-{new Date(invoice.createdAt).getFullYear() % 100}{invoice.id.toString().padStart(4, '0')}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-600">Tháng {invoice.billingMonth}</td>
                                    <td className="px-8 py-5 text-sm font-black text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.totalAmount)}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            invoice.status === 'PAID' 
                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                            : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${invoice.status === 'PAID' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {invoice.status === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {invoice.status === 'UNPAID' && (
                                            <button 
                                                onClick={() => handlePayClick(invoice)}
                                                className="text-blue-600 hover:text-blue-700 text-xs font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                                            >
                                                Thanh toán <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Trang {currentPage} / {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Payment Instruction Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900">Hướng dẫn thanh toán</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Số tiền cần nộp</p>
                                <p className="text-3xl font-black text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice?.totalAmount || 0)}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Phương thức thanh toán:</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 shrink-0">
                                            <Banknote size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Tiền mặt</p>
                                            <p className="text-xs text-slate-500 mt-1">Vui lòng nộp trực tiếp tại văn phòng Ban quản lý KTX (Tầng 1, Tòa A1).</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 shrink-0">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Chuyển khoản ngân hàng</p>
                                            <p className="text-xs text-slate-500 mt-1 italic">Vui lòng liên hệ văn phòng để lấy thông tin tài khoản và nội dung chuyển khoản chính xác.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                    Sau khi thanh toán, quản trị viên sẽ cập nhật trạng thái hóa đơn của bạn trên hệ thống. Vui lòng giữ lại biên lai để đối chiếu nếu cần.
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentInvoiceList;
