import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToAllUsers, subscribeToAllCompetencies, updateCompetencyStatus } from '../services/db';
import { useCompetencies } from '../context/CompetencyContext';
import { BarChart3, CheckCircle2, ArrowLeft, X, Check, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [allComps, setAllComps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSkillId, setSelectedSkillId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { competencies, loading: configLoading } = useCompetencies();

    useEffect(() => {
        const unsubUsers = subscribeToAllUsers(setUsers);
        const unsubComps = subscribeToAllCompetencies((data) => {
            setAllComps(data);
            setLoading(false);
        });
        return () => {
            unsubUsers();
            unsubComps();
        };
    }, []);

    const stats = useMemo(() => {
        const totalMembers = users.filter(u => u.role === 'member').length;
        const flattenedSkills = competencies.flatMap(cat => cat.skills.map(s => ({ ...s, level: cat.level })));

        const skillStats = flattenedSkills.map(skill => {
            const completions = allComps.filter(c => c.skillId === skill.id && c.status === 'Completed');
            return {
                ...skill,
                completions: completions.length,
                completionRate: totalMembers > 0 ? (completions.length / totalMembers) * 100 : 0,
                completedUserEmails: completions.map(c => c.userId),
                completionHistory: completions
                    .filter(c => c.timestamp)
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            };
        });

        return {
            totalMembers,
            skillStats,
            totalCompletions: allComps.filter(c => c.status === 'Completed').length
        };
    }, [users, allComps]);

    const handleToggleStatus = async (userEmail, skillId, currentStatus) => {
        setActionLoading(true);
        try {
            const newStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
            await updateCompetencyStatus(userEmail, skillId, newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setTimeout(() => setActionLoading(false), 200);
        }
    };

    if (loading || configLoading) {
        return (
            <div className="max-w-6xl mx-auto p-8 flex justify-center mt-20">
                <div className="text-xl font-bold uppercase tracking-widest text-gray-500 animate-pulse">Calculating Club Analytics...</div>
            </div>
        );
    }

    const selectedSkill = stats.skillStats.find(s => s.id === selectedSkillId);

    // Render detailed competency view
    if (selectedSkill) {
        const history = selectedSkill.completionHistory;
        const graphPoints = history.map((h, index) => ({
            x: new Date(h.timestamp).getTime(),
            y: index + 1
        }));

        const minX = graphPoints.length > 0 ? graphPoints[0].x : Date.now() - 30 * 24 * 60 * 60 * 1000;
        const maxX = Date.now();
        const minY = 0;
        const maxY = Math.max(stats.totalMembers, 5);

        const getXCoord = (val) => {
            if (maxX === minX) return 50;
            return ((val - minX) / (maxX - minX)) * 100;
        };
        const getYCoord = (val) => 100 - (val / maxY) * 100;

        const pathData = graphPoints.length > 0
            ? `M ${getXCoord(graphPoints[0].x)} ${getYCoord(graphPoints[0].y)} ` +
            graphPoints.slice(1).map(p => `L ${getXCoord(p.x)} ${getYCoord(p.y)}`).join(' ')
            : "";

        const completedMembers = users
            .filter(u => u.role === 'member' && selectedSkill.completedUserEmails.includes(u.email))
            .sort((a, b) => a.name.localeCompare(b.name));

        const remainingMembers = users
            .filter(u => u.role === 'member' && !selectedSkill.completedUserEmails.includes(u.email))
            .sort((a, b) => a.name.localeCompare(b.name));

        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in text-black">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={() => setSelectedSkillId(null)}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors mb-2"
                        >
                            <ArrowLeft size={16} /> Back to Overview
                        </button>
                        <h1 className="text-4xl font-black uppercase tracking-tight">{selectedSkill.name}</h1>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1">{selectedSkill.level}</p>
                    </div>
                    <button
                        onClick={() => setSelectedSkillId(null)}
                        className="p-2 border-2 border-black hover:bg-gray-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Timeline Graph - Small, decorative, full width */}
                    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-black uppercase tracking-widest opacity-40">Timeline</h2>
                        </div>
                        <div className="h-20 border-l border-b border-black relative overflow-hidden">
                            {/* Grid Background */}
                            <div className="absolute inset-0"
                                style={{
                                    backgroundImage: 'radial-gradient(#f0f0f0 1px, transparent 1px)',
                                    backgroundSize: '15px 15px'
                                }}
                            />

                            {graphPoints.length > 0 ? (
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible relative z-10">
                                    <path
                                        d={pathData}
                                        fill="none"
                                        stroke="#FFC107"
                                        strokeWidth="1.5"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {graphPoints.map((p, i) => (
                                        <rect
                                            key={i}
                                            x={getXCoord(p.x) - 0.5}
                                            y={getYCoord(p.y) - 2}
                                            width="1"
                                            height="4"
                                            fill="#FFC107"
                                        // Using rect with non-scaling coords or manual adjustment to prevent stretching
                                        // Using scale(1, h/w) logic or just keeping it very small
                                        />
                                    ))}
                                </svg>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-200 font-bold uppercase text-[10px] z-10">
                                    Decoration: No data
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Split View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Incomplete Column */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            <h3 className="text-lg font-black uppercase tracking-widest mb-4 border-b border-black pb-2 flex items-center justify-between">
                                Incomplete
                                <span className="text-xs opacity-40">{remainingMembers.length}</span>
                            </h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                <AnimatePresence mode="popLayout">
                                    {remainingMembers.map(member => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={member.email}
                                            className="flex items-center justify-between p-3 border border-gray-100 hover:border-black transition-colors"
                                        >
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{member.name}</p>
                                                <p className="text-[10px] uppercase font-black tracking-tighter opacity-40 leading-none">{member.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleStatus(member.email, selectedSkill.id, 'Not Started')}
                                                disabled={actionLoading}
                                                className="p-1.5 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-green-50 hover:bg-green-500 hover:text-white"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Complete Column */}
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            <h3 className="text-lg font-black uppercase tracking-widest mb-4 border-b border-black pb-2 flex items-center justify-between">
                                Completed
                                <span className="text-xs text-green-600 font-black">{completedMembers.length}</span>
                            </h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                <AnimatePresence mode="popLayout">
                                    {completedMembers.map(member => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={member.email}
                                            className="flex items-center justify-between p-3 border border-black bg-gray-50"
                                        >
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{member.name}</p>
                                                <p className="text-[10px] uppercase font-black tracking-tighter opacity-40 leading-none">{member.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleStatus(member.email, selectedSkill.id, 'Completed')}
                                                disabled={actionLoading}
                                                className="p-1.5 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-white hover:bg-red-500 hover:text-white"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in text-black">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors mb-2"
                    >
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <h1 className="text-4xl font-black uppercase tracking-tight">Club Analytics</h1>
                </div>

                <div className="flex gap-4">
                    <div className="bg-black text-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(255,193,7,1)]">
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Total Members</p>
                        <p className="text-2xl font-black">{stats.totalMembers}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <section className="bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 mb-8">
                        <BarChart3 className="text-accent" />
                        <h2 className="text-2xl font-black uppercase tracking-wider">All Competencies</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {stats.skillStats.map(skill => (
                            <div key={skill.id} className="space-y-2 group cursor-pointer" onClick={() => setSelectedSkillId(skill.id)}>
                                <div className="flex justify-between items-end gap-4">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-accent transition-colors truncate">{skill.level}</span>
                                        <span className="text-sm font-bold uppercase tracking-wider group-hover:underline truncate">{skill.name}</span>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest opacity-60 flex-shrink-0 whitespace-nowrap">{skill.completions} / {stats.totalMembers}</span>
                                </div>
                                <div className="h-5 bg-gray-100 border-2 border-black relative overflow-hidden shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] group-hover:shadow-[4px_4px_0_0_rgba(255,193,7,1)] transition-all">
                                    <div
                                        className="h-full bg-accent border-r-2 border-black transition-all duration-1000 ease-out"
                                        style={{ width: `${skill.completionRate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminAnalytics;
