import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Building2, User, School, BedDouble, ArrowRight, 
    AlertCircle, CheckCircle2, Loader2, Info
} from 'lucide-react';

const Registration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        studentCode: '',
        cccd: '',
        gender: '',
        dob: '',
        email: '',
        phone: '',
        className: '',
        buildingName: '',
        requestedRoomId: '',
        note: ''
    });

    const [activePeriod, setActivePeriod] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Lấy đợt đăng ký đang mở
                const periodRes = await axios.get('/api/registration-periods');
                console.log("Periods fetched:", periodRes.data); // Debug log
                
                const periods = Array.isArray(periodRes.data) ? periodRes.data : [];
                const openPeriod = periods.find(p => p.status?.toUpperCase() === 'OPEN');
                
                if (openPeriod) {
                    setActivePeriod(openPeriod);
                    // 2. Chỉ lấy danh sách tòa nhà nếu có đợt mở
                    const buildRes = await axios.get('/api/buildings');
                    setBuildings(buildRes.data || []);
                } else {
                    console.warn("No OPEN period found in:", periods);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu ban đầu:", error.response || error);
                const errorMsg = error.response?.status === 401 || error.response?.status === 403
                    ? 'Lỗi phân quyền: Máy chủ từ chối truy cập công khai.'
                    : 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
                setMessage({ type: 'error', text: errorMsg });
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    // Load phòng khi chọn tòa nhà
    useEffect(() => {
        if (formData.buildingName) {
            axios.get(`/api/rooms/building/${formData.buildingName}`)
                .then(res => setRooms(res.data || []))
                .catch(err => console.error("Lỗi tải danh sách phòng:", err));
        } else {
            setRooms([]);
        }
    }, [formData.buildingName]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activePeriod) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // Bước 1: Tạo/Cập nhật hồ sơ sinh viên
            await axios.post('/api/students', {
                studentCode: formData.studentCode,
                cccd: formData.cccd,
                fullName: formData.fullName,
                gender: formData.gender,
                dob: formData.dob,
                className: formData.className,
                phone: formData.phone,
                email: formData.email
            });

            // Bước 2: Gửi đơn đăng ký
            await axios.post('/api/registrations', {
                periodId: activePeriod.id,
                studentCode: formData.studentCode,
                requestType: 'NEW_REGISTER',
                requestedRoomId: formData.requestedRoomId || null,
                note: formData.note
            });

            setMessage({ type: 'success', text: 'Đơn đăng ký của bạn đã được gửi thành công! Admin sẽ duyệt và phản hồi sớm.' });
            setTimeout(() => navigate('/'), 5000);
        } catch (error) {
            console.error("Registration error:", error);
            const backendMsg = error.response?.data?.message;
            const backendErr = error.response?.data?.error;
            const statusText = error.response?.statusText;
            
            setMessage({ 
                type: 'error', 
                text: backendMsg || backendErr || statusText || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin." 
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="bg-slate-50 text-slate-900 font-body antialiased min-h-screen flex flex-col">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-slate-200">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                            <Building2 className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900">PTIT - KTX</span>
                    </Link>
                </div>
            </header>

            <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-12">
                {!activePeriod ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-amber-900 mb-2">Hiện chưa có đợt đăng ký nào mở</h2>
                        <p className="text-amber-700 max-w-md mx-auto">
                            Rất tiếc, cổng đăng ký trực tuyến hiện đang đóng. Vui lòng quay lại sau hoặc liên hệ Văn phòng Quản lý KTX để biết thêm chi tiết.
                        </p>
                        <Link to="/" className="inline-block mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all">
                            Quay lại Trang chủ
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Đang mở: {activePeriod.semester}
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Đăng Ký Lưu Trú KTX</h1>
                            <p className="text-slate-500">Vui lòng điền đầy đủ và chính xác thông tin để được xét duyệt phòng.</p>
                        </div>

                        {message.text && (
                            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Thông tin cá nhân */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h2 className="font-bold flex items-center gap-2"><User size={18} className="text-blue-600"/> Thông tin cá nhân</h2>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                                        <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="VD: Nguyễn Văn A" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mã sinh viên</label>
                                        <input required name="studentCode" value={formData.studentCode} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="VD: B21DCCN001" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số CCCD</label>
                                        <input required name="cccd" value={formData.cccd} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="VD: 012345678901" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giới tính</label>
                                        <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                            <option value="">Chọn giới tính</option>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngày sinh</label>
                                        <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="sv@ptit.edu.vn" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số điện thoại</label>
                                        <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0987654321" />
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin học tập */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h2 className="font-bold flex items-center gap-2"><School size={18} className="text-blue-600"/> Thông tin học tập</h2>
                                </div>
                                <div className="p-6">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên lớp</label>
                                    <input required name="className" value={formData.className} onChange={handleChange} className="w-full max-w-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="VD: D21CQCN01-B" />
                                </div>
                            </div>

                            {/* Nguyện vọng phòng */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <h2 className="font-bold flex items-center gap-2"><BedDouble size={18} className="text-blue-600"/> Nguyện vọng phòng</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Chọn Tòa nhà (Nguyện vọng)</label>
                                            <select name="buildingName" value={formData.buildingName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                                <option value="">Không bắt buộc (Tự động sắp xếp)</option>
                                                {buildings.map(b => (
                                                    <option key={b.name} value={b.name}>
                                                        {b.name} — {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.roomPrice)}
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.buildingName && (
                                                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                                                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] font-bold text-blue-900 leading-tight uppercase tracking-tight">Thông tin giá tòa {formData.buildingName}</p>
                                                        <p className="text-sm font-black text-blue-600 mt-0.5">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(buildings.find(b => b.name === formData.buildingName)?.roomPrice || 0)}
                                                            <span className="text-[10px] font-medium text-blue-400 ml-1">/ tháng</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Chọn Phòng (Nếu có)</label>
                                            <select name="requestedRoomId" value={formData.requestedRoomId} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" disabled={!formData.buildingName}>
                                                <option value="">Để trống để Admin tự xếp phòng</option>
                                                {rooms.map(r => (
                                                    <option key={r.id} value={r.id}>
                                                        Phòng {r.roomNumber} ({r.gender === 'MALE' ? 'Nam' : 'Nữ'}) — {r.status === 'AVAILABLE' ? 'Còn chỗ' : 'Hết chỗ'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ghi chú</label>
                                        <textarea name="note" value={formData.note} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Nguyện vọng ở cùng bạn bè, yêu cầu sức khỏe..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin w-5 h-5"/> : <><ArrowRight size={18}/> Gửi Đơn Đăng Ký</>}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
};

export default Registration;
