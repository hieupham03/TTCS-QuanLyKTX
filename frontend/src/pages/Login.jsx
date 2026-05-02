import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                username: formData.username,
                passwordHash: formData.password
            };
            const response = await axios.post('/api/auth/login', payload);
            if (response.data.token) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                
                // Parse JWT payload to get role and studentCode
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    
                    const decoded = JSON.parse(jsonPayload);
                    const role = decoded.scope; // scope contains the role name
                    const studentCode = decoded.sub; // subject contains the username/studentCode

                    localStorage.setItem('studentCode', studentCode);

                    // Navigate based on role
                    if (role === 'ADMIN') {
                        window.location.href = '/admin';
                    } else if (role === 'STUDENT') {
                        window.location.href = '/student';
                    } else {
                        // Default fallback
                        window.location.href = '/';
                    }
                } catch (parseError) {
                    console.error("Error parsing JWT:", parseError);
                    window.location.href = '/';
                }
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-stretch bg-white overflow-hidden">
            {/* Left Side: Visual/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 signature-gradient opacity-80 mix-blend-multiply"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-16 text-white z-10">
                    <h1 className="text-5xl font-black mb-6 tracking-tighter">PTIT - KTX</h1>
                    <p className="text-xl text-white/80 max-w-md leading-relaxed">
                        Hệ thống quản lý cư trú thông minh, mang lại sự tiện nghi và an tâm cho sinh viên trong suốt quá trình học tập.
                    </p>
                    <div className="mt-12 flex gap-8">
                        <div>
                            <div className="text-3xl font-bold">2k+</div>
                            <div className="text-sm text-white/60">Sinh viên</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">500+</div>
                            <div className="text-sm text-white/60">Phòng ở</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">24/7</div>
                            <div className="text-sm text-white/60">Hỗ trợ</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <h2 className="text-3xl font-black text-blue-700 tracking-tighter">KTX Curator</h2>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
                        <p className="text-gray-500">Vui lòng đăng nhập để quản lý tài khoản của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Tên đăng nhập</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User size={20} />
                                </span>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    className="input-premium pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Mật khẩu</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    className="input-premium pl-12 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="text-blue-600 font-semibold hover:text-blue-700">Quên mật khẩu?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-premium w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Đăng Nhập <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-top border-gray-200 text-center">
                        <p className="text-gray-600 text-sm">
                            Bạn chưa có tài khoản?{' '}
                            <Link to="/register" className="text-blue-600 font-bold hover:underline">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
