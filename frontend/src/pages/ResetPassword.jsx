import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Key, Lock, Info, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || 'email@example.com';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu không khớp!");
            return;
        }
        if (newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`/api/forgotPassword/changePassword/${email}`, {
                password: newPassword,
                repeatPassword: confirmPassword
            });
            alert("Cập nhật mật khẩu thành công!");
            navigate('/login');
        } catch (err) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-4 sm:p-8 antialiased">
            <div className="w-full max-w-md bg-white rounded-lg p-8 sm:p-10 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] border border-outline-variant/15 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
                
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-6 ring-4 ring-surface">
                        <Lock className="text-blue-700 w-6 h-6" />
                    </div>
                    <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-3">Đặt lại mật khẩu mới</h1>
                    <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-bold mb-2" htmlFor="new_password">Mật khẩu mới</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 w-5 h-5 pointer-events-none" />
                            <input 
                                className="w-full bg-surface-container-highest text-on-surface pl-12 pr-4 py-3.5 rounded-t-lg border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-colors outline-none" 
                                id="new_password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-bold mb-2" htmlFor="confirm_password">Nhập lại mật khẩu mới</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 w-5 h-5 pointer-events-none" />
                            <input 
                                className="w-full bg-surface-container-highest text-on-surface pl-12 pr-4 py-3.5 rounded-t-lg border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-colors outline-none" 
                                id="confirm_password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-lg mt-2">
                        <Info className="text-primary w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm text-on-surface-variant leading-relaxed">Ít nhất 6 ký tự, nên bao gồm cả chữ cái và số.</p>
                    </div>

                    <div className="pt-4">
                        <button 
                            className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-medium py-3.5 px-6 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Cập nhật mật khẩu
                                    <CheckCircle2 size={20} />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-blue-700 transition-colors">
                            <ArrowLeft size={18} />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
