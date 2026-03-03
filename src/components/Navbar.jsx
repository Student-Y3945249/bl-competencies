import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Snowfall from './Snowfall';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { onSnapshot, doc } from 'firebase/firestore';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);
    const [isSnowing, setIsSnowing] = useState(false);

    useEffect(() => {
        // Listen to a dummy doc or just general connectivity via the Firestore SDK metadata
        // For a more robust check on restricted networks, we'll monitor the snapshot metadata
        const unsub = onSnapshot(doc(db, '_internal_', 'connectivity'), { includeMetadataChanges: true }, (doc) => {
            setIsOnline(!doc.metadata.fromCache);
        }, (err) => {
            // If we get an error, we might be offline
            if (err.code === 'unavailable') setIsOnline(false);
        });
        return () => unsub();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!currentUser) return null;

    return (
        <>
            {isSnowing && <Snowfall />}
            <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 sm:h-20 items-center">
                        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
                            <div className="bg-black p-1.5 transition-transform group-hover:rotate-12 shadow-[3px_3px_0_0_#FFC107] border-2 border-black">
                                <Logo className="w-8 h-8 sm:w-10 h-10" invert={true} />
                            </div>
                            <span className="font-bold text-lg sm:text-xl uppercase tracking-[0.15em] hidden xs:block">Ben Lairig</span>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-6">
                            <div className={`flex items-center gap-1.5 px-2 py-1 border border-black text-[10px] items-center font-bold uppercase tracking-wider ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                                {isOnline ? 'Cloud Live' : 'Offline Syncing'}
                            </div>
                            {currentUser && (
                                <div
                                    className="text-right hidden md:block select-none"
                                    onDoubleClick={() => setIsSnowing(!isSnowing)}
                                >
                                    <p className="text-sm font-bold">{currentUser.displayName}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{currentUser.role}</p>
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-black hover:bg-black hover:text-white transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
