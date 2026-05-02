import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, 
    Calendar, 
    Home, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ChevronRight,
    Search,
    Filter,
    Download,
    Building2,
    Info
} from 'lucide-react';

const StudentContractList = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const studentCode = localStorage.getItem('studentCode');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`/api/contracts/student/${studentCode}`, { headers });
            // Sort by createdAt descending (newest first)
            const sortedData = response.data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setContracts(sortedData);
        } catch (error) {
            console.error("Error fetching contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContracts = contracts.filter(contract => {
        const matchesSearch = 
            contract.room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.room.building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.period.semester.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || contract.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-50 text-green-700 border-green-100';
            case 'EXPIRED':
                return 'bg-slate-50 text-slate-600 border-slate-100';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle2 size={14} />;
            case 'EXPIRED':
                return <Clock size={14} />;
            case 'CANCELLED':
                return <XCircle size={14} />;
            default:
                return <Info size={14} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Đang hiệu lực';
            case 'EXPIRED': return 'Hết hạn';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Lịch sử hợp đồng</h1>
                    <p className="text-slate-500 font-medium mt-1">Xem và quản lý tất cả các hợp đồng lưu trú của bạn</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col items-end px-4 border-r border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng cộng</p>
                        <p className="text-xl font-black text-slate-900">{contracts.length}</p>
                    </div>
                    <div className="flex flex-col items-end px-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang hiệu lực</p>
                        <p className="text-xl font-black text-blue-600">{contracts.filter(c => c.status === 'ACTIVE').length}</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={20} />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Tìm theo phòng, tòa nhà, học kỳ..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Filter size={20} />
                    </span>
                    <select 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hiệu lực</option>
                        <option value="EXPIRED">Hết hạn</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>

                <button className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                    <Download size={20} /> Xuất PDF
                </button>
            </div>

            {/* Contracts List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : filteredContracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContracts.map((contract) => (
                        <div 
                            key={contract.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                                        <FileText size={32} />
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(contract.status)}`}>
                                        {getStatusIcon(contract.status)} {getStatusText(contract.status)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã hợp đồng</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">HD-{contract.id.toString().padStart(6, '0')}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tòa nhà</p>
                                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                <Building2 size={16} className="text-blue-500" />
                                                {contract.room.building.name}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số phòng</p>
                                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                <Home size={16} className="text-blue-500" />
                                                Phòng {contract.room.roomNumber}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Học kỳ</p>
                                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                <Calendar size={16} className="text-blue-500" />
                                                {contract.period.semester}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đơn giá</p>
                                            <p className="text-lg font-black text-blue-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.roomPrice)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button className="flex-1 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600">
                                        <Info size={16} /> Chi tiết
                                    </button>
                                    <button className="px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:border-slate-900 transition-all group-hover:bg-slate-900 group-hover:text-white">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Decorative Bottom Bar */}
                            <div className={`h-1.5 w-full ${
                                contract.status === 'ACTIVE' ? 'bg-green-500' : 
                                contract.status === 'EXPIRED' ? 'bg-slate-300' : 'bg-red-500'
                            }`}></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText size={48} className="text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Không tìm thấy hợp đồng nào</h2>
                    <p className="text-slate-500 font-medium">Bạn chưa có bất kỳ hợp đồng lưu trú nào trong hệ thống.</p>
                </div>
            )}
        </div>
    );
};

export default StudentContractList;
