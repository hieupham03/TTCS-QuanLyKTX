import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, 
    Mail, 
    Phone, 
    ShieldCheck, 
    Save, 
    Lock, 
    Loader2,
    Calendar,
    Contact,
    GraduationCap,
    CheckCircle2,
    Camera,
    AlertCircle,
    X,
    CreditCard,
    Users
} from 'lucide-react';

const StudentProfile = () => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({ email: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', password: '', repeatPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const studentCode = localStorage.getItem('studentCode');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/students/${studentCode}`, { headers });
            setStudentData(res.data);
            setFormData({
                email: res.data.email || '',
                phone: res.data.phone || ''
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordInputChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.put(`/api/students/${studentCode}`, {
                ...studentData,
                email: formData.email,
                phone: formData.phone
            }, { headers });

            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            fetchProfile(); // Refresh
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật.' });
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.repeatPassword) {
            setPasswordError('Mật khẩu nhập lại không khớp!');
            return;
        }

        setUpdating(true);
        setPasswordError('');

        try {
            await axios.post('/api/accounts/change-password', passwordData, { headers });
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', password: '', repeatPassword: '' });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="mb-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hồ sơ cá nhân</h2>
                <p className="text-slate-500 font-medium">Quản lý thông tin cá nhân và cài đặt bảo mật của bạn.</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Core Info (Read-only) */}
                    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Thông tin cơ bản</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Contact size={12} /> Mã sinh viên
                                </label>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{studentData?.studentCode}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={12} /> Họ và tên
                                </label>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{studentData?.fullName}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} /> Ngày sinh
                                </label>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{new Date(studentData?.dob).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} /> Số CCCD
                                </label>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{studentData?.cccd}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={12} /> Giới tính
                                </label>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                    {studentData?.gender === 'MALE' ? 'Nam' : 'Nữ'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap size={12} /> Lớp sinh hoạt
                                </label>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">{studentData?.className}</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Info (Editable) */}
                    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Thông tin liên hệ</h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="email">Địa chỉ Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        id="email"
                                        name="email"
                                        type="email" 
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm"
                                        placeholder="yourname@student.ptit.edu.vn"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="phone">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        id="phone"
                                        name="phone"
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm"
                                        placeholder="09xx xxx xxx"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Lưu thay đổi</>}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right Column: Avatar & Security */}
                <div className="space-y-8">
                    {/* Avatar Card */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-center text-white relative overflow-hidden group shadow-xl shadow-slate-900/10">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative group/avatar cursor-pointer mb-6">
                                <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden relative shadow-2xl">
                                    <img 
                                        alt="Portrait" 
                                        className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110 duration-500" 
                                        src={`https://ui-avatars.com/api/?name=${studentData?.fullName}&background=0057cd&color=fff&size=200`}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <h4 className="text-xl font-black">{studentData?.fullName}</h4>
                            <span className="mt-2 px-3 py-1 bg-white/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">Sinh viên chính quy</span>
                        </div>
                        <User size={180} className="absolute -right-12 -bottom-12 text-white/5 opacity-50" />
                    </div>

                    {/* Security Card */}
                    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Bảo mật</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Mật khẩu tài khoản</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1">Nên thay đổi mật khẩu định kỳ để bảo vệ tài khoản.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full py-3 bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Lock size={16} /> Đổi mật khẩu
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900">Đổi mật khẩu</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-8 space-y-5">
                            {passwordError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={14} /> {passwordError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                                <input 
                                    name="oldPassword"
                                    type="password" 
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                                <input 
                                    name="password"
                                    type="password" 
                                    value={passwordData.password}
                                    onChange={handlePasswordInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhập lại mật khẩu mới</label>
                                <input 
                                    name="repeatPassword"
                                    type="password" 
                                    value={passwordData.repeatPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm"
                                    required
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={16} /> : 'Xác nhận đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
