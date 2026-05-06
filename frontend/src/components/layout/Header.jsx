import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const Header = () => {
    const [userData, setUserData] = useState({ name: 'Người dùng', role: 'Thành viên' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const decoded = JSON.parse(jsonPayload);
                setUserData({
                    name: decoded.sub || 'Người dùng',
                    role: decoded.scope === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'
                });
            } catch (e) {
                console.error("Error decoding token in Header", e);
            }
        }
    }, []);

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center h-16 px-6 shadow-sm">
            <div className="flex items-center gap-8">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-headline">PTIT - KTX</span>
                
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{userData.name}</p>
                        <p className="text-xs text-slate-500">{userData.role}</p>
                    </div>
                    <img 
                        alt="User Avatar" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/10" 
                        src={`https://ui-avatars.com/api/?name=${userData.name}&background=0D8ABC&color=fff`}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
