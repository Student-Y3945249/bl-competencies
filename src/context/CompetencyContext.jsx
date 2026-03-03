import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToCompetencyConfig, initializeCompetencies } from '../services/db';

const CompetencyContext = createContext();

export const useCompetencies = () => useContext(CompetencyContext);

export const CompetencyProvider = ({ children }) => {
    const [competencies, setCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await initializeCompetencies();
            const unsubscribe = subscribeToCompetencyConfig((data) => {
                // Sorting categories by ID to keep consistency
                const sorted = [...data].sort((a, b) => {
                    // Try to sort numerically if it's like 'l1', 'l2'
                    const numA = parseInt(a.id.replace(/\D/g, ''));
                    const numB = parseInt(b.id.replace(/\D/g, ''));
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return a.id.localeCompare(b.id);
                });
                setCompetencies(sorted);
                setLoading(false);
            });
            return unsubscribe;
        };

        const cleanupPromise = init();
        return () => {
            cleanupPromise.then(unsub => unsub && unsub());
        };
    }, []);

    return (
        <CompetencyContext.Provider value={{ competencies, loading }}>
            {children}
        </CompetencyContext.Provider>
    );
};
