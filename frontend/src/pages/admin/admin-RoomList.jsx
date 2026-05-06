import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Building2, 
    DoorOpen,
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Loader2, 
    AlertTriangle,
    X,
    CheckCircle2,
    Users,
    Wrench,
    Filter,
    ChevronDown,
    Calendar,
    Eye,
    Info
} from 'lucide-react';

const RoomList = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'detail'
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomResidents, setRoomResidents] = useState([]);
    const [roomRepairs, setRoomRepairs] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: '',
        capacity: '',
        roomGender: 'MALE',
        status: 'AVAILABLE'
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
            if (response.data.length > 0) {
                setSelectedBuilding(response.data[0]);
            }
            setError('');
        } catch (err) {
            console.error("Error fetching buildings:", err);
            setError('Không thể tải danh sách tòa nhà.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = useCallback(async (buildingName) => {
        if (!buildingName) return;
        setRoomsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/rooms/building/${buildingName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data);
        } catch (err) {
            console.error("Error fetching rooms:", err);
            setError('Không thể tải danh sách phòng.');
        } finally {
            setRoomsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedBuilding) {
            fetchRooms(selectedBuilding.name);
        }
    }, [selectedBuilding, fetchRooms]);

    const handleOpenModal = (mode, room = null) => {
        setModalMode(mode);
        setFormError('');
        if (mode === 'edit' && room) {
            setCurrentRoom(room);
            setFormData({
                roomNumber: room.roomNumber,
                capacity: room.capacity.toString(),
                roomGender: room.roomGender,
                status: room.status
            });
        } else if (mode === 'detail' && room) {
            setCurrentRoom(room);
            fetchRoomDetails(room.id);
        } else {
            setCurrentRoom(null);
            setFormData({
                roomNumber: '',
                capacity: '4',
                roomGender: 'MALE',
                status: 'AVAILABLE'
            });
        }
        setIsModalOpen(true);
    };

    const fetchRoomDetails = async (roomId) => {
        setDetailLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [residentsRes, repairsRes] = await Promise.all([
                axios.get(`/api/contracts/room/${roomId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/repair-requests`, { headers: { Authorization: `Bearer ${token}` } }) // Sẽ filter sau nếu không có endpoint room-specific
            ]);
            
            // Lọc sinh viên có hợp đồng ACTIVE
            setRoomResidents(residentsRes.data.filter(c => c.status === 'ACTIVE'));
            
            // Lọc yêu cầu sửa chữa của phòng này (Backend RepairRequestService có findByRoomId nhưng Controller có thể chưa expose, tôi sẽ filter local để an toàn)
            setRoomRepairs(repairsRes.data.filter(r => r.room?.id === roomId).slice(0, 5));
        } catch (err) {
            console.error("Error fetching room details:", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
                capacity: parseInt(formData.capacity),
                building: {
                    name: selectedBuilding.name
                }
            };

            if (modalMode === 'add') {
                await axios.post('/api/rooms', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`/api/rooms/number/${currentRoom.roomNumber}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            fetchRooms(selectedBuilding.name);
            handleCloseModal();
        } catch (err) {
            console.error("Error saving room:", err);
            setFormError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin phòng.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (room) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ${room.roomNumber} không?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/rooms/${room.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRooms(selectedBuilding.name);
        } catch (err) {
            console.error("Error deleting room:", err);
            alert(err.response?.data?.message || 'Không thể xóa phòng.');
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender = genderFilter === 'ALL' || room.roomGender === genderFilter;
        const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;
        return matchesSearch && matchesGender && matchesStatus;
    });

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang chuẩn bị dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Quản trị Hệ thống</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">• Quản lý Phòng ở</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                        {selectedBuilding ? `Tòa nhà ${selectedBuilding.name}` : 'Chọn Tòa nhà'}
                    </h1>
                    {selectedBuilding && (
                        <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                            {selectedBuilding.description || 'Chưa có mô tả tòa nhà.'}
                            <span className="block mt-1 font-semibold text-blue-600">Giá cơ sở: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBuilding.roomPrice)}</span>
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleOpenModal('add')}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Thêm phòng mới
                    </button>
                </div>
            </div>

            {/* Building Selection Tabs */}
            <div className="mb-10 flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                {buildings.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => setSelectedBuilding(b)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                            selectedBuilding?.id === b.id 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:bg-white/50'
                        }`}
                    >
                        <Building2 className={`w-4 h-4 ${selectedBuilding?.id === b.id ? 'fill-blue-600/10' : ''}`} />
                        {b.name}
                    </button>
                ))}
            </div>

            {/* Filters & Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-8 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Tìm số phòng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                    
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</span>
                        <div className="flex gap-1.5 mt-1">
                            {['ALL', 'AVAILABLE', 'FULL', 'MAINTENANCE'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                        statusFilter === s 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {s === 'ALL' ? 'Tất cả' : s === 'AVAILABLE' ? 'Còn trống' : s === 'FULL' ? 'Đã đầy' : 'Bảo trì'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đối tượng</span>
                        <div className="flex gap-4 mt-1">
                            <button 
                                onClick={() => setGenderFilter(genderFilter === 'MALE' ? 'ALL' : 'MALE')}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${genderFilter === 'MALE' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                            >
                                <Users className={`w-4 h-4 ${genderFilter === 'MALE' ? 'fill-blue-600/10' : ''}`} /> NAM
                            </button>
                            <button 
                                onClick={() => setGenderFilter(genderFilter === 'FEMALE' ? 'ALL' : 'FEMALE')}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${genderFilter === 'FEMALE' ? 'text-pink-600' : 'text-slate-400 hover:text-pink-600'}`}
                            >
                                <Users className={`w-4 h-4 ${genderFilter === 'FEMALE' ? 'fill-pink-600/10' : ''}`} /> NỮ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Utilization Card */}
                <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-xl shadow-blue-600/20 flex flex-col justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Tỷ lệ lấp đầy</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-3xl font-black">
                                {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'FULL').length / rooms.length) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] mt-2 opacity-70 relative z-10">
                        {rooms.filter(r => r.status === 'FULL').length} / {rooms.length} phòng đã đầy
                    </p>
                    <Building2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Room Grid */}
            {roomsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500">Đang tải danh sách phòng...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                            <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Không tìm thấy phòng nào.</p>
                        </div>
                    ) : (
                        filteredRooms.map((room) => (
                            <div key={room.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col">
                                <div className={`h-1.5 w-full ${
                                    room.status === 'AVAILABLE' ? 'bg-green-500' : 
                                    room.status === 'FULL' ? 'bg-slate-400' : 'bg-red-500'
                                }`}></div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">P.{room.roomNumber}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Users className={`w-3.5 h-3.5 ${room.roomGender === 'MALE' ? 'text-blue-500' : 'text-pink-500'}`} />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {room.roomGender === 'MALE' ? 'NAM' : 'NỮ'} • {selectedBuilding.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                            room.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-100' :
                                            room.status === 'FULL' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                            'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {room.status === 'AVAILABLE' ? 'Còn trống' : room.status === 'FULL' ? 'Đã đầy' : 'Bảo trì'}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sức chứa</span>
                                                <span className="text-xs font-black text-slate-900">{room.capacity} người</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${room.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-slate-400'}`} 
                                                    style={{ width: `${room.status === 'FULL' ? 100 : 50}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => handleOpenModal('detail', room)}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-bold hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Xem
                                        </button>
                                        <button 
                                            onClick={() => handleOpenModal('edit', room)}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Sửa
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(room)}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-bold hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    {modalMode === 'detail' ? (
                        <div className="bg-white rounded-[2rem] w-full max-w-6xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Detail Header */}
                            <div className="px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/30 gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase bg-blue-100/50 px-2.5 py-1 rounded-lg">Tòa {selectedBuilding?.name}</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-sm border ${
                                            currentRoom?.status === 'AVAILABLE' ? 'bg-white text-green-600 border-green-100' : 'bg-white text-red-600 border-red-100'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${currentRoom?.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {currentRoom?.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Bảo trì'}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter text-slate-900">Phòng {currentRoom?.roomNumber}</h2>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setModalMode('edit')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all">Sửa thông tin</button>
                                    <button onClick={handleCloseModal} className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all">Đóng cửa sổ</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 bg-white">
                                {detailLoading ? (
                                    <div className="py-20 flex flex-col items-center">
                                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang truy xuất dữ liệu phòng...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column */}
                                        <div className="lg:col-span-1 space-y-8">
                                            {/* Room Info */}
                                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Info size={16} className="text-blue-600" /> Thông số phòng
                                                </h3>
                                                <div className="space-y-5">
                                                    {[
                                                        ['Sức chứa', `${currentRoom?.capacity} sinh viên`],
                                                        ['Đối tượng', currentRoom?.roomGender === 'MALE' ? 'Nam' : 'Nữ'],
                                                        ['Đơn giá', `${new Intl.NumberFormat('vi-VN').format(selectedBuilding?.roomPrice || 0)} VNĐ/tháng`],
                                                        ['Hiện tại', `${roomResidents.length} / ${currentRoom?.capacity}`]
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="flex justify-between items-center pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                                            <span className="text-sm font-black text-slate-900">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Maintenance Tickets */}
                                            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
                                                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Phiếu sửa chữa gần đây</h3>
                                                    <Wrench size={16} className="text-slate-400" />
                                                </div>
                                                <div className="p-4 space-y-3 flex-1">
                                                    {roomRepairs.length === 0 ? (
                                                        <div className="py-12 flex flex-col items-center justify-center grayscale opacity-30">
                                                            <Wrench size={40} className="mb-2" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest">Không có yêu cầu</p>
                                                        </div>
                                                    ) : (
                                                        roomRepairs.map(repair => (
                                                            <div key={repair.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                                                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{repair.description}</p>
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                        #{repair.id} • {new Date(repair.createdAt).toLocaleDateString('vi-VN')}
                                                                    </p>
                                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                                        repair.status === 'DONE' ? 'bg-green-100 text-green-700' : 
                                                                        repair.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                        {repair.status === 'DONE' ? 'Hoàn thành' : repair.status === 'IN_PROGRESS' ? 'Đang sửa' : 'Chờ xử lý'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Current Residents */}
                                            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                                                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Danh sách Sinh viên đang ở</h3>
                                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                                                        {roomResidents.length} / {currentRoom?.capacity} Chỗ
                                                    </span>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr>
                                                                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã sinh viên</th>
                                                                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</th>
                                                                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lớp sinh hoạt</th>
                                                                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-sm divide-y divide-slate-50">
                                                            {roomResidents.map(res => (
                                                                <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                                                                    <td className="py-4 px-8 font-mono text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">{res.student?.studentCode}</td>
                                                                    <td className="py-4 px-8 font-bold text-slate-900">{res.student?.fullName}</td>
                                                                    <td className="py-4 px-8 text-slate-500 font-medium">{res.student?.className}</td>
                                                                    <td className="py-4 px-8">
                                                                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center w-fit gap-1.5">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                            Đang ở
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {roomResidents.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="4" className="py-20 text-center">
                                                                        <div className="grayscale opacity-20 mb-2 flex justify-center"><Users size={48} /></div>
                                                                        <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">Phòng này hiện đang trống</p>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Note Card */}
                                            <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100 flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 flex-shrink-0">
                                                    <Info size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-1">Ghi chú vận hành</h4>
                                                    <p className="text-sm text-blue-700 leading-relaxed">
                                                        Thông tin sinh viên và phiếu sửa chữa được trích xuất trực tiếp từ hồ sơ hợp đồng và hệ thống bảo trì. 
                                                        Khi sinh viên trả phòng hoặc hợp đồng hết hạn, danh sách sẽ tự động cập nhật.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                        {modalMode === 'add' ? 'Thêm phòng mới' : `Chỉnh sửa P.${currentRoom?.roomNumber}`}
                                    </h3>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Tòa {selectedBuilding.name}</p>
                                </div>
                                <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                {formError && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] font-bold border border-red-100 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        {formError}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số phòng</label>
                                        <input 
                                            type="text"
                                            name="roomNumber"
                                            required
                                            value={formData.roomNumber}
                                            onChange={handleInputChange}
                                            placeholder="Ví dụ: 101"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 placeholder:font-normal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sức chứa (người)</label>
                                        <input 
                                            type="number"
                                            name="capacity"
                                            required
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giới tính</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, roomGender: 'MALE'}))}
                                            className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                                                formData.roomGender === 'MALE' 
                                                ? 'bg-blue-50 border-blue-600 text-blue-600' 
                                                : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            NAM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, roomGender: 'FEMALE'}))}
                                            className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                                                formData.roomGender === 'FEMALE' 
                                                ? 'bg-pink-50 border-pink-600 text-pink-600' 
                                                : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            NỮ
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Trạng thái vận hành</label>
                                    <select 
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                                    >
                                        <option value="AVAILABLE">Đang hoạt động (Sẵn sàng)</option>
                                        <option value="MAINTENANCE">Đang bảo trì / Sửa chữa</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu dữ liệu phòng'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomList;
