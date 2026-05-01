import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Call API /api/forgotPassword/verifyMail/ with email
        console.log("Requesting OTP for:", email);
        // Simulate success and navigate to OTP verification
        navigate('/verify-otp', { state: { email } });
    };

    return (
        <div className="bg-surface text-on-surface h-screen flex flex-col items-center justify-center p-4 antialiased">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-on-surface">PTIT - KTX</h1>
                    <p className="text-sm text-on-surface-variant mt-1 tracking-wider uppercase">Cổng Sinh viên</p>
                </div>

                <div className="bg-white rounded-lg p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] relative overflow-hidden border border-outline-variant/15">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-on-surface mb-2">Quên mật khẩu</h2>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            Nhập email của bạn để nhận mã OTP xác thực khôi phục tài khoản.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2" htmlFor="email">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="text-outline w-5 h-5" />
                                </div>
                                <input 
                                    className="block w-full pl-10 pr-3 py-3 bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-colors text-on-surface text-sm outline-none" 
                                    id="email" 
                                    type="email" 
                                    placeholder="nguyenvana@student.ptit.edu.vn" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <button 
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-transform duration-150 hover:scale-[0.98] shadow-sm text-sm" 
                                type="submit"
                            >
                                Gửi mã xác nhận
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                        © 2024 PTIT - KTX. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
