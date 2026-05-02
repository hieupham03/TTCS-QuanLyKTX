import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText, Search, Plus, XCircle, Eye, Loader2,
    AlertTriangle, X, ChevronLeft, ChevronRight,
    Building2, CheckCircle2
} from 'lucide-react';

const STATUS_CFG = {
    ACTIVE:    { label: 'Đang hiệu lực', color: 'bg-green-100 text-green-700 border-green-200' },
    EXPIRED:   { label: 'Hết hạn',       color: 'bg-slate-100 text-slate-500 border-slate-200' },
    CANCELLED: { label: 'Đã hủy',        color: 'bg-red-100 text-red-600 border-red-200' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';
const fmtMoney = (n) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '--';
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const PAGE_SIZE = 10;

export default function AdminContractList() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);

    // Detail modal
    const [detail, setDetail] = useState(null);
    // Cancel confirm
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => { fetchContracts(); }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/contracts', getToken());
            setContracts(res.data.sort((a, b) => b.id - a.id));
            setError('');
        } catch { setError('Không thể tải danh sách hợp đồng.'); }
        finally { setLoading(false); }
    };

    const filtered = contracts.filter(c => {
        const q = search.toLowerCase();
        const matchSearch = !q
            || c.student?.studentCode?.toLowerCase().includes(q)
            || c.student?.fullName?.toLowerCase().includes(q)
            || String(c.id).includes(q);
        const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const counts = {
        ALL: contracts.length,
        ACTIVE: contracts.filter(c => c.status === 'ACTIVE').length,
        EXPIRED: contracts.filter(c => c.status === 'EXPIRED').length,
        CANCELLED: contracts.filter(c => c.status === 'CANCELLED').length,
    };

    const handleCancel = async (contract) => {
        if (!window.confirm(`Hủy hợp đồng #${contract.id} của SV ${contract.student?.fullName}?`)) return;
        setCancelling(true);
        try {
            await axios.patch(`/api/contracts/${contract.id}/cancel`, {}, getToken());
            fetchContracts();
            if (detail?.id === contract.id) setDetail(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể hủy hợp đồng này.');
        } finally { setCancelling(false); }
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Quản trị hệ thống</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Hợp đồng lưu trú</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Quản lý Hợp đồng</h1>
                    <p className="text-slate-500 text-sm">Theo dõi và quản lý các hợp đồng lưu trú của sinh viên tại KTX.</p>
                </div>
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {[['ALL','Tất cả','blue'],['ACTIVE','Đang hiệu lực','green'],['EXPIRED','Hết hạn','slate'],['CANCELLED','Đã hủy','red']].map(([key, label, color]) => (
                    <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${statusFilter === key
                            ? `bg-${color}-600 text-white border-${color}-600 shadow-md`
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        {label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="Tìm MSSV, tên SV hoặc mã HĐ..."
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{filtered.length} hợp đồng</span>
                </div>

                {error && <div className="p-5 bg-red-50 flex items-center gap-3 text-red-600"><AlertTriangle className="w-5 h-5" /><p className="text-sm">{error}</p></div>}

                {loading ? (
                    <div className="py-24 flex flex-col items-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" /><p className="text-slate-400">Đang tải...</p></div>
                ) : paginated.length === 0 ? (
                    <div className="py-16 text-center"><FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400">Không có hợp đồng nào.</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {['Mã HĐ', 'Sinh viên', 'Phòng / Tòa', 'Học kỳ', 'Giá phòng', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-5 py-4 font-mono text-xs font-black text-blue-600">HD-{String(c.id).padStart(4,'0')}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">{c.student?.fullName || '--'}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{c.student?.studentCode}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                                    {c.room?.building?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-800">P.{c.room?.roomNumber}</div>
                                                    <div className="text-[10px] text-slate-400">Tòa {c.room?.building?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600 font-medium max-w-[130px] truncate">{c.period?.semester || '--'}</td>
                                        <td className="px-5 py-4 text-xs font-black text-slate-800">{fmtMoney(c.roomPrice)}</td>
                                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_CFG[c.status]?.color}`}>
                                                {STATUS_CFG[c.status]?.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setDetail(c)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Chi tiết
                                                </button>
                                                {c.status === 'ACTIVE' && (
                                                    <button onClick={() => handleCancel(c)} disabled={cancelling}
                                                        className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black hover:bg-red-600 hover:text-white transition-all flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> Hủy
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <p className="text-xs text-slate-400">
                            {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                            {[...Array(Math.min(totalPages,5))].map((_,i) => {
                                const pg = i+1;
                                return <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold ${page===pg ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}>{pg}</button>;
                            })}
                            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-7 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-900 text-base">Hợp đồng HD-{String(detail.id).padStart(4,'0')}</h3>
                                <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_CFG[detail.status]?.color}`}>
                                    {STATUS_CFG[detail.status]?.label}
                                </span>
                            </div>
                            <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-7 space-y-4">
                            <div className="bg-slate-50 rounded-2xl p-5 space-y-2.5">
                                {[
                                    ['MSSV', detail.student?.studentCode],
                                    ['Sinh viên', detail.student?.fullName],
                                    ['Phòng', `P.${detail.room?.roomNumber} — Tòa ${detail.room?.building?.name}`],
                                    ['Học kỳ', detail.period?.semester],
                                    ['Giá phòng/tháng', fmtMoney(detail.roomPrice)],
                                    ['Ngày tạo', fmtDate(detail.createdAt)],
                                ].map(([label, val]) => (
                                    <div key={label} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                        <span className="text-sm font-semibold text-slate-800 text-right max-w-[200px]">{val || '--'}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                {detail.status === 'ACTIVE' && (
                                    <button onClick={() => handleCancel(detail)} disabled={cancelling}
                                        className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                                        <XCircle className="w-4 h-4" /> Hủy hợp đồng
                                    </button>
                                )}
                                <button onClick={() => setDetail(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
