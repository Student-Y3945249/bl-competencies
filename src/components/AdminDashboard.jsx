import React, { useState, useEffect } from 'react';
import { subscribeToPendingRequests, updateCompetencyStatus, subscribeToAllUsers } from '../services/db';
import { useCompetencies } from '../context/CompetencyContext';
import { Search, CheckCircle2, XCircle, BarChart3, Settings } from 'lucide-react';
import UserProfileView from './UserProfileView';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingReqs, setLoadingReqs] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const unsubUsers = subscribeToAllUsers((fetchedUsers) => {
            setUsers(fetchedUsers);
            setLoadingUsers(false);
        });

        const unsubReqs = subscribeToPendingRequests((fetchedReqs) => {
            setRequests(fetchedReqs);
            setLoadingReqs(false);
        });

        return () => {
            unsubUsers();
            unsubReqs();
        };
    }, []);

    const handleAction = async (userId, skillId, newStatus) => {
        setActionLoading(true);
        try {
            await updateCompetencyStatus(userId, skillId, newStatus);
        } catch (err) {
            console.error("Action failed", err);
        } finally {
            setActionLoading(false);
        }
    };

    const { competencies } = useCompetencies();

    const getSkillName = (skillId) => {
        for (const cat of competencies) {
            const skill = cat.skills.find(s => s.id === skillId);
            if (skill) return skill.name;
        }
        return skillId;
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl uppercase mb-2">Committee Admin</h1>
                    <p className="text-gray-600 font-medium tracking-wide">Manage verification requests and member competencies.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/admin/competencies"
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_rgba(255,193,7,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap"
                    >
                        <Settings size={20} />
                        Manage Skills
                    </Link>
                    <Link
                        to="/admin/analytics"
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_rgba(255,193,7,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap"
                    >
                        <BarChart3 size={20} />
                        View Club Analytics
                    </Link>
                </div>
            </div>

            {(loadingUsers || loadingReqs) ? (
                <div className="text-center font-bold text-xl uppercase mt-20 tracking-widest text-gray-400 animate-pulse">Syncing Directory...</div>
            ) : (
                <>
                    <div className="mb-12 animate-fade-in">
                        <h2 className="text-2xl uppercase mb-6 flex items-center gap-3">
                            Action Required <span className="bg-accent text-black text-sm px-3 py-1 font-bold rounded-full">{requests.length}</span>
                        </h2>

                        {requests.length === 0 ? (
                            <div className="competency-block bg-white/80 border-2 border-black text-center py-10 shadow-crisp">
                                <p className="text-gray-500 font-medium text-lg tracking-wide">No pending verification requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req, idx) => {
                                    const userObj = users.find(u => u.email === req.userId);
                                    const userName = userObj ? userObj.name : req.userId;
                                    return (
                                        <div key={`${req.userId}-${req.skillId}`} className="competency-block border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-crisp">
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 mb-1">{userName} ({req.userId})</p>
                                                <p className="font-semibold text-lg">{getSkillName(req.skillId)}</p>
                                            </div>
                                            <div className="flex gap-3 mt-4 md:mt-0">
                                                <button
                                                    onClick={() => handleAction(req.userId, req.skillId, 'Completed')}
                                                    disabled={actionLoading}
                                                    className="btn bg-green-400 border-black hover:bg-green-500 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-[2px]"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.userId, req.skillId, 'Not Started')}
                                                    disabled={actionLoading}
                                                    className="btn bg-red-400 border-black hover:bg-red-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-[2px]"
                                                >
                                                    <XCircle className="w-5 h-5" /> Deny
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-2xl uppercase mb-6">Member Directory</h2>
                        <div className="mb-6 relative">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search members by name or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full border-2 border-black p-3 pl-10 focus:outline-none focus:border-accent text-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map(user => (
                                <div key={user.email} className="competency-block h-full flex flex-col">
                                    <h3 className="text-xl font-bold mb-1">{user.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                                    <div className="mt-auto">
                                        <p className="text-sm font-semibold uppercase tracking-wider mb-2">Role: {user.role}</p>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="btn w-full bg-white border-black text-sm relative group overflow-hidden"
                                            >
                                                <span className="relative z-10 transition-colors group-hover:text-white">View Profile</span>
                                                <div className="absolute inset-0 h-full w-full bg-black -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {selectedUser && (
                <UserProfileView
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
