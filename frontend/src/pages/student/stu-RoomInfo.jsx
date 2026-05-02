import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Building2, 
    Users, 
    Verified, 
    Calendar, 
    ChevronRight, 
    Phone, 
    Mail, 
    MapPin, 
    Info, 
    Loader2,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentRoomInfo = () => {
    const [contract, setContract] = useState(null);
    const [roommates, setRoommates] = useState([]);
    const [latestInvoice, setLatestInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    const studentCode = localStorage.getItem('studentCode');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchRoomData();
    }, []);

    const fetchRoomData = async () => {
        setLoading(true);
        try {
            // 1. Fetch current student's active contract
            const contractRes = await axios.get(`/api/contracts/student/${studentCode}`, { headers });
            console.log("All Contracts for Student:", contractRes.data);
            const active = contractRes.data.find(c => c.status === 'ACTIVE');
            console.log("Found Active Contract:", active);
            setContract(active);

            if (active) {
                // 2. Fetch all contracts in this room to find roommates
                const roommatesRes = await axios.get(`/api/contracts/room/${active.room.id}`, { headers });
                // Filter out the current student
                const others = roommatesRes.data.filter(c => c.student.studentCode !== studentCode && c.status === 'ACTIVE');
                setRoommates(others);

                // 3. Fetch latest invoice for this room
                const invoiceRes = await axios.get(`/api/invoices?roomId=${active.room.id}`, { headers });
                if (invoiceRes.data.length > 0) {
                    setLatestInvoice(invoiceRes.data.sort((a, b) => b.id - a.id)[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching room data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    );

    if (!contract) return (
        <div className="max-w-4xl mx-auto mt-20 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Info size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Bạn chưa có phòng ở hiện tại</h2>
            <p className="text-slate-500 font-medium">Vui lòng đăng ký phòng hoặc liên hệ Ban quản lý để được hỗ trợ.</p>
            <Link to="/student/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                Đăng ký ngay <ArrowRight size={18} />
            </Link>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase mb-2 block">Dành cho Sinh viên</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Thông tin phòng đang ở</h2>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Room Hero Card */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-blue-100/50"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                            <div>
                                <h3 className="text-6xl font-black text-blue-600 mb-3 tracking-tighter">{contract.room.roomNumber}</h3>
                                <p className="text-2xl font-bold text-slate-600 flex items-center gap-2">
                                    <Building2 className="text-slate-400" /> {contract.room.building.name}
                                </p>
                            </div>
                            <div className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                {contract.room.roomGender === 'MALE' ? 'Dành cho Nam' : 'Dành cho Nữ'} • Phòng tiêu chuẩn
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Giá thuê tháng</p>
                                <p className="text-2xl font-black text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.roomPrice)}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 md:col-span-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thời hạn lưu trú</p>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Bắt đầu</span>
                                        <span className="text-lg font-black text-slate-700">
                                            {contract.period?.stayStartDate ? new Date(contract.period.stayStartDate).toLocaleDateString('vi-VN') : '...'}
                                        </span>
                                    </div>
                                    <ArrowRight className="text-slate-300 mt-4" size={20} />
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Kết thúc</span>
                                        <span className="text-lg font-black text-slate-700">
                                            {contract.period?.stayEndDate ? new Date(contract.period.stayEndDate).toLocaleDateString('vi-VN') : '...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Summary Card */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-900/10 flex-1">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Verified className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái hợp đồng</p>
                                    <p className="text-lg font-black">Đang hiệu lực</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">Hợp đồng #{contract.id.toString().padStart(6, '0')} đã được xác thực và đang trong thời gian lưu trú chính thức.</p>
                        </div>
                        <Verified size={140} className="absolute -right-8 -bottom-8 text-white/5 opacity-50" />
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 border-b-4 border-b-amber-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kỳ thanh toán tới</p>
                                <p className="text-lg font-black text-slate-900">10/{new Date().getMonth() + 2}/{new Date().getFullYear()}</p>
                            </div>
                        </div>
                        <Link to="/student/invoices" className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            Xem chi tiết hóa đơn <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Roommates Section */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <Users className="text-blue-600" /> Danh sách bạn cùng phòng
                        </h4>
                        <span className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {roommates.length + 1} / {contract.room.capacity} Thành viên
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Current Student (You) */}
                        <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden bg-white/10">
                                        <img 
                                            alt="You" 
                                            className="w-full h-full object-cover" 
                                            src={`https://ui-avatars.com/api/?name=${contract.student.fullName}&background=fff&color=0057cd`}
                                        />
                                    </div>
                                    <div>
                                        <h5 className="text-lg font-black">{contract.student.fullName} (Bạn)</h5>
                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{contract.student.className} • {contract.student.studentCode}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-3 text-xs font-bold text-white/80">
                                        <Phone size={14} /> <span>{contract.student.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-white/80">
                                        <Mail size={14} /> <span>{contract.student.email || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Other Roommates */}
                        {roommates.map((c, index) => (
                            <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-4 border-slate-50 group-hover:border-blue-50 transition-colors">
                                        <img 
                                            alt={c.student.fullName} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                            src={`https://ui-avatars.com/api/?name=${c.student.fullName}&background=f1f5f9&color=64748b`}
                                        />
                                    </div>
                                    <div>
                                        <h5 className="text-lg font-black text-slate-900">{c.student.fullName}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.student.className}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                        <Phone size={14} /> <span>{c.student.phone ? c.student.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                        <Mail size={14} /> <span>{c.student.email ? c.student.email.split('@')[0].slice(0, 3) + '***@' + c.student.email.split('@')[1] : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty Slots */}
                        {[...Array(Math.max(0, contract.room.capacity - (roommates.length + 1)))].map((_, i) => (
                            <div key={`empty-${i}`} className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center opacity-60">
                                <div className="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center mb-4">
                                    <Users size={32} className="text-slate-300" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Giường trống</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interior Map / Room Layout */}
                <div className="lg:col-span-12 mt-4">
                    <div className="bg-slate-100 rounded-[2.5rem] p-2 overflow-hidden border border-slate-200/50">
                        <div className="flex items-center justify-between p-6 bg-white rounded-t-[2rem]">
                            <h4 className="font-black text-slate-900 flex items-center gap-3">
                                <MapPin className="text-blue-600" /> Sơ đồ vị trí phòng
                            </h4>
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tầng {contract.room.roomNumber.charAt(1)} • Cánh Phía Đông</span>
                        </div>
                        <div className="h-72 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-5">
                                <div className="grid grid-cols-10 gap-2 h-full w-full">
                                    {[...Array(100)].map((_, i) => <div key={i} className="border border-slate-900"></div>)}
                                </div>
                            </div>
                            
                            <div className="relative z-10 grid grid-cols-4 gap-4 p-12 w-full max-w-4xl">
                                {[...Array(12)].map((_, i) => {
                                    const isTarget = i === 5; // Simulating target room
                                    return (
                                        <div key={i} className={`h-20 rounded-2xl flex items-center justify-center transition-all ${
                                            isTarget 
                                            ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 ring-4 ring-white scale-110 z-20' 
                                            : 'bg-white border border-slate-200 text-slate-300 text-[10px] font-black'
                                        }`}>
                                            {isTarget ? (
                                                <div className="text-center">
                                                    <div className="text-xs font-black uppercase mb-1">Phòng {contract.room.roomNumber}</div>
                                                    <MapPin size={16} className="mx-auto" />
                                                </div>
                                            ) : `RM ${100 + i}`}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 bg-white rounded-b-[2rem] flex justify-center gap-8 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phòng của bạn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white border border-slate-200 rounded-full"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phòng khác</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hành lang / Thang máy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <footer className="pt-10 pb-20 text-center border-t border-slate-100">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all">Nội quy ký túc xá</button>
                    <Link to="/student/repairs" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all">Báo hỏng thiết bị</Link>
                    <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all">Sổ tay sinh viên</button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">Hệ thống ScholarStay © {new Date().getFullYear()} • Phiên bản 2.1.0</p>
            </footer>
        </div>
    );
};

export default StudentRoomInfo;
