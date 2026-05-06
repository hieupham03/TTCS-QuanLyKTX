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
    const token = localStorage.getItem('token');
    
    // Check if token exists and has ADMIN role
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        if (decoded.scope !== 'ADMIN') {
            // Not an admin, redirect to student dashboard or home
            return <Navigate to="/student" replace />;
        }
    } catch (e) {
        console.error("Auth error in AdminLayout", e);
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
