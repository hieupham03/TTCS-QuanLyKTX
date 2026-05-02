import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Search, Plus, Edit, Trash2, Eye,
    Loader2, AlertTriangle, X, CheckCircle2,
    ChevronLeft, ChevronRight, UserCircle2
} from 'lucide-react';

const COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-rose-100 text-rose-700'];
const getInitials = (name = '') => name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const EMPTY_FORM = { studentCode: '', cccd: '', fullName: '', gender: 'MALE', dob: '', className: '', phone: '', email: '' };

const PAGE_SIZE = 10;

export default function AdminStudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal
    const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'detail'
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [activeRoom, setActiveRoom] = useState(null); // Thông tin phòng hiện tại

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/students', getToken());
            setStudents(res.data);
            setError('');
        } catch {
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Filter
    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !q || s.studentCode?.toLowerCase().includes(q) || s.fullName?.toLowerCase().includes(q);
        const matchGender = genderFilter === 'ALL' || s.gender === genderFilter;
        return matchSearch && matchGender;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleOpenModal = (mode, student = null) => {
        setModalMode(mode);
        setFormError('');
        if ((mode === 'edit' || mode === 'detail') && student) {
            setSelected(student);
            setFormData({
                studentCode: student.studentCode || '',
                cccd: student.cccd || '',
                fullName: student.fullName || '',
                gender: student.gender || 'MALE',
                dob: student.dob || '',
                className: student.className || '',
                phone: student.phone || '',
                email: student.email || '',
            });
        } else {
            setSelected(null);
            setFormData(EMPTY_FORM);
        }

        // Nếu xem chi tiết, lấy thêm thông tin phòng
        if (mode === 'detail' && student) {
            setActiveRoom('loading');
            axios.get(`/api/contracts/student/${student.studentCode}`, getToken())
                .then(res => {
                    const activeContract = res.data.find(c => c.status === 'ACTIVE');
                    if (activeContract && activeContract.room) {
                        setActiveRoom({
                            roomNumber: activeContract.room.roomNumber,
                            buildingName: activeContract.room.building?.name || '---'
                        });
                    } else {
                        setActiveRoom('none');
                    }
                })
                .catch(() => setActiveRoom('none'));
        } else {
            setActiveRoom(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        try {
            if (modalMode === 'add') {
                await axios.post('/api/students', formData, getToken());
            } else {
                await axios.put(`/api/students/${selected.studentCode}`, formData, getToken());
            }
            fetchStudents();
            setModalMode(null);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (student) => {
        if (!window.confirm(`Xóa sinh viên "${student.fullName}" (${student.studentCode})?`)) return;
        try {
            await axios.delete(`/api/students/${student.studentCode}`, getToken());
            fetchStudents();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa sinh viên này.');
        }
    };

    const InputField = ({ label, name, type = 'text', required, placeholder, value, onChange, disabled }) => (
        <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
            <input type={type} name={name} required={required} placeholder={placeholder}
                value={value} onChange={onChange} disabled={disabled}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            />
        </div>
    );

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Quản lý Sinh viên</h1>
                    <p className="text-slate-500 text-sm">Hệ thống quản lý thông tin cư trú và hồ sơ sinh viên nội trú.</p>
                </div>
                <button onClick={() => handleOpenModal('add')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Thêm sinh viên mới
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tìm kiếm sinh viên</label>
                    <Search className="absolute left-3 bottom-2.5 text-slate-400 w-4 h-4" />
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Nhập tên hoặc mã sinh viên..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Giới tính</label>
                    <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="ALL">Tất cả</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                    </select>
                </div>
                <div className="md:col-span-4 flex items-end">
                    <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 w-full text-sm text-slate-500 text-center font-medium">
                        Tìm thấy <span className="font-black text-blue-600">{filtered.length}</span> / {students.length} sinh viên
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="py-24 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                        <p className="text-slate-400 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="py-20 text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Không tìm thấy sinh viên nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {['Mã SV', 'Họ và Tên', 'Giới tính', 'Ngày sinh', 'Lớp', 'Email', 'SĐT', 'Thao tác'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map(s => (
                                    <tr key={s.studentCode} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-5 py-4 font-mono text-xs font-bold text-blue-600">{s.studentCode}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getColor(s.fullName)}`}>
                                                    {getInitials(s.fullName)}
                                                </div>
                                                <span className="font-semibold text-slate-900">{s.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${s.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                {s.gender === 'MALE' ? 'Nam' : 'Nữ'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{fmtDate(s.dob)}</td>
                                        <td className="px-5 py-4 text-slate-500">{s.className}</td>
                                        <td className="px-5 py-4 text-slate-500 text-xs">{s.email}</td>
                                        <td className="px-5 py-4 text-slate-500">{s.phone || '--'}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal('detail', s)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Xem chi tiết">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal('edit', s)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Chỉnh sửa">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(s)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Xóa">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-400">
                            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} của {filtered.length} sinh viên
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Add / Edit / Detail */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-7 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <UserCircle2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
                                        {modalMode === 'add' ? 'Thêm sinh viên mới' : modalMode === 'edit' ? `Chỉnh sửa: ${selected?.studentCode}` : `Chi tiết: ${selected?.studentCode}`}
                                    </h3>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">PTIT - KTX</p>
                                </div>
                            </div>
                            <button onClick={() => setModalMode(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-7">
                            {modalMode === 'detail' ? (
                                <div className="space-y-3">
                                    {/* Avatar */}
                                    <div className="flex justify-center mb-6">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black ${getColor(selected?.fullName)}`}>
                                            {getInitials(selected?.fullName)}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                                        {[
                                            ['Mã sinh viên', selected?.studentCode],
                                            ['Họ và tên', selected?.fullName],
                                            ['CCCD', selected?.cccd],
                                            ['Giới tính', selected?.gender === 'MALE' ? 'Nam' : 'Nữ'],
                                            ['Ngày sinh', fmtDate(selected?.dob)],
                                            ['Lớp', selected?.className],
                                            ['SĐT', selected?.phone || '--'],
                                            ['Email', selected?.email],
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                                <span className="text-sm font-semibold text-slate-800">{val || '--'}</span>
                                            </div>
                                        ))}

                                        {/* Hiển thị thông tin phòng hiện tại */}
                                        <div className="pt-3 mt-3 border-t border-blue-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Phòng hiện tại</span>
                                                <span className="text-sm font-black text-blue-600 uppercase">
                                                    {activeRoom === 'loading' ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : activeRoom === 'none' ? (
                                                        'Chưa xếp phòng'
                                                    ) : activeRoom ? (
                                                        `P.${activeRoom.roomNumber} (${activeRoom.buildingName})`
                                                    ) : '---'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setModalMode(null)}
                                        className="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all">
                                        Đóng
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {formError && (
                                        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />{formError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Mã sinh viên (10 ký tự)" name="studentCode" required
                                            placeholder="VD: B21DCCN001"
                                            value={formData.studentCode}
                                            onChange={e => setFormData(p => ({...p, studentCode: e.target.value}))}
                                            disabled={modalMode === 'edit'}
                                        />
                                        <InputField label="CCCD (12 số)" name="cccd" required placeholder="012345678901"
                                            value={formData.cccd}
                                            onChange={e => setFormData(p => ({...p, cccd: e.target.value}))}
                                        />
                                    </div>

                                    <InputField label="Họ và tên" name="fullName" required placeholder="Nguyễn Văn A"
                                        value={formData.fullName}
                                        onChange={e => setFormData(p => ({...p, fullName: e.target.value}))}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giới tính</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button type="button" onClick={() => setFormData(p => ({...p, gender: 'MALE'}))}
                                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${formData.gender === 'MALE' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    NAM
                                                </button>
                                                <button type="button" onClick={() => setFormData(p => ({...p, gender: 'FEMALE'}))}
                                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${formData.gender === 'FEMALE' ? 'bg-pink-50 border-pink-600 text-pink-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    NỮ
                                                </button>
                                            </div>
                                        </div>
                                        <InputField label="Ngày sinh" name="dob" type="date"
                                            value={formData.dob}
                                            onChange={e => setFormData(p => ({...p, dob: e.target.value}))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Lớp (10 ký tự)" name="className" required placeholder="D21CQCN01-B"
                                            value={formData.className}
                                            onChange={e => setFormData(p => ({...p, className: e.target.value}))}
                                        />
                                        <InputField label="Số điện thoại" name="phone" placeholder="0912345678"
                                            value={formData.phone}
                                            onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                                        />
                                    </div>

                                    <InputField label="Email" name="email" type="email" required placeholder="sv@ptit.edu.vn"
                                        value={formData.email}
                                        onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                                    />

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setModalMode(null)}
                                            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                                            Hủy
                                        </button>
                                        <button type="submit" disabled={submitting}
                                            className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {modalMode === 'add' ? 'Thêm sinh viên' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
