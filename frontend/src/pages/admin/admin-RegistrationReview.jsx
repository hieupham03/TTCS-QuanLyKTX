import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ClipboardList, Search, Loader2, AlertTriangle, X,
    CheckCircle2, XCircle, Eye, Building2, DoorOpen, ChevronDown
} from 'lucide-react';

const STATUS_CONFIG = {
    PENDING:  { label: 'Chờ duyệt',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    APPROVED: { label: 'Đã duyệt',   color: 'bg-green-100 text-green-700 border-green-200' },
    REJECTED: { label: 'Từ chối',    color: 'bg-red-100 text-red-700 border-red-200' },
};

const TYPE_CONFIG = {
    NEW_REGISTER: { label: 'Đăng ký mới', color: 'bg-blue-50 text-blue-600' },
    EXTENSION:    { label: 'Gia hạn',     color: 'bg-purple-50 text-purple-600' },
};

const fmt = (d) => d ? new Date(d).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '--';

const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function RegistrationReview() {
    const [registrations, setRegistrations] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    // Review modal
    const [selected, setSelected] = useState(null);
    const [action, setAction] = useState(null); // 'approve' | 'reject'
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [assignedRoomId, setAssignedRoomId] = useState('');
    const [roomPrice, setRoomPrice] = useState('');
    const [rejectNote, setRejectNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [regRes, buildRes] = await Promise.all([
                axios.get('/api/registrations', getToken()),
                axios.get('/api/buildings', getToken()),
            ]);
            console.log("Admin - Registrations:", regRes.data);
            setRegistrations(regRes.data.sort((a, b) => b.id - a.id));
            setBuildings(buildRes.data);
        } catch (err) {
            console.error("Error fetching registrations:", err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async (buildingName) => {
        if (!buildingName) { setRooms([]); return; }
        try {
            const res = await axios.get(`/api/rooms/building/${buildingName}`, getToken());
            setRooms(res.data.filter(r => r.status === 'AVAILABLE'));
        } catch {
            setRooms([]);
        }
    };

    const handleBuildingChange = (name) => {
        setSelectedBuilding(name);
        setAssignedRoomId('');
        const building = buildings.find(b => b.name === name);
        setRoomPrice(building ? building.roomPrice.toString() : '');
        fetchRooms(name);
    };

    const openModal = (reg) => {
        setSelected(reg);
        setAction(null);
        setSelectedBuilding('');
        setAssignedRoomId('');
        setRoomPrice('');
        setRejectNote('');
        setFormError('');
        setRooms([]);
    };

    const handleSubmit = async () => {
        setFormError('');
        if (action === 'approve') {
            if (!assignedRoomId) { setFormError('Vui lòng chọn phòng để xếp cho sinh viên.'); return; }
            if (!roomPrice) { setFormError('Vui lòng nhập giá phòng.'); return; }
        }
        setSubmitting(true);
        try {
            const payload = action === 'approve'
                ? { status: 'APPROVED', assignedRoomId: parseInt(assignedRoomId), roomPrice: parseInt(roomPrice) }
                : { status: 'REJECTED', note: rejectNote };
            await axios.put(`/api/registrations/${selected.id}/status`, payload, getToken());
            fetchAll();
            setSelected(null);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Đã xảy ra lỗi khi xử lý đơn.');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = registrations.filter(r => {
        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            r.student?.studentCode?.toLowerCase().includes(q) ||
            r.student?.fullName?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const counts = {
        ALL: registrations.length,
        PENDING: registrations.filter(r => r.status === 'PENDING').length,
        APPROVED: registrations.filter(r => r.status === 'APPROVED').length,
        REJECTED: registrations.filter(r => r.status === 'REJECTED').length,
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Quản trị hệ thống</span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Duyệt đơn</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Duyệt đơn đăng ký KTX</h1>
                <p className="text-slate-500 text-sm">Xem xét và xử lý các đơn đăng ký từ sinh viên.</p>
            </div>

            {/* Stat tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {[['ALL','Tất cả','slate'],['PENDING','Chờ duyệt','yellow'],['APPROVED','Đã duyệt','green'],['REJECTED','Từ chối','red']].map(([key, label, color]) => (
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

            {/* Search + table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="Tìm MSSV hoặc họ tên..."
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
                        <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Không có đơn nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['MSSV','Họ tên','Loại đơn','Đợt đăng ký','Ngày nộp','Trạng thái','Thao tác'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(reg => (
                                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-5 py-4 font-mono text-xs text-slate-500">{reg.student?.studentCode || '--'}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-900">{reg.student?.fullName || '--'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${TYPE_CONFIG[reg.requestType]?.color || ''}`}>
                                                {TYPE_CONFIG[reg.requestType]?.label || reg.requestType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-xs font-medium max-w-[160px] truncate">{reg.period?.semester || '--'}</td>
                                        <td className="px-5 py-4 text-slate-500 text-xs">{fmt(reg.createdAt)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_CONFIG[reg.status]?.color}`}>
                                                {STATUS_CONFIG[reg.status]?.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => openModal(reg)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                                                <Eye className="w-3.5 h-3.5" /> Xem & Duyệt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-7 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Chi tiết đơn #{selected.id}</h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">{selected.period?.semester}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-7 space-y-5">
                            {/* Student Info */}
                            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Thông tin sinh viên</p>
                                {[
                                    ['MSSV', selected.student?.studentCode],
                                    ['Họ tên', selected.student?.fullName],
                                    ['CCCD', selected.student?.cccd],
                                    ['Giới tính', selected.student?.gender === 'MALE' ? 'Nam' : 'Nữ'],
                                    ['Email', selected.student?.email],
                                    ['Lớp', selected.student?.className],
                                    ['SĐT', selected.student?.phone],
                                    ['Loại đơn', TYPE_CONFIG[selected.requestType]?.label],
                                    ['Phòng nguyện vọng', selected.requestedRoom?.roomNumber ? `P.${selected.requestedRoom.roomNumber}` : 'Không có'],
                                    ['Tòa nguyện vọng', selected.requestedRoom?.building?.name || 'Không có'],
                                    ['Ghi chú', selected.note || '--'],
                                ].map(([label, val]) => (
                                    <div key={label} className="flex justify-between text-sm">
                                        <span className="text-slate-400 font-medium">{label}</span>
                                        <span className="text-slate-800 font-semibold text-right max-w-[200px] truncate">{val || '--'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Status badge */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">Trạng thái hiện tại:</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_CONFIG[selected.status]?.color}`}>
                                    {STATUS_CONFIG[selected.status]?.label}
                                </span>
                            </div>

                            {/* Action buttons (only for PENDING) */}
                            {selected.status === 'PENDING' && !action && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setAction('approve')}
                                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all">
                                        <CheckCircle2 className="w-5 h-5" /> Duyệt đơn
                                    </button>
                                    <button onClick={() => setAction('reject')}
                                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white border border-red-200 transition-all">
                                        <XCircle className="w-5 h-5" /> Từ chối
                                    </button>
                                </div>
                            )}

                            {/* Approve form */}
                            {action === 'approve' && (
                                <div className="space-y-4 bg-green-50 rounded-2xl p-5 border border-green-100">
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Xếp phòng cho sinh viên</p>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tòa nhà</label>
                                        <select value={selectedBuilding} onChange={e => handleBuildingChange(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium">
                                            <option value="">-- Chọn tòa nhà --</option>
                                            {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>

                                    {selectedBuilding && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Phòng còn trống ({rooms.length})
                                            </label>
                                            <select value={assignedRoomId} onChange={e => setAssignedRoomId(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium">
                                                <option value="">-- Chọn phòng --</option>
                                                {rooms.map(r => (
                                                    <option key={r.id} value={r.id}>
                                                        P.{r.roomNumber} — {r.roomGender === 'MALE' ? 'Nam' : 'Nữ'} — Sức chứa: {r.capacity}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giá phòng (VNĐ/Tháng)</label>
                                        <input type="number" value={roomPrice} onChange={e => setRoomPrice(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold text-slate-900"
                                            placeholder="VD: 1200000" />
                                    </div>

                                    {formError && (
                                        <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                                            <AlertTriangle className="w-4 h-4" />{formError}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-1">
                                        <button onClick={() => setAction(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">Quay lại</button>
                                        <button onClick={handleSubmit} disabled={submitting}
                                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Xác nhận duyệt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reject form */}
                            {action === 'reject' && (
                                <div className="space-y-4 bg-red-50 rounded-2xl p-5 border border-red-100">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Từ chối đơn đăng ký</p>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lý do từ chối</label>
                                        <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                                            rows="3" placeholder="Nhập lý do từ chối để thông báo cho sinh viên..."
                                            className="w-full px-4 py-2.5 bg-white border border-red-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sm resize-none"
                                        />
                                    </div>
                                    {formError && (
                                        <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-white p-3 rounded-xl border border-red-200">
                                            <AlertTriangle className="w-4 h-4" />{formError}
                                        </div>
                                    )}
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={() => setAction(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">Quay lại</button>
                                        <button onClick={handleSubmit} disabled={submitting}
                                            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Xác nhận từ chối
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Already processed notice */}
                            {selected.status !== 'PENDING' && (
                                <div className="bg-slate-50 rounded-2xl p-4 text-center text-slate-400 text-sm font-medium border border-slate-100">
                                    Đơn này đã được xử lý. Không thể thay đổi trạng thái.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
