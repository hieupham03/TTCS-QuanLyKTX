import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ReceiptText, 
    Wrench, 
    User,
    LogOut,
    Building2,
    CalendarDays
} from 'lucide-react';

const StudentSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('studentCode');
        navigate('/login');
    };

    const navItems = [
        { path: '/student', icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển' },
        { path: '/student/register', icon: <CalendarDays size={20} />, label: 'Đăng ký phòng' },
        { path: '/student/invoices', icon: <ReceiptText size={20} />, label: 'Hóa đơn dịch vụ' },
        { path: '/student/repairs', icon: <Wrench size={20} />, label: 'Yêu cầu sửa chữa' },
        { path: '/student/profile', icon: <User size={20} />, label: 'Thông tin cá nhân' },
    ];

    return (
        <aside className="h-screen w-64 fixed left-0 top-0 pt-16 bg-white flex flex-col gap-1 p-4 font-body text-sm font-medium z-40 border-r border-slate-100">
            <div className="mb-6 px-2 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Building2 className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-lg font-black tracking-tighter text-slate-900 leading-none">ScholarStay</p>
                        <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mt-1">Cổng Sinh viên</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/student'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất tài khoản</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
