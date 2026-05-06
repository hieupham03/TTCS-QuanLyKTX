import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Building2, BedDouble, ArrowRight, 
    AlertCircle, CheckCircle2, Loader2, 
    CalendarDays, Info, History
} from 'lucide-react';

const StudentRegistration = () => {
    const [studentData, setStudentData] = useState(null);
    const [activePeriod, setActivePeriod] = useState(null);
    const [registrationHistory, setRegistrationHistory] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    
    const [formData, setFormData] = useState({
        buildingName: '',
        requestedRoomId: '',
        note: ''
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const studentCode = localStorage.getItem('studentCode');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Student Info
            const studentRes = await axios.get(`/api/students/${studentCode}`, { headers });
            setStudentData(studentRes.data);

            // 2. Fetch Active Period
            const periodRes = await axios.get('/api/registration-periods', { headers });
            console.log("Registration Periods:", periodRes.data);
            const periods = Array.isArray(periodRes.data) ? periodRes.data : [];
            const openPeriod = periods.find(p => p.status === 'OPEN');
            console.log("Open Period:", openPeriod);
            setActivePeriod(openPeriod);

            // 3. Fetch Registration History
            const historyRes = await axios.get(`/api/registrations/student/${studentCode}`, { headers });
            setRegistrationHistory(historyRes.data);

            // 4. Fetch Buildings if period is open
            if (openPeriod) {
                const buildRes = await axios.get('/api/buildings', { headers });
                setBuildings(buildRes.data);
            }

        } catch (error) {
            console.error("Error fetching registration data:", error);
            setMessage({ type: 'error', text: 'Không thể tải dữ liệu. Vui lòng thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    // Load rooms when building is selected
    useEffect(() => {
        if (formData.buildingName) {
            axios.get(`/api/rooms/building/${formData.buildingName}`, { headers })
                .then(res => setRooms(res.data))
                .catch(err => console.error("Error loading rooms:", err));
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

        // Check if already registered for this period
        const alreadyRegistered = registrationHistory.some(r => r.period.id === activePeriod.id);
        if (alreadyRegistered) {
            setMessage({ type: 'error', text: 'Bạn đã gửi đơn đăng ký cho đợt này rồi. Vui lòng chờ xét duyệt.' });
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/registrations', {
                periodId: activePeriod.id,
                studentCode: studentCode,
                requestType: 'NEW_REGISTER',
                requestedRoomId: formData.requestedRoomId || null,
                note: formData.note
            }, { headers });

            setMessage({ type: 'success', text: 'Gửi đơn đăng ký thành công! Bạn có thể theo dõi trạng thái ở bên dưới.' });
            setFormData({ buildingName: '', requestedRoomId: '', note: '' });
            // Refresh history
            const historyRes = await axios.get(`/api/registrations/student/${studentCode}`, { headers });
            setRegistrationHistory(historyRes.data);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Đã có lỗi xảy ra.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Đăng ký phòng ở</h1>
                    <p className="text-slate-500 mt-1">Chọn nguyện vọng phòng và gửi yêu cầu xét duyệt.</p>
                </div>
                {activePeriod && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-xs font-bold uppercase tracking-widest border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Đợt mở: {activePeriod.semester}
                    </div>
                )}
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
                {/* Registration Form */}
                <div className="lg:col-span-2 space-y-6">
                    {!activePeriod ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CalendarDays size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Hiện không có đợt đăng ký nào mở</h2>
                            <p className="text-slate-500 max-w-sm mx-auto">Vui lòng quay lại sau khi có thông báo mới từ Ban quản lý KTX.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tòa nhà mong muốn</label>
                                    <select 
                                        required 
                                        name="buildingName" 
                                        value={formData.buildingName} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm"
                                    >
                                        <option value="">Chọn tòa nhà</option>
                                        {buildings.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phòng (Không bắt buộc)</label>
                                    <select 
                                        name="requestedRoomId" 
                                        value={formData.requestedRoomId} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-sm disabled:opacity-50"
                                        disabled={!formData.buildingName}
                                    >
                                        <option value="">Ưu tiên phòng trống bất kỳ</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>
                                                Phòng {r.roomNumber} ({r.gender === 'MALE' ? 'Nam' : 'Nữ'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Ghi chú / Nguyện vọng thêm</label>
                                <textarea 
                                    name="note" 
                                    value={formData.note} 
                                    onChange={handleChange} 
                                    rows="4" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-sm resize-none"
                                    placeholder="VD: Muốn ở cùng bạn B21DCCNxxx, tầng thấp, gần cửa sổ..."
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin w-5 h-5"/> : <><ArrowRight size={18}/> Gửi đơn đăng ký</>}
                            </button>
                        </form>
                    )}
                </div>

                {/* Sidebar Info & History */}
                <div className="space-y-6">
                    {/* User Info Card */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Thông tin người gửi</p>
                            <h3 className="text-xl font-bold mb-1">{studentData?.fullName}</h3>
                            <p className="text-sm text-slate-400">{studentData?.studentCode}</p>
                            <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-xs font-medium text-slate-300">
                                <p className="flex justify-between"><span>Lớp:</span> <span className="text-white font-bold">{studentData?.className}</span></p>
                                <p className="flex justify-between"><span>Email:</span> <span className="text-white font-bold">{studentData?.email}</span></p>
                            </div>
                        </div>
                        <Building2 className="absolute -right-8 -bottom-8 text-white/5 size-40 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* History Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <History size={16} className="text-blue-600" /> Lịch sử đăng ký
                        </h3>
                        <div className="space-y-4">
                            {registrationHistory.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-4">Chưa có dữ liệu đăng ký</p>
                            ) : (
                                registrationHistory.map(reg => (
                                    <div key={reg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs font-bold text-slate-900">{reg.period.semester}</p>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                reg.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                reg.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {reg.status === 'APPROVED' ? 'Đã duyệt' : reg.status === 'REJECTED' ? 'Bị từ chối' : 'Đang chờ'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium">Loại: {reg.requestType === 'NEW_REGISTER' ? 'Đăng ký mới' : 'Gia hạn'}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRegistration;
