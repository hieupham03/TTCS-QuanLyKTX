import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = () => {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center h-16 px-6 shadow-sm">
            <div className="flex items-center gap-8">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-headline">PTIT - KTX</span>
                
                <div className="hidden md:flex items-center bg-surface-container-highest px-4 py-2 rounded-lg gap-3 w-80">
                    <Search className="text-outline" size={20} />
                    <input 
                        className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 outline-none placeholder:text-outline-variant" 
                        placeholder="Tìm kiếm bản ghi..." 
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-on-surface leading-tight">Admin User</p>
                        <p className="text-xs text-on-surface-variant">Quản trị viên Hệ thống</p>
                    </div>
                    <img 
                        alt="User Avatar" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/10" 
                        src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
