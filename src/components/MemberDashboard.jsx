import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompetencies } from '../context/CompetencyContext';
import { subscribeToUserCompetencies, requestVerification } from '../services/db';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const StatusIcon = ({ status }) => {
    if (status === 'Completed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'Pending Verification') return <Clock className="w-5 h-5 text-accent" />;
    return <PlayCircle className="w-5 h-5 text-gray-300" />;
};

const StatusBadge = ({ status }) => {
    if (status === 'Completed') return <span className="badge badge-completed">Completed</span>;
    if (status === 'Pending Verification') return <span className="badge badge-pending">Pending</span>;
    return <span className="badge badge-not-started text-gray-500">Not Started</span>;
};

const MemberDashboard = () => {
    const { currentUser } = useAuth();
    const { competencies, loading: configLoading } = useCompetencies();
    const [compData, setCompData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = subscribeToUserCompetencies(currentUser.email, (comps) => {
            const data = {};
            comps.forEach(c => {
                data[c.skillId] = c;
            });
            setCompData(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleRequest = async (skillId) => {
        try {
            await requestVerification(currentUser.email, skillId);
        } catch (err) {
            console.error("Failed to request verification", err);
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

    if (loading || configLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in flex justify-center mt-20">
                <div className="text-xl font-bold uppercase tracking-widest text-gray-500 animate-pulse">Syncing Skills...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in text-black bg-transparent">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl uppercase mb-2">My Competencies</h1>
                <p className="text-gray-600 font-medium tracking-wide">Track your skills and request verification from the committee.</p>
            </div>

            <div className="space-y-8">
                {competencies.map((category, idx) => (
                    <div
                        key={category.id}
                        className="competency-block transition-transform duration-300"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <h2 className="text-xl sm:text-2xl uppercase mb-6 border-b-2 border-black pb-2">{category.level}</h2>

                        <div className="space-y-4">
                            {category.skills.map(skill => {
                                const comp = compData[skill.id];
                                const status = comp?.status || 'Not Started';
                                const canRequest = status === 'Not Started';

                                return (
                                    <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 hover:border-black transition-colors bg-gray-50/50">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1 flex-shrink-0">
                                                <StatusIcon status={status} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-base sm:text-lg mb-1">{skill.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={status} />
                                                    {status === 'Completed' && comp?.timestamp && (
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                                                            • {formatDate(comp.timestamp)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 self-start sm:self-center">
                                            <button
                                                onClick={() => handleRequest(skill.id)}
                                                disabled={!canRequest}
                                                className={`w-full sm:w-auto px-4 py-2 font-bold text-sm tracking-wide transition-all border border-black ${canRequest
                                                    ? 'bg-white hover:bg-black hover:text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                                                    : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed hidden sm:block opacity-0'
                                                    }`}
                                                style={{ display: canRequest ? 'block' : 'none' }}
                                            >
                                                Request Verification
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemberDashboard;
