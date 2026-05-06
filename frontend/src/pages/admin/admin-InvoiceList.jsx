import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ReceiptText, Search, Filter, CheckCircle2, Eye,
    Loader2, AlertTriangle, X, ChevronLeft, ChevronRight,
    DollarSign, Calendar, CreditCard
} from 'lucide-react';

const STATUS_CFG = {
    PAID:   { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700 border-green-200' },
    UNPAID: { label: 'Chưa thanh toán', color: 'bg-red-100 text-red-600 border-red-200' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';
const fmtMoney = (n) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '--';
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const PAGE_SIZE = 10;

export default function AdminInvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [monthFilter, setMonthFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modal
    const [detail, setDetail] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/invoices', getToken());
            setInvoices(res.data.sort((a, b) => b.id - a.id));
            setError('');
        } catch { setError('Không thể tải danh sách hóa đơn.'); }
        finally { setLoading(false); }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Xác nhận hóa đơn #${id} đã được thanh toán?\n\nLƯU Ý: Hành động này KHÔNG THỂ HOÀN TÁC.`)) return;
        setSubmitting(true);
        try {
            await axios.put(`/api/invoices/${id}/status`, { status }, getToken());
            fetchInvoices();
            setDetail(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái.');
        } finally { setSubmitting(false); }
    };

    const filtered = invoices.filter(inv => {
        const q = search.toLowerCase();
        const matchSearch = !q 
            || inv.room?.roomNumber?.toLowerCase().includes(q)
            || inv.room?.building?.name?.toLowerCase().includes(q)
            || String(inv.id).includes(q);
        const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        const matchMonth = !monthFilter || inv.billingMonth === monthFilter;
        return matchSearch && matchStatus && matchMonth;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const stats = {
        total: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        unpaid: invoices.filter(i => i.status === 'UNPAID').length,
        paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Quản trị hệ thống</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Hóa đơn & Dịch vụ</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Quản lý Hóa đơn</h1>
                    <p className="text-slate-500 text-sm">Theo dõi thanh toán tiền phòng và dịch vụ điện nước của sinh viên.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><DollarSign /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng doanh thu</p>
                        <p className="text-xl font-black text-slate-900">{fmtMoney(stats.total)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chưa thanh toán</p>
                        <p className="text-xl font-black text-red-600">{stats.unpaid} hóa đơn</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã thu</p>
                        <p className="text-xl font-black text-green-700">{fmtMoney(stats.paidAmount)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-50 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tìm kiếm</label>
                    <Search className="absolute left-3 bottom-2.5 text-slate-400 w-4 h-4" />
                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm số phòng, tòa, mã HĐ..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Trạng thái</label>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="UNPAID">Chưa thanh toán</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tháng hóa đơn</label>
                    <input type="month" value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setPage(1); }}
                        className="w-full py-2 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
                </div>
                <div className="md:col-span-2 flex items-end">
                    <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setMonthFilter(''); }}
                        className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">Xóa lọc</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-24 flex flex-col items-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" /><p className="text-slate-400">Đang tải...</p></div>
                ) : paginated.length === 0 ? (
                    <div className="py-16 text-center"><ReceiptText className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400">Không tìm thấy hóa đơn nào.</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {['Mã HĐ', 'Phòng / Tòa', 'Tháng', 'Tiền phòng', 'Điện nước', 'Tổng cộng', 'Trạng thái', 'Thao tác'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-5 py-4 font-mono text-xs font-black text-blue-600">INV-{String(inv.id).padStart(4,'0')}</td>
                                        <td className="px-5 py-4 font-bold text-slate-800">P.{inv.room?.roomNumber} - {inv.room?.building?.name}</td>
                                        <td className="px-5 py-4 text-xs font-medium text-slate-600">{inv.billingMonth}</td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{fmtMoney(inv.roomPrice)}</td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{fmtMoney(inv.totalAmount - inv.roomPrice)}</td>
                                        <td className="px-5 py-4 font-black text-slate-900">{fmtMoney(inv.totalAmount)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_CFG[inv.status]?.color}`}>
                                                {STATUS_CFG[inv.status]?.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setDetail(inv)}
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                                                {inv.status === 'UNPAID' && (
                                                    <button onClick={() => handleUpdateStatus(inv.id, 'PAID')}
                                                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all" title="Xác nhận thanh toán"><CheckCircle2 className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination (Simplified) */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <p className="text-xs text-slate-400">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-7 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-900">Chi tiết hóa đơn INV-{String(detail.id).padStart(4,'0')}</h3>
                            <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <div className="p-7 space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Phòng:</span><span className="font-bold">P.{detail.room?.roomNumber} ({detail.room?.building?.name})</span></div>
                                <div className="flex justify-between"><span>Tháng:</span><span className="font-bold">{detail.billingMonth}</span></div>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <div className="flex justify-between"><span>Tiền phòng:</span><span>{fmtMoney(detail.roomPrice)}</span></div>
                                <div className="flex justify-between text-xs text-slate-500 ml-4">
                                    <span>Điện ({detail.serviceMetric?.newElectricity - detail.serviceMetric?.oldElectricity} kWh):</span>
                                    <span>{fmtMoney((detail.serviceMetric?.newElectricity - detail.serviceMetric?.oldElectricity) * detail.serviceMetric?.electricityPrice)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 ml-4">
                                    <span>Nước ({detail.serviceMetric?.newWater - detail.serviceMetric?.oldWater} m3):</span>
                                    <span>{fmtMoney((detail.serviceMetric?.newWater - detail.serviceMetric?.oldWater) * detail.serviceMetric?.waterPrice)}</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <div className="flex justify-between text-lg font-black text-blue-600"><span>Tổng cộng:</span><span>{fmtMoney(detail.totalAmount)}</span></div>
                            </div>
                            {detail.status === 'UNPAID' && (
                                <button onClick={() => handleUpdateStatus(detail.id, 'PAID')} disabled={submitting}
                                    className="w-full py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin w-4 h-4"/> : <CreditCard className="w-4 h-4"/>}
                                    Xác nhận thanh toán
                                </button>
                            )}
                            <button onClick={() => setDetail(null)} className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
