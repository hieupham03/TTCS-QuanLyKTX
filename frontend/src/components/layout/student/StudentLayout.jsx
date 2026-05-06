import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import Header from '../Header'; // Reusing the same header for consistency

const StudentLayout = () => {
    const token = localStorage.getItem('token');
    
    // Redirect to login if no token
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
        if (decoded.scope !== 'STUDENT') {
            // Not a student, redirect to admin or home
            return <Navigate to="/admin" replace />;
        }
    } catch (e) {
        console.error("Auth error in StudentLayout", e);
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-[#F8FAFC] font-body text-slate-900 antialiased min-h-screen">
            <Header />
            
            <div className="flex">
                <StudentSidebar />
                
                {/* Main Content Area */}
                <main className="flex-1 lg:ml-64 pt-16 min-h-screen pb-20 lg:pb-0">
                    <div className="p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Navigation (Optional, can be added later if needed) */}
        </div>
    );
};

export default StudentLayout;
