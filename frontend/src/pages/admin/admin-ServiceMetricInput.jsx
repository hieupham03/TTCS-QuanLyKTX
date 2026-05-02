import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Zap, Droplets, Save, RefreshCw, CheckCircle2,
    AlertCircle, Loader2, Building2, DoorOpen,
    CalendarDays, History, ChevronRight, BarChart3
} from 'lucide-react';

const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

/* ─── helpers ─────────────────────────────────────────────────── */
const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

const currentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/* ─── component ───────────────────────────────────────────────── */
export default function AdminServiceMetricInput() {
    // ---------- state ----------
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [prices, setPrices] = useState({ electricity: 0, water: 0 });
    const [recentMetrics, setRecentMetrics] = useState([]);

    const [billingMonth, setBillingMonth] = useState(currentMonth());
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null); // full room object

    const [oldElec, setOldElec] = useState('');
    const [newElec, setNewElec] = useState('');
    const [oldWater, setOldWater] = useState('');
    const [newWater, setNewWater] = useState('');

    const [loadingRoom, setLoadingRoom] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

    // ---------- derived ----------
    const elecUsed = Math.max(0, Number(newElec) - Number(oldElec));
    const waterUsed = Math.max(0, Number(newWater) - Number(oldWater));
    const elecCost = elecUsed * prices.electricity;
    const waterCost = waterUsed * prices.water;
    const roomPrice = selectedRoom?.building?.roomPrice ?? 0;
    const totalEstimate = roomPrice + elecCost + waterCost;

    const filteredRooms = selectedBuilding
        ? rooms.filter(r => String(r.building?.id) === selectedBuilding)
        : rooms;

    // ---------- load on mount ----------
    useEffect(() => {
        loadBuildings();
        loadRooms();
        loadPrices();
        loadRecentMetrics();
    }, []);

    useEffect(() => {
        loadRecentMetrics();
    }, [billingMonth]);

    // ---------- api calls ----------
    const loadBuildings = async () => {
        try {
            const res = await axios.get('/api/buildings', { headers });
            setBuildings(res.data);
        } catch { /* silent */ }
    };

    const loadRooms = async () => {
        try {
            const res = await axios.get('/api/rooms', { headers });
            setRooms(res.data);
        } catch { /* silent */ }
    };

    const loadPrices = async () => {
        try {
            const res = await axios.get('/api/service-prices', { headers });
            const elec = res.data.find(p => p.type === 'ELECTRICITY');
            const water = res.data.find(p => p.type === 'WATER');
            setPrices({ electricity: elec?.price ?? 0, water: water?.price ?? 0 });
        } catch { /* silent */ }
    };

    const loadRecentMetrics = async () => {
        try {
            const res = await axios.get('/api/service-metrics', { headers });
            // filter by current billing month, sort desc
            const filtered = res.data
                .filter(m => m.billingMonth === billingMonth)
                .sort((a, b) => b.id - a.id)
                .slice(0, 10);
            setRecentMetrics(filtered);
        } catch { /* silent */ }
    };

    // When room is selected, auto-fill old readings from last month's metric
    const handleRoomSelect = async (roomId) => {
        if (!roomId) { setSelectedRoom(null); clearReadings(); return; }
        const room = rooms.find(r => String(r.id) === roomId);
        setSelectedRoom(room);
        setLoadingRoom(true);
        clearReadings();
        try {
            const res = await axios.get(`/api/service-metrics?roomId=${roomId}`, { headers });
            if (res.data.length > 0) {
                const last = res.data.sort((a, b) => b.id - a.id)[0];
                setOldElec(last.newElectricity ?? '');
                setOldWater(last.newWater ?? '');
            }
        } catch { /* no previous data */ }
        setLoadingRoom(false);
    };

    const clearReadings = () => {
        setOldElec(''); setNewElec(''); setOldWater(''); setNewWater('');
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    // ---------- submit ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRoom) return showToast('error', 'Vui lòng chọn phòng.');
        if (!billingMonth) return showToast('error', 'Vui lòng chọn tháng.');
        if (Number(newElec) < Number(oldElec))
            return showToast('error', 'Chỉ số điện mới phải ≥ chỉ số cũ.');
        if (Number(newWater) < Number(oldWater))
            return showToast('error', 'Chỉ số nước mới phải ≥ chỉ số cũ.');

        setSubmitting(true);
        try {
            await axios.post('/api/service-metrics', {
                roomId: selectedRoom.id,
                billingMonth,
                oldElectricity: Number(oldElec),
                newElectricity: Number(newElec),
                oldWater: Number(oldWater),
                newWater: Number(newWater),
            }, { headers });

            showToast('success', `Đã nhập chỉ số phòng ${selectedRoom.roomNumber} tháng ${billingMonth}. Hóa đơn đã được tạo tự động.`);
            clearReadings();
            setSelectedRoom(null);
            await loadRecentMetrics();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra. Phòng này có thể đã được nhập tháng này.';
            showToast('error', String(msg));
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- render ----------
    return (
        <div className="max-w-7xl mx-auto space-y-8">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl border max-w-sm animate-in slide-in-from-right-4 ${
                    toast.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {toast.type === 'success'
                        ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                        : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                    <p className="text-sm font-bold leading-relaxed">{toast.msg}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase block mb-2">
                        Quản lý Dịch vụ
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Nhập Chỉ số Điện &amp; Nước
                    </h2>
                    <p className="text-slate-500 font-medium mt-1 text-sm">
                        Nhập chỉ số đồng hồ hàng tháng — hệ thống tự động tính và tạo hóa đơn.
                    </p>
                </div>

                {/* current prices badge */}
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Zap size={16} className="text-amber-600" />
                        <span className="text-xs font-black text-amber-700">{fmt(prices.electricity)} / kWh</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Droplets size={16} className="text-blue-600" />
                        <span className="text-xs font-black text-blue-700">{fmt(prices.water)} / m³</span>
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── LEFT: Form (8 cols) ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Form card */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Biểu mẫu nhập liệu</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                                Tháng: {billingMonth}
                            </span>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Row 1: month + building + room */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Billing Month */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <CalendarDays size={12} /> Tháng lập chỉ số
                                    </label>
                                    <input
                                        type="month"
                                        value={billingMonth}
                                        onChange={e => setBillingMonth(e.target.value)}
                                        className="w-full bg-slate-50 border-b-2 border-transparent focus:border-blue-600 px-3 py-2.5 rounded-t-xl outline-none text-sm font-bold text-slate-900 transition-colors"
                                        required
                                    />
                                </div>

                                {/* Building filter */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Building2 size={12} /> Tòa nhà
                                    </label>
                                    <select
                                        value={selectedBuilding}
                                        onChange={e => { setSelectedBuilding(e.target.value); setSelectedRoom(null); clearReadings(); }}
                                        className="w-full bg-slate-50 border-b-2 border-transparent focus:border-blue-600 px-3 py-2.5 rounded-t-xl outline-none text-sm font-bold text-slate-900 transition-colors appearance-none"
                                    >
                                        <option value="">— Tất cả tòa nhà —</option>
                                        {buildings.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Room */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <DoorOpen size={12} /> Phòng <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedRoom?.id ?? ''}
                                            onChange={e => handleRoomSelect(e.target.value)}
                                            className="w-full bg-slate-50 border-b-2 border-transparent focus:border-blue-600 px-3 py-2.5 rounded-t-xl outline-none text-sm font-bold text-slate-900 transition-colors appearance-none"
                                            required
                                        >
                                            <option value="">— Chọn phòng —</option>
                                            {filteredRooms.map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {r.roomNumber} ({r.building?.name})
                                                </option>
                                            ))}
                                        </select>
                                        {loadingRoom && (
                                            <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-blue-600" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Readings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Electricity */}
                                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-6 space-y-5">
                                    <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                                        <Zap size={20} className="text-amber-600" />
                                        <h4 className="font-black text-slate-800">Điện (kWh)</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chỉ số đầu kỳ</label>
                                            <input
                                                type="number" min="0"
                                                value={oldElec}
                                                onChange={e => setOldElec(e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Chỉ số cuối kỳ <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" min="0"
                                                value={newElec}
                                                onChange={e => setNewElec(e.target.value)}
                                                placeholder="Nhập giá trị"
                                                className="w-full bg-white border-2 border-amber-200 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                    {elecUsed > 0 && (
                                        <div className="flex justify-between items-center bg-white rounded-xl px-4 py-2 border border-amber-100">
                                            <span className="text-xs font-bold text-slate-500">Tiêu thụ: <strong className="text-amber-600">{elecUsed} kWh</strong></span>
                                            <span className="text-xs font-black text-amber-700">{fmt(elecCost)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Water */}
                                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-6 space-y-5">
                                    <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
                                        <Droplets size={20} className="text-blue-600" />
                                        <h4 className="font-black text-slate-800">Nước (m³)</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chỉ số đầu kỳ</label>
                                            <input
                                                type="number" min="0"
                                                value={oldWater}
                                                onChange={e => setOldWater(e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Chỉ số cuối kỳ <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" min="0"
                                                value={newWater}
                                                onChange={e => setNewWater(e.target.value)}
                                                placeholder="Nhập giá trị"
                                                className="w-full bg-white border-2 border-blue-200 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                    {waterUsed > 0 && (
                                        <div className="flex justify-between items-center bg-white rounded-xl px-4 py-2 border border-blue-100">
                                            <span className="text-xs font-bold text-slate-500">Tiêu thụ: <strong className="text-blue-600">{waterUsed} m³</strong></span>
                                            <span className="text-xs font-black text-blue-700">{fmt(waterCost)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setSelectedRoom(null); clearReadings(); }}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    <RefreshCw size={16} /> Làm mới
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedRoom}
                                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Lưu chỉ số
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── RIGHT: Sidebar (4 cols) ── */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Invoice Preview */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                Ước tính hóa đơn
                            </p>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-bold flex items-center gap-2"><DoorOpen size={14} /> Tiền phòng</span>
                                    <span className="font-black">{fmt(roomPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-bold flex items-center gap-2"><Zap size={14} /> Tiền điện</span>
                                    <span className="font-black text-amber-400">{fmt(elecCost)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-bold flex items-center gap-2"><Droplets size={14} /> Tiền nước</span>
                                    <span className="font-black text-blue-400">{fmt(waterCost)}</span>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tổng cộng</span>
                                    <span className="text-2xl font-black text-blue-400">{fmt(totalEstimate)}</span>
                                </div>
                            </div>
                        </div>
                        <BarChart3 size={140} className="absolute -right-8 -bottom-8 text-white/5" />
                    </div>

                    {/* Recent Entries */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex-1">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <History size={16} className="text-slate-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Đã nhập tháng {billingMonth}
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                            {recentMetrics.length === 0 ? (
                                <div className="px-6 py-10 text-center text-slate-300">
                                    <History size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu</p>
                                </div>
                            ) : recentMetrics.map(m => (
                                <div key={m.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {m.room?.roomNumber}
                                                <span className="text-[10px] font-bold text-slate-400 ml-2">
                                                    {m.room?.building?.name}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                                    <Zap size={10} />
                                                    {m.newElectricity - m.oldElectricity} kWh
                                                </span>
                                                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                                    <Droplets size={10} />
                                                    {m.newWater - m.oldWater} m³
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {recentMetrics.length} phòng đã nhập
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
