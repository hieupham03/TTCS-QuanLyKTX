import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Wrench, 
    Plus, 
    CalendarDays, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    LayoutGrid,
    List as ListIcon,
    X
} from 'lucide-react';

const StudentRepairRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, done: 0 });
    
    const [activeContract, setActiveContract] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [description, setDescription] = useState('');
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
            // Fetch Active Contract first to get Room ID
            const contractRes = await axios.get(`/api/contracts/student/${studentCode}`, { headers });
            const active = contractRes.data.find(c => c.status === 'ACTIVE');
            setActiveContract(active);

            // Fetch Repair Requests
            const res = await axios.get(`/api/repair-requests?studentCode=${studentCode}`, { headers });
            const data = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(data);
            
            updateStats(data);
        } catch (error) {
            console.error("Error fetching repair requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        setStats({
            total: data.length,
            pending: data.filter(r => r.status === 'PENDING').length,
            inProgress: data.filter(r => r.status === 'IN_PROGRESS').length,
            done: data.filter(r => r.status === 'DONE').length
        });
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        if (!activeContract) return;

        setSubmitting(true);
        try {
            await axios.post('/api/repair-requests', {
                studentCode: studentCode,
                roomId: activeContract.room.id,
                description: description
            }, { headers });

            setMessage({ type: 'success', text: 'Gửi yêu cầu sửa chữa thành công!' });
            setDescription('');
            setShowCreateModal(false);
            
            // Refresh list
            const res = await axios.get(`/api/repair-requests?studentCode=${studentCode}`, { headers });
            const data = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(data);
            updateStats(data);

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.' });
        } finally {
            setSubmitting(false);
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Success/Error Message Toast */}
            {message.text && (
                <div className={`fixed top-10 right-10 z-[100] p-4 rounded-2xl flex items-center gap-3 border shadow-2xl animate-in slide-in-from-right-10 ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            {/* Header & Primary Action */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Lịch sử Yêu cầu Sửa chữa</h2>
                    <p className="text-slate-500 font-medium text-sm">Theo dõi và quản lý các yêu cầu bảo trì thiết bị trong phòng của bạn.</p>
                </div>
                <button 
                    onClick={() => {
                        if (!activeContract) {
                            alert("Bạn phải có phòng đang hoạt động mới có thể gửi yêu cầu sửa chữa.");
                            return;
                        }
                        setShowCreateModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95"
                >
                    <Plus size={20} /> Gửi yêu cầu mới
                </button>
            </div>

            {/* Summary Bento Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng số yêu cầu</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.total}</h4>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <LayoutGrid size={60} />
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chờ xử lý</p>
                        <h4 className="text-3xl font-black text-amber-600">{stats.pending}</h4>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-600 group-hover:scale-110 transition-transform">
                        <Clock size={60} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đang thực hiện</p>
                        <h4 className="text-3xl font-black text-blue-600">{stats.inProgress}</h4>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-600 group-hover:scale-110 transition-transform">
                        <Wrench size={60} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã hoàn thành</p>
                        <h4 className="text-3xl font-black text-green-600">{stats.done}</h4>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={60} />
                    </div>
                </div>
            </div>

            {/* Main Table / List Container */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Controls */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo mã hoặc nội dung..." 
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Mã yêu cầu</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Ngày tạo</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-1/3">Mô tả sự cố</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Phòng</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <Wrench size={48} className="opacity-20 mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-widest italic">Bạn chưa có yêu cầu sửa chữa nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-bold text-slate-900">REQ-{req.id.toString().padStart(4, '0')}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(req.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-900 line-clamp-2">{req.description}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-700">{req.room?.roomNumber || 'N/A'}</td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                req.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-100' :
                                                req.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    req.status === 'DONE' ? 'bg-green-500' :
                                                    req.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                    'bg-amber-500'
                                                }`}></span>
                                                {req.status === 'DONE' ? 'Hoàn thành' : req.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Chờ tiếp nhận'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Gửi yêu cầu sửa chữa</h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Phòng {activeContract?.room?.roomNumber}</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRequest} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả sự cố / Thiết bị hỏng</label>
                                <textarea 
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="5"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-sm resize-none"
                                    placeholder="Vui lòng mô tả chi tiết sự cố (VD: Bóng đèn trần bị cháy, Vòi nước bồn rửa mặt bị rò rỉ...)"
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Gửi yêu cầu</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentRepairRequestList;
