import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCRoI0TTY7jpZjuDDXd-V3bytr-3TKjLig",
    authDomain: "bl-competencies.firebaseapp.com",
    projectId: "bl-competencies",
    storageBucket: "bl-competencies.firebasestorage.app",
    messagingSenderId: "10494718292",
    appId: "1:10494718292:web:1f30c1e33b8c349c6bd8c1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
