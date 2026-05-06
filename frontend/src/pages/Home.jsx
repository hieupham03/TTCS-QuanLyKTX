import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, ShieldCheck, Wifi, Dumbbell } from 'lucide-react';

const Home = () => {
    return (
        <div className="font-body bg-surface text-on-surface antialiased min-h-screen flex flex-col overflow-x-hidden">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter text-blue-700">
                            PTIT - KTX
                        </Link>
                        {/* Removed unused static navigation links */}

                        <div className="flex items-center gap-4">
                            <Link to="/login" className="hidden sm:block text-on-surface-variant font-medium hover:text-on-surface px-2">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="bg-gradient-to-br from-[#0057cd] to-[#0d6efd] text-white font-bold px-5 py-2.5 rounded-lg shadow-md hover:-translate-y-0.5 hover:shadow-blue-500/30 transition-all">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex flex-col">
                {/* Hero Section Split */}
                <section className="flex flex-col md:flex-row flex-grow min-h-[calc(100vh-80px)]">
                    {/* Left: New Students */}
                    <div className="relative flex-1 min-h-[500px] flex flex-col justify-end p-8 md:p-16 text-center text-white border-r border-white/10 overflow-hidden group">
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 z-0" 
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                        <div className="relative z-20 mx-auto max-w-xl">
                            <span className="inline-block bg-primary/25 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                                New Residents
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Dành cho sinh viên chưa ở KTX</h2>
                            <p className="text-lg text-white/70 mb-10 mx-auto max-w-md">
                                Khám phá không gian sống hiện đại, an toàn và đầy đủ tiện nghi ngay trong khuôn viên trường đại học.
                            </p>
                            <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-br from-[#0057cd] to-[#0d6efd] text-white font-bold px-8 py-4 rounded-full hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                                ĐĂNG KÝ <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Existing Students */}
                    <div className="relative flex-1 min-h-[500px] flex flex-col justify-end p-8 md:p-16 text-center text-white overflow-hidden group">
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 z-0" 
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001946]/90 via-[#001946]/30 to-transparent z-10"></div>
                        <div className="relative z-20 mx-auto max-w-xl">
                            <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                                Returning Residents
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Dành cho sinh viên đang ở KTX</h2>
                            <p className="text-lg text-white/70 mb-10 mx-auto max-w-md">
                                Quản lý hợp đồng, yêu cầu sửa chữa và cập nhật thông tin cư trú nhanh chóng qua cổng thông tin.
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-full hover:-translate-y-1 hover:shadow-lg transition-all shadow-md">
                                ĐĂNG NHẬP <LogIn size={20} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Informational Section */}
                <section className="py-20 bg-surface">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-black/5">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-on-surface">An Ninh 24/7</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                    Hệ thống camera giám sát và đội ngũ bảo vệ chuyên nghiệp đảm bảo an toàn tuyệt đối cho sinh viên.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-black/5">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <Wifi size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-on-surface">Internet Tốc Độ Cao</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                    Phủ sóng toàn bộ khuôn viên KTX, hỗ trợ tối đa cho việc học tập và nghiên cứu của sinh viên.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-10 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-black/5">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <Dumbbell size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-on-surface">Tiện Ích Nội Khu</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                    Phòng gym, khu thể thao, và các cửa hàng tiện lợi ngay trong tầm tay bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#f3f4f5] pt-20 pb-8 border-t border-black/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                        <div>
                            <h5 className="text-lg font-bold text-slate-900 mb-6">PTIT - KTX</h5>
                            <p className="text-on-surface-variant max-w-md leading-relaxed text-sm mb-6">
                                Hệ thống Quản lý Ký túc xá Đại học. Mang lại sự yên bình và thông thái trong đời sống sinh viên.
                            </p>
                            <p className="text-on-surface-variant text-sm leading-relaxed">
                                Địa chỉ: Khu đô thị Đại học, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh.<br/>
                                Email: curator.dorm@university.edu.vn
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h6 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Thông Tin</h6>
                                <ul className="space-y-3">
                                    <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Contact Dean</a></li>
                                    <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Chính sách bảo mật</a></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Dịch Vụ</h6>
                                <ul className="space-y-3">
                                    <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Maintenance Request</a></li>
                                    <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Campus Map</a></li>
                                    <li><a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-black/5 text-center md:text-left">
                        <p className="text-xs text-on-surface-variant">
                            © 2024 University Dormitory Management. Informed Serenity in Campus Living.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
