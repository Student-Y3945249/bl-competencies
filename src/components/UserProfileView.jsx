import React, { useState, useEffect } from 'react';
import { subscribeToUserCompetencies, updateCompetencyStatus } from '../services/db';
import { useCompetencies } from '../context/CompetencyContext';
import { CheckCircle2, Clock, PlayCircle, X, Check, RotateCcw } from 'lucide-react';

const StatusIcon = ({ status }) => {
    if (status === 'Completed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'Pending Verification') return <Clock className="w-5 h-5 text-accent" />;
    return <PlayCircle className="w-5 h-5 text-gray-300" />;
};

const UserProfileView = ({ user, onClose }) => {
    const [compData, setCompData] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { competencies, loading: configLoading } = useCompetencies();

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToUserCompetencies(user.email, (comps) => {
            const data = {};
            comps.forEach(c => {
                data[c.skillId] = c;
            });
            setCompData(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleToggleStatus = async (skillId, currentStatus) => {
        setActionLoading(true);
        try {
            const newStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
            await updateCompetencyStatus(user.email, skillId, newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setActionLoading(true);
            setTimeout(() => setActionLoading(false), 500);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-black">
            <div className="bg-white border-2 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative p-6 sm:p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-black"
                >
                    <X size={24} />
                </button>

                <div className="mb-8 mt-4">
                    <h2 className="text-3xl uppercase font-bold mb-1 tracking-tight">{user.name}</h2>
                    <p className="text-gray-500 font-medium tracking-wide">{user.email} • {user.role.toUpperCase()}</p>
                </div>

                {loading || configLoading ? (
                    <div className="text-center py-20 font-bold uppercase tracking-widest text-gray-400 animate-pulse">Syncing Profile Data...</div>
                ) : (
                    <div className="space-y-8">
                        {competencies.map((category) => (
                            <div key={category.id} className="border-t-2 border-black pt-6">
                                <h3 className="text-xl uppercase font-extrabold mb-6 tracking-wider">{category.level}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {category.skills.map(skill => {
                                        const comp = compData[skill.id];
                                        const status = comp?.status || 'Not Started';

                                        return (
                                            <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 bg-gray-50/30 hover:border-black transition-colors">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1">
                                                        <StatusIcon status={status} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-base sm:text-lg leading-tight mb-1">{skill.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-[10px] uppercase font-black tracking-tighter ${status === 'Completed' ? 'text-green-600' :
                                                                status === 'Pending Verification' ? 'text-amber-500' : 'text-gray-400'
                                                                }`}>
                                                                {status}
                                                            </p>
                                                            {status === 'Completed' && comp?.timestamp && (
                                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                                                                    • Completed {formatDate(comp.timestamp)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => handleToggleStatus(skill.id, status)}
                                                        disabled={actionLoading}
                                                        className={`btn flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${status === 'Completed'
                                                            ? 'bg-gray-100 hover:bg-black hover:text-white'
                                                            : 'bg-accent hover:bg-black hover:text-white'
                                                            }`}
                                                    >
                                                        {status === 'Completed' ? (
                                                            <><RotateCcw size={14} /> Uncomplete</>
                                                        ) : (
                                                            <><Check size={14} /> Mark Complete</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileView;
