import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CalendarDays,
    Plus,
    Edit,
    Trash2,
    LockOpen,
    Lock,
    Loader2,
    AlertTriangle,
    X,
    CheckCircle2,
    ClipboardList,
    ChevronRight
} from 'lucide-react';

const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const toInputDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toInputDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
};

const emptyForm = {
    semester: '',
    registrationStartDate: '',
    registrationEndDate: '',
    stayStartDate: '',
    stayEndDate: ''
};

const RegistrationPeriods = () => {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchPeriods();
    }, []);

    const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/registration-periods', getToken());
            // Sort newest first
            setPeriods(res.data.sort((a, b) => b.id - a.id));
            setError('');
        } catch {
            setError('Không thể tải danh sách đợt đăng ký.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, period = null) => {
        setModalMode(mode);
        setFormError('');
        if (mode === 'edit' && period) {
            setCurrentPeriod(period);
            setFormData({
                semester: period.semester,
                registrationStartDate: toInputDateTime(period.registrationStartDate),
                registrationEndDate: toInputDateTime(period.registrationEndDate),
                stayStartDate: toInputDate(period.stayStartDate),
                stayEndDate: toInputDate(period.stayEndDate),
            });
        } else {
            setCurrentPeriod(null);
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        try {
            const payload = {
                semester: formData.semester,
                registrationStartDate: formData.registrationStartDate,
                registrationEndDate: formData.registrationEndDate,
                stayStartDate: formData.stayStartDate,
                stayEndDate: formData.stayEndDate,
            };
            if (modalMode === 'add') {
                await axios.post('/api/registration-periods', payload, getToken());
            } else {
                await axios.put(`/api/registration-periods/${currentPeriod.id}`, payload, getToken());
            }
            fetchPeriods();
            setIsModalOpen(false);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu dữ liệu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (period) => {
        const action = period.status === 'OPEN' ? 'close' : 'open';
        const label = action === 'close' ? 'đóng' : 'mở lại';
        if (!window.confirm(`Bạn có chắc muốn ${label} đợt đăng ký "${period.semester}"?`)) return;
        try {
            await axios.put(`/api/registration-periods/${period.id}/${action}`, {}, getToken());
            fetchPeriods();
        } catch (err) {
            alert(err.response?.data?.message || `Không thể ${label} đợt đăng ký.`);
        }
    };

    const handleDelete = async (period) => {
        if (!window.confirm(`Bạn có chắc muốn XÓA đợt đăng ký "${period.semester}"? Thao tác này không thể hoàn tác!`)) return;
        try {
            await axios.delete(`/api/registration-periods/${period.id}`, getToken());
            fetchPeriods();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa đợt đăng ký. Có thể đã có đơn đăng ký trong đợt này.');
        }
    };

    const openCount = periods.filter(p => p.status === 'OPEN').length;
    const closedCount = periods.filter(p => p.status === 'CLOSED').length;

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Quản trị hệ thống</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Đợt đăng ký KTX</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Quản lý Đợt đăng ký</h1>
                    <p className="text-slate-500 text-sm">Tạo, mở và đóng các đợt đăng ký ký túc xá theo từng học kỳ.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Tạo đợt đăng ký mới
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng số đợt</p>
                        <p className="text-2xl font-black text-slate-900">{periods.length}</p>
                    </div>
                </div>
                <div className="bg-green-50 rounded-2xl border border-green-200 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                        <LockOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Đang mở</p>
                        <p className="text-2xl font-black text-green-700">{openCount}</p>
                    </div>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã đóng</p>
                        <p className="text-2xl font-black text-slate-700">{closedCount}</p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Periods List */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                </div>
            ) : periods.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium text-lg">Chưa có đợt đăng ký nào</p>
                    <p className="text-slate-400 text-sm mt-1">Nhấn nút "Tạo đợt đăng ký mới" để bắt đầu.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {periods.map((period) => (
                        <div
                            key={period.id}
                            className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group ${
                                period.status === 'OPEN'
                                    ? 'border-green-200 hover:border-green-300'
                                    : 'border-slate-200'
                            }`}
                        >
                            <div className={`h-1 w-full ${period.status === 'OPEN' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-300'}`}></div>
                            
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Left: Main info */}
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                        period.status === 'OPEN' ? 'bg-green-50' : 'bg-slate-50'
                                    }`}>
                                        <CalendarDays className={`w-7 h-7 ${period.status === 'OPEN' ? 'text-green-600' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-slate-900">{period.semester}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                period.status === 'OPEN'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {period.status === 'OPEN' ? '🟢 Đang mở' : '⚫ Đã đóng'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            ID: #{period.id}
                                        </p>
                                    </div>
                                </div>

                                {/* Middle: Date info */}
                                <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm flex-1 min-w-0">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Nhận đơn từ</p>
                                        <p className="font-semibold text-slate-700">{formatDateTime(period.registrationStartDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Đến ngày</p>
                                        <p className="font-semibold text-slate-700">{formatDateTime(period.registrationEndDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Lưu trú từ</p>
                                        <p className="font-semibold text-slate-700">{formatDate(period.stayStartDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Đến ngày</p>
                                        <p className="font-semibold text-slate-700">{formatDate(period.stayEndDate)}</p>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggleStatus(period)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                            period.status === 'OPEN'
                                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                : 'border-green-200 text-green-600 hover:bg-green-50'
                                        }`}
                                    >
                                        {period.status === 'OPEN'
                                            ? <><Lock className="w-3.5 h-3.5" /> Đóng đợt</>
                                            : <><LockOpen className="w-3.5 h-3.5" /> Mở lại</>
                                        }
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal('edit', period)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                                    >
                                        <Edit className="w-3.5 h-3.5" /> Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(period)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="px-8 py-5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                    {modalMode === 'add' ? 'Tạo đợt đăng ký mới' : 'Chỉnh sửa đợt đăng ký'}
                                </h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Quản lý KTX</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {formError && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />{formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên học kỳ</label>
                                <input
                                    type="text"
                                    name="semester"
                                    required
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Học kỳ 1 - 2024-2025"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bắt đầu nhận đơn</label>
                                    <input
                                        type="datetime-local"
                                        name="registrationStartDate"
                                        required
                                        value={formData.registrationStartDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kết thúc nhận đơn</label>
                                    <input
                                        type="datetime-local"
                                        name="registrationEndDate"
                                        required
                                        value={formData.registrationEndDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Thời gian lưu trú dự kiến</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Từ ngày</label>
                                        <input
                                            type="date"
                                            name="stayStartDate"
                                            required
                                            value={formData.stayStartDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Đến ngày</label>
                                        <input
                                            type="date"
                                            name="stayEndDate"
                                            required
                                            value={formData.stayEndDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {modalMode === 'add' ? 'Tạo đợt đăng ký' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationPeriods;
