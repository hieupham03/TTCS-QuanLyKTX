import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Building2, 
    DoorOpen,
    CalendarDays,
    ClipboardList, 
    ReceiptText, 
    Wrench, 
    Settings, 
    LogOut 
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển' },
        { path: '/admin/accounts', icon: <Users size={20} />, label: 'Quản lý Tài khoản' },
        { path: '/admin/students', icon: <Users size={20} />, label: 'Quản lý Sinh viên' },
        { path: '/admin/buildings', icon: <Building2 size={20} />, label: 'Quản lý Tòa nhà' },
        { path: '/admin/rooms', icon: <DoorOpen size={20} />, label: 'Quản lý Phòng' },
        { path: '/admin/registration-periods', icon: <CalendarDays size={20} />, label: 'Đợt đăng ký KTX' },
        { path: '/admin/registrations', icon: <ClipboardList size={20} />, label: 'Duyệt đơn đăng ký' },
        { path: '/admin/invoices', icon: <ReceiptText size={20} />, label: 'Hóa đơn & Dịch vụ' },
        { path: '/admin/repairs', icon: <Wrench size={20} />, label: 'Yêu cầu sửa chữa' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cài đặt' },
    ];

    return (
        <aside className="h-screen w-64 fixed left-0 top-0 pt-16 bg-slate-50 flex flex-col gap-1 p-4 font-body text-sm font-medium z-40 border-r border-slate-200">
            <div className="mb-6 px-2 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                        <Building2 className="text-white" size={18} />
                    </div>
                    <div>
                        <p className="text-lg font-black tracking-tighter text-blue-700 leading-none">PTIT - KTX</p>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Cổng Quản trị</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                isActive
                                    ? 'bg-white text-blue-600 border-r-4 border-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container/20 transition-all"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
