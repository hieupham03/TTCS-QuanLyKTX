import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Building2, 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Loader2, 
    AlertTriangle,
    X,
    CheckCircle2,
    Info
} from 'lucide-react';

const BuildingList = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentBuilding, setCurrentBuilding] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        roomPrice: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/buildings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuildings(response.data);
            setError('');
        } catch (err) {
            console.error("Error fetching buildings:", err);
            setError('Không thể tải danh sách tòa nhà. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, building = null) => {
        setModalMode(mode);
        setFormError('');
        if (mode === 'edit' && building) {
            setCurrentBuilding(building);
            setFormData({
                name: building.name,
                roomPrice: building.roomPrice.toString(),
                description: building.description || ''
            });
        } else {
            setCurrentBuilding(null);
            setFormData({
                name: '',
                roomPrice: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', roomPrice: '', description: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                roomPrice: parseInt(formData.roomPrice)
            };

            if (modalMode === 'add') {
                await axios.post('/api/buildings', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`/api/buildings/${currentBuilding.name}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            fetchBuildings();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving building:", err);
            setFormError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin tòa nhà.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tòa nhà "${name}" không? Thao tác này không thể hoàn tác.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/buildings/${name}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBuildings();
        } catch (err) {
            console.error("Error deleting building:", err);
            alert(err.response?.data?.message || 'Không thể xóa tòa nhà. Có thể đang có phòng thuộc tòa nhà này.');
        }
    };

    const filteredBuildings = buildings.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && buildings.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang tải dữ liệu tòa nhà...</p>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Quản lý Tòa nhà</h2>
                    <p className="text-slate-500 text-base">Thiết lập danh sách các tòa nhà và đơn giá phòng ở mặc định.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal('add')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Thêm tòa nhà mới
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl mb-8 p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm tòa nhà theo tên hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <span>Tổng số: <span className="text-slate-900 font-bold">{filteredBuildings.length}</span> tòa nhà</span>
                </div>
            </div>

            {/* Building Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuildings.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Không tìm thấy tòa nhà nào phù hợp.</p>
                    </div>
                ) : (
                    filteredBuildings.map((building) => (
                        <div key={building.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="h-2 bg-blue-600 w-full"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenModal('edit', building)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(building.name)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{building.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-4">
                                    {building.description || 'Chưa có mô tả cho tòa nhà này.'}
                                </p>
                                
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giá phòng / Tháng</p>
                                        <p className="text-lg font-black text-blue-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(building.roomPrice)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-100 px-3 py-1 rounded-full">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">ID: {building.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">
                                {modalMode === 'add' ? 'Thêm tòa nhà mới' : `Chỉnh sửa: ${currentBuilding?.name}`}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100">
                                    {formError}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên tòa nhà</label>
                                <input 
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Tòa A"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giá phòng cơ bản (VNĐ/Tháng)</label>
                                <input 
                                    type="number"
                                    name="roomPrice"
                                    required
                                    value={formData.roomPrice}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 1200000"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả</label>
                                <textarea 
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Thông tin về đối tượng sinh viên, vị trí..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu thông tin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildingList;
