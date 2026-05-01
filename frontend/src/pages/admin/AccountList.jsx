import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Filter, 
    ShieldCheck, 
    School, 
    Edit, 
    Lock, 
    Unlock,
    UserPlus,
    Download,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/accounts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccounts(response.data);
            setError('');
        } catch (err) {
            console.error("Error fetching accounts:", err);
            setError('Không thể tải danh sách tài khoản. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = account.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              account.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? (account.role?.roleName === roleFilter) : true;
        const matchesStatus = statusFilter === 'active' ? account.isActive : statusFilter === 'disabled' ? !account.isActive : true;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-on-surface-variant font-medium">Đang tải danh sách tài khoản...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8" />
                    <div>
                        <h3 className="font-bold text-lg">Đã xảy ra lỗi</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="mb-10">
                <h2 className="text-3xl leading-tight font-bold text-slate-900 tracking-tight mb-2">Quản lý Tài khoản</h2>
                <p className="text-slate-500 text-base">Quản lý quyền truy cập, vai trò và trạng thái hoạt động của hệ thống.</p>
            </div>

            {/* Toolbar / Filters */}
            <div className="bg-white rounded-lg mb-8 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm border border-slate-200">
                <div className="flex gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Tìm kiếm tài khoản..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
                        />
                    </div>

                    {/* Filter: Role */}
                    <select 
                        className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="ADMIN">Quản trị viên (Admin)</option>
                        <option value="STUDENT">Sinh viên (Student)</option>
                    </select>

                    {/* Filter: Status */}
                    <select 
                        className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="disabled">Bị khóa</option>
                    </select>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 bg-transparent text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                        <Download className="w-4 h-4" /> Xuất CSV
                    </button>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
                        <UserPlus className="w-4 h-4" /> Cấp tài khoản mới
                    </button>
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Người dùng hệ thống</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-200/50 px-2 py-1 rounded">
                        {filteredAccounts.length} Bản ghi
                    </span>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tên đăng nhập</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vai trò</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        Không tìm thấy tài khoản nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                paginatedAccounts.map((account) => (
                                    <tr key={account.id} className="bg-white hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0">
                                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                                            #{account.id}
                                        </td>
                                        <td className={`px-6 py-4 font-medium ${!account.isActive ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                            {account.username}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {account.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {account.role?.roleName === 'ADMIN' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Quản trị viên
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                                                    <School className="w-3.5 h-3.5" /> Sinh viên
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {account.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    Đang hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                    Bị khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {account.isActive ? (
                                                    <button className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="Khóa tài khoản">
                                                        <Lock className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button className="text-slate-400 hover:text-green-600 p-1.5 rounded hover:bg-green-50 transition-colors" title="Mở khóa tài khoản">
                                                        <Unlock className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Đang xem {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} trong tổng số {filteredAccounts.length} bản ghi
                        </span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded text-sm font-medium border ${
                                        currentPage === i + 1 
                                            ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                            : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountList;
