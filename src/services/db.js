import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    onSnapshot,
    getDocs,
    updateDoc,
    deleteDoc,
    collectionGroup
} from 'firebase/firestore';
import { COMPETENCIES as STATIC_COMPETENCIES } from '../data/competencies';

// Initialize competencies from static file if empty
export const initializeCompetencies = async () => {
    const q = query(collection(db, 'competencies_config'));
    const snap = await getDocs(q);
    if (snap.empty) {
        console.log("Seeding competencies to database...");
        for (const cat of STATIC_COMPETENCIES) {
            await setDoc(doc(db, 'competencies_config', cat.id), cat);
        }
    }
};

export const subscribeToCompetencyConfig = (callback) => {
    return onSnapshot(collection(db, 'competencies_config'), (snap) => {
        const config = [];
        snap.forEach(doc => config.push(doc.data()));
        // Sort if needed, though they have IDs
        callback(config);
    });
};

export const updateCategory = async (catId, data) => {
    await setDoc(doc(db, 'competencies_config', catId), data, { merge: true });
};

export const deleteCategory = async (catId) => {
    await deleteDoc(doc(db, 'competencies_config', catId));
};

export const addCategory = async (cat) => {
    await setDoc(doc(db, 'competencies_config', cat.id), cat);
};

export const ensureUserExists = async (email, name) => {
    const userRef = doc(db, 'users', email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        const role = email === 'benlairig@yorksu.org' ? 'admin' : 'member';
        await setDoc(userRef, {
            email,
            name: name || email.split('@')[0],
            role
        });
    }
};

export const getUserDetails = async (email) => {
    const userRef = doc(db, 'users', email);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data();
    }
    return null;
};

export const subscribeToUserCompetencies = (userId, callback) => {
    const q = query(collection(db, 'competencies'), where("userId", "==", userId));
    return onSnapshot(q, (querySnapshot) => {
        const comps = [];
        querySnapshot.forEach((docSnap) => {
            comps.push(docSnap.data());
        });
        callback(comps);
    });
};

export const requestVerification = async (userId, skillId) => {
    const compId = `${userId}_${skillId}`;
    const compRef = doc(db, 'competencies', compId);
    await setDoc(compRef, {
        userId,
        skillId,
        status: 'Pending Verification',
        timestamp: new Date().toISOString()
    }, { merge: true });
};

export const updateCompetencyStatus = async (userId, skillId, status) => {
    const compId = `${userId}_${skillId}`;
    const compRef = doc(db, 'competencies', compId);
    await setDoc(compRef, {
        userId,
        skillId,
        status,
        timestamp: new Date().toISOString()
    }, { merge: true });
};

export const subscribeToPendingRequests = (callback) => {
    const q = query(collection(db, 'competencies'), where("status", "==", "Pending Verification"));
    return onSnapshot(q, (querySnapshot) => {
        const requests = [];
        querySnapshot.forEach(docSnap => {
            requests.push(docSnap.data());
        });
        callback(requests);
    });
};

export const subscribeToAllUsers = (callback) => {
    return onSnapshot(collection(db, 'users'), (querySnapshot) => {
        const users = [];
        querySnapshot.forEach(docSnap => {
            users.push(docSnap.data());
        });
        callback(users);
    });
};

export const subscribeToAllCompetencies = (callback) => {
    return onSnapshot(collection(db, 'competencies'), (querySnapshot) => {
        const comps = [];
        querySnapshot.forEach(docSnap => {
            comps.push(docSnap.data());
        });
        callback(comps);
    });
};

