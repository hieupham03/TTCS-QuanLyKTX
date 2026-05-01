import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const OTPVerify = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || 'email@example.com';

    const handleChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(0, 1);
        }
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length < 6) {
            alert("Vui lòng nhập đủ 6 số OTP");
            return;
        }
        
        // TODO: Call API /api/forgotPassword/verifyOtp/{email}/{otp}
        console.log("Verifying OTP:", fullOtp, "for email:", email);
        // Simulate success
        navigate('/reset-password', { state: { email } });
    };

    return (
        <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-body p-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 opacity-30 blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200 opacity-30 blur-3xl -z-10 pointer-events-none"></div>
            
            <main className="w-full max-w-md z-10">
                <div className="flex justify-center mb-10">
                    <h1 className="text-2xl font-extrabold tracking-tighter text-on-surface">
                        PTIT - KTX
                    </h1>
                </div>

                <section className="bg-white rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] border border-outline-variant/15 flex flex-col gap-6">
                    <header className="text-center">
                        <h2 className="text-xl font-bold text-on-surface mb-2 tracking-tight">Xác thực mã OTP</h2>
                        <p className="text-sm text-on-surface-variant">
                            Vui lòng nhập mã OTP đã được gửi đến <br/><span className="font-semibold text-primary">{email}</span>
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-2">
                        <div className="flex justify-between items-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-lg font-semibold bg-surface-container-highest border-b-2 border-transparent focus:border-primary text-on-surface rounded-lg transition-colors focus:bg-surface-container-low outline-none"
                                />
                            ))}
                        </div>

                        <button 
                            className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm" 
                            type="submit"
                        >
                            Xác nhận mã OTP
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="flex flex-col items-center gap-4 mt-2">
                        <p className="text-sm text-on-surface-variant">
                            Không nhận được mã?{' '}
                            <button className="text-primary font-medium hover:underline focus:outline-none transition-all">Gửi lại mã</button>
                        </p>
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors mt-2">
                            <ArrowLeft size={18} />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="absolute bottom-0 w-full flex flex-col md:flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto border-t border-outline-variant/15 text-sm text-on-surface-variant">
                <div className="mb-4 md:mb-0">
                    © 2024 PTIT - KTX. All rights reserved.
                </div>
                <nav className="flex gap-6">
                    <a className="hover:text-primary transition-colors" href="#">Điều khoản</a>
                    <a className="hover:text-primary transition-colors" href="#">Bảo mật</a>
                    <a className="hover:text-primary transition-colors" href="#">Trung tâm hỗ trợ</a>
                </nav>
            </footer>
        </div>
    );
};

export default OTPVerify;
