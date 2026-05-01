import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, School, BedDouble, ArrowRight, Menu } from 'lucide-react';

const Registration = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        student_code: '',
        cccd: '',
        gender: '',
        dob: '',
        email: '',
        phone: '',
        class_name: '',
        building: '',
        requested_room: '',
        note: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Call API to submit registration
        console.log("Submitting:", formData);
        alert("Đã gửi đơn đăng ký!");
    };

    return (
        <div className="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col">
            {/* TopNavBar */}
            <header className="bg-white/80 backdrop-blur-xl font-inter tracking-tight top-0 sticky z-50 shadow-sm border-b border-black/5">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <Building2 className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900">PTIT - KTX</span>
                    </Link>
                    {/* Removed unused static navigation links */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
                {/* Header Section */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-on-surface mb-4">Đăng Ký Lưu Trú Lần Đầu</h1>
                    <p className="text-lg text-on-surface-variant max-w-2xl">
                        Đăng ký để được sắp xếp chỗ ở tại KTX. Vui lòng cung cấp thông tin chính xác theo giấy tờ tùy thân của bạn.
                    </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] border border-outline-variant/30">
                        <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant/10">
                            <h2 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
                                <User className="text-primary" size={20} />
                                Thông Tin Cá Nhân
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Họ và tên</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="full_name" value={formData.full_name} onChange={handleChange}
                                    placeholder="VD: Nguyễn Văn A" required type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Mã sinh viên</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="student_code" value={formData.student_code} onChange={handleChange}
                                    placeholder="VD: SV20240001" required type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Số CCCD</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="cccd" value={formData.cccd} onChange={handleChange}
                                    placeholder="VD: 001203040506" required type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Giới tính</label>
                                <select 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="gender" value={formData.gender} onChange={handleChange} required
                                >
                                    <option disabled value="">Chọn giới tính</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="MALE">Nam</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ngày sinh</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="dob" value={formData.dob} onChange={handleChange}
                                    required type="date"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Địa chỉ Email</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="email" value={formData.email} onChange={handleChange}
                                    placeholder="nguyenvana@university.edu.vn" required type="email"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Số điện thoại</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="0987654321" required type="tel"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Information Card */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] border border-outline-variant/30">
                        <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant/10">
                            <h2 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
                                <School className="text-primary" size={20} />
                                Thông Tin Học Tập
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="max-w-md">
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tên lớp</label>
                                <input 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                    name="class_name" value={formData.class_name} onChange={handleChange}
                                    placeholder="VD: K65-CNTT01" required type="text"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Room Preference Card */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] border border-outline-variant/30">
                        <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant/10">
                            <h2 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
                                <BedDouble className="text-primary" size={20} />
                                Nguyện Vọng Xếp Phòng
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tòa nhà</label>
                                    <select 
                                        className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                        name="building" value={formData.building} onChange={handleChange} required
                                    >
                                        <option disabled value="">Chọn tòa nhà</option>
                                        <option value="A1">Tòa A1</option>
                                        <option value="A2">Tòa A2</option>
                                        <option value="B1">Tòa B1</option>
                                        <option value="B2">Tòa B2</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Số phòng</label>
                                    <select 
                                        className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors outline-none" 
                                        name="requested_room" value={formData.requested_room} onChange={handleChange} required
                                    >
                                        <option disabled value="">Chọn phòng</option>
                                        <option value="101">101</option>
                                        <option value="102">102</option>
                                        <option value="201">201</option>
                                        <option value="202">202</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ghi chú / Yêu cầu đặc biệt</label>
                                <textarea 
                                    className="w-full bg-surface-container-highest border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm text-on-surface transition-colors resize-none outline-none" 
                                    name="note" value={formData.note} onChange={handleChange}
                                    placeholder="Các yêu cầu y tế, nguyện vọng bạn cùng phòng..." rows="4"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                        <button className="bg-transparent border border-outline-variant text-on-surface-variant px-8 py-3 rounded-lg font-medium hover:bg-surface-container-high transition-colors" type="button">
                            Lưu nháp
                        </button>
                        <button className="bg-primary text-white px-10 py-3 rounded-lg font-medium hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2" type="submit">
                            Gửi Đơn Đăng Ký
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 text-sm font-inter text-slate-500 py-12 border-t border-slate-200 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto gap-4">
                    <div className="font-bold text-slate-900">
                        PTIT - KTX
                    </div>
                    <div className="flex gap-6">
                        <a className="hover:text-primary underline decoration-2 underline-offset-4 transition-all" href="#">Chính sách bảo mật</a>
                        <a className="hover:text-primary underline decoration-2 underline-offset-4 transition-all" href="#">Điều khoản dịch vụ</a>
                        <a className="hover:text-primary underline decoration-2 underline-offset-4 transition-all" href="#">Trợ năng</a>
                    </div>
                    <div>
                        © 2024 Quản lý KTX Đại học. Đã đăng ký bản quyền.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Registration;
