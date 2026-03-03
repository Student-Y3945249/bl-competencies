import React, { useState } from 'react';
import { useCompetencies } from '../context/CompetencyContext';
import { addCategory, updateCategory, deleteCategory } from '../services/db';
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageCompetencies = () => {
    const navigate = useNavigate();
    const { competencies, loading } = useCompetencies();
    const [editingCatId, setEditingCatId] = useState(null);
    const [editData, setEditData] = useState(null);

    const handleStartEdit = (cat) => {
        setEditingCatId(cat.id);
        setEditData({ ...cat });
    };

    const handleCancelEdit = () => {
        setEditingCatId(null);
        setEditData(null);
    };

    const handleSaveEdit = async () => {
        try {
            await updateCategory(editingCatId, editData);
            setEditingCatId(null);
            setEditData(null);
        } catch (err) {
            alert("Failed to save: " + err.message);
        }
    };

    const handleAddSkill = () => {
        const newSkill = {
            id: `skill-${Date.now()}`,
            name: 'New Skill'
        };
        setEditData({
            ...editData,
            skills: [...editData.skills, newSkill]
        });
    };

    const handleUpdateSkill = (skillId, name) => {
        setEditData({
            ...editData,
            skills: editData.skills.map(s => s.id === skillId ? { ...s, name } : s)
        });
    };

    const handleRemoveSkill = (skillId) => {
        setEditData({
            ...editData,
            skills: editData.skills.filter(s => s.id !== skillId)
        });
    };

    const handleAddNewCategory = async () => {
        const id = `cat-${Date.now()}`;
        const newCat = {
            id,
            level: 'New Level Title',
            skills: []
        };
        await addCategory(newCat);
        handleStartEdit(newCat);
    };

    const handleDeleteCat = async (catId) => {
        if (window.confirm("Are you sure? This will remove the category from all views. (Historical completions will remain in DB but hidden)")) {
            await deleteCategory(catId);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-20 text-center uppercase font-black tracking-widest animate-pulse">
                Loading Configuration...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in text-black">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors mb-2"
                >
                    <ArrowLeft size={16} /> Dashboard
                </button>
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-black uppercase tracking-tight">Competency Manager</h1>
                    <button
                        onClick={handleAddNewCategory}
                        className="btn bg-accent text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <Plus size={18} /> New Level
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {competencies.map(cat => (
                    <div key={cat.id} className="bg-white border-2 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative group">
                        {editingCatId === cat.id ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest opacity-50 mb-1">Level Title</label>
                                    <input
                                        className="w-full border-2 border-black p-2 font-bold text-xl uppercase focus:outline-none focus:bg-yellow-50"
                                        value={editData.level}
                                        onChange={(e) => setEditData({ ...editData, level: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] uppercase font-black tracking-widest opacity-50">Skills</label>
                                    {editData.skills.map(skill => (
                                        <div key={skill.id} className="flex gap-2">
                                            <input
                                                className="flex-1 border border-black p-2 text-sm font-medium focus:outline-none focus:border-accent"
                                                value={skill.name}
                                                onChange={(e) => handleUpdateSkill(skill.id, e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleRemoveSkill(skill.id)}
                                                className="p-2 border border-black hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleAddSkill}
                                        className="w-full border-2 border-dashed border-gray-300 p-2 text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-gray-50 transition-all flex justify-center items-center gap-2"
                                    >
                                        <Plus size={14} /> Add Skill
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button onClick={handleCancelEdit} className="text-xs font-bold uppercase tracking-widest hover:underline">Cancel</button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="btn bg-green-500 text-white text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black uppercase tracking-wider mb-4 border-b-2 border-black inline-block pb-1">{cat.level}</h3>
                                    <ul className="space-y-2">
                                        {cat.skills.map(s => (
                                            <li key={s.id} className="flex items-center gap-2 text-sm font-medium">
                                                <div className="w-1.5 h-1.5 bg-accent" /> {s.name}
                                            </li>
                                        ))}
                                        {cat.skills.length === 0 && <li className="text-xs text-gray-400 italic">No skills in this category.</li>}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleStartEdit(cat)}
                                        className="p-2 border border-black hover:bg-accent transition-colors"
                                        title="Edit Level"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCat(cat.id)}
                                        className="p-2 border border-black hover:bg-red-500 hover:text-white transition-colors"
                                        title="Delete Level"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageCompetencies;
