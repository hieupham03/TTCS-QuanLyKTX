import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
    LayoutDashboard, 
    Users, 
    Building2, 
    Menu 
} from 'lucide-react';

const AdminLayout = () => {
    // Basic authentication check (can be improved later)
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
            <Header />
            
            <div className="flex">
                <Sidebar />
                
                {/* Main Content Area */}
                <main className="flex-1 lg:ml-64 pt-16 min-h-screen pb-20 lg:pb-0">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Navigation Shell */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 px-4 z-50">
                <a className="flex flex-col items-center text-primary" href="#">
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] font-bold uppercase mt-1">Trang chủ</span>
                </a>
                <a className="flex flex-col items-center text-slate-400 hover:text-primary transition-colors" href="#">
                    <Users size={24} />
                    <span className="text-[10px] font-bold uppercase mt-1">Sinh viên</span>
                </a>
                <a className="flex flex-col items-center text-slate-400 hover:text-primary transition-colors" href="#">
                    <Building2 size={24} />
                    <span className="text-[10px] font-bold uppercase mt-1">Ký túc xá</span>
                </a>
                <button className="flex flex-col items-center text-slate-400 hover:text-primary transition-colors">
                    <Menu size={24} />
                    <span className="text-[10px] font-bold uppercase mt-1">Menu</span>
                </button>
            </div>
        </div>
    );
};

export default AdminLayout;
