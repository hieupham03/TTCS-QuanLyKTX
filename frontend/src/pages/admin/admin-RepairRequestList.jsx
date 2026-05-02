import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Wrench, Search, Loader2, AlertTriangle, CheckCircle2, 
    Clock, XCircle, MoreVertical,
    Building2, DoorOpen, User, Calendar
} from 'lucide-react';

const STATUS_CONFIG = {
    PENDING:     { label: 'Chờ xử lý',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    IN_PROGRESS: { label: 'Đang sửa',   color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: Wrench },
    DONE:        { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200',   icon: CheckCircle2 },
};

const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function RepairRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    
    // Modal state
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/repair-requests', getToken());
            setRequests(res.data.sort((a, b) => b.id - a.id));
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách yêu cầu sửa chữa.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setSubmitting(true);
        try {
            await axios.put(`/api/repair-requests/${id}/status`, { status: newStatus }, getToken());
            fetchRequests();
            setSelected(null);
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái.');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = requests.filter(r => {
        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q || 
            r.student?.fullName?.toLowerCase().includes(q) ||
            r.student?.studentCode?.toLowerCase().includes(q) ||
            r.room?.roomNumber?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const counts = {
        ALL: requests.length,
        PENDING: requests.filter(r => r.status === 'PENDING').length,
        IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
        DONE: requests.filter(r => r.status === 'DONE').length,
    };

    const fmtDate = (d) => new Date(d).toLocaleString('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Quản trị hệ thống</span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Sửa chữa & Bảo trì</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Quản lý Yêu cầu Sửa chữa</h1>
                <p className="text-slate-500 text-sm">Tiếp nhận và cập nhật tiến độ xử lý hỏng hóc thiết bị trong phòng.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {[
                    ['ALL', 'Tất cả', 'slate'],
                    ['PENDING', 'Chờ xử lý', 'yellow'],
                    ['IN_PROGRESS', 'Đang sửa', 'blue'],
                    ['DONE', 'Hoàn thành', 'green']
                ].map(([key, label, color]) => (
                    <button key={key} onClick={() => setStatusFilter(key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                            statusFilter === key
                                ? `bg-${color}-600 text-white border-${color}-600 shadow-lg shadow-${color}-600/20`
                                : `bg-white text-slate-600 border-slate-200 hover:border-${color}-300`
                        }`}
                    >
                        {label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="Tìm tên, MSSV hoặc số phòng..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                        <p className="text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50">
                        <AlertTriangle className="w-5 h-5" /><p className="text-sm font-medium">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Không có yêu cầu nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người báo</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả hỏng hóc</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày gửi</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs text-slate-400">#{req.id}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <DoorOpen className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">P.{req.room?.roomNumber}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{req.room?.building?.name || 'Tòa nhà'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">{req.student?.fullName}</p>
                                            <p className="text-xs text-slate-500">{req.student?.studentCode}</p>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs">
                                            <p className="text-slate-600 line-clamp-2 italic">"{req.description}"</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {fmtDate(req.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border flex items-center w-fit gap-1.5 ${STATUS_CONFIG[req.status].color}`}>
                                                {React.createElement(STATUS_CONFIG[req.status].icon, { className: 'w-3 h-3' })}
                                                {STATUS_CONFIG[req.status].label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button onClick={() => setSelected(req)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Update Status Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Cập nhật yêu cầu #{selected.id}</h3>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả hỏng hóc</p>
                                <p className="text-sm text-slate-700 italic">"{selected.description}"</p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thay đổi trạng thái</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        ['PENDING', 'Chờ xử lý', Clock],
                                        ['IN_PROGRESS', 'Đang tiến hành sửa chữa', Wrench],
                                        ['DONE', 'Đã hoàn thành', CheckCircle2]
                                    ].map(([status, label, Icon]) => (
                                        <button
                                            key={status}
                                            disabled={submitting || selected.status === status}
                                            onClick={() => handleUpdateStatus(selected.id, status)}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                                                selected.status === status
                                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                    : 'bg-white border-slate-100 text-slate-700 hover:border-blue-500 hover:bg-blue-50 group'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                                selected.status === status ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-500 group-hover:text-white'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">{label}</p>
                                                {selected.status === status && <p className="text-[10px] font-medium uppercase tracking-wider">Trạng thái hiện tại</p>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {submitting && (
                                <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang cập nhật...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
