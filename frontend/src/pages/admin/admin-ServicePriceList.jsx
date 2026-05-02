import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Zap, Droplet, Edit, Plus, Search, Loader2, AlertTriangle, X, Save, Info
} from 'lucide-react';

const TYPE_CONFIG = {
    ELECTRICITY: { label: 'Tiền điện', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    WATER:       { label: 'Tiền nước', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
};

const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ServicePriceList() {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState({ type: 'ELECTRICITY', price: '', unit: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/service-prices', getToken());
            setPrices(res.data);
            setError('');
        } catch (err) {
            setError('Không thể tải cấu hình giá dịch vụ.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (price = null) => {
        if (price) {
            setSelected(price);
            setFormData({ type: price.type, price: price.price.toString(), unit: price.unit });
        } else {
            setSelected(null);
            setFormData({ type: 'ELECTRICITY', price: '', unit: '' });
        }
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, price: parseFloat(formData.price) };
            if (selected) {
                await axios.put(`/api/service-prices/${selected.id}`, payload, getToken());
            } else {
                await axios.post('/api/service-prices', payload, getToken());
            }
            fetchPrices();
            setIsModalOpen(false);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Lỗi khi lưu thông tin.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 lg:p-12 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Cấu hình hệ thống</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Giá dịch vụ</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Đơn giá Dịch vụ</h1>
                    <p className="text-slate-500 text-sm">Thiết lập đơn giá điện, nước để làm căn cứ tính hóa đơn hàng tháng.</p>
                </div>
                <button onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Thêm loại mới
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                    <p className="text-slate-400">Đang tải cấu hình...</p>
                </div>
            ) : error ? (
                <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50 rounded-2xl border border-red-100">
                    <AlertTriangle className="w-5 h-5" /><p className="text-sm font-medium">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prices.map(item => {
                        const config = TYPE_CONFIG[item.type] || { label: item.type, icon: Info, color: 'text-slate-500', bg: 'bg-slate-50' };
                        const Icon = config.icon;
                        return (
                            <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} opacity-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
                                
                                <div className="relative flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center ${config.color}`}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <button onClick={() => handleOpenModal(item)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{config.label}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900">
                                        {new Intl.NumberFormat('vi-VN').format(item.price)}
                                    </span>
                                    <span className="text-slate-400 font-bold text-sm">VNĐ / {item.unit}</span>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-medium italic">Sử dụng cho tính toán hóa đơn tự động</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
                                {selected ? `Cập nhật ${TYPE_CONFIG[selected.type]?.label}` : 'Thêm loại dịch vụ mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {formError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Loại dịch vụ</label>
                                {selected ? (
                                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500">
                                        {TYPE_CONFIG[selected.type]?.label || selected.type}
                                    </div>
                                ) : (
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900">
                                        <option value="ELECTRICITY">Tiền điện</option>
                                        <option value="WATER">Tiền nước</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Đơn giá (VNĐ)</label>
                                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                        placeholder="VD: 3500"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Đơn vị tính</label>
                                    <input type="text" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                                        placeholder="VD: kWh, m3"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={submitting}
                                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Lưu thay đổi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
