import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4yWqjP97NWHJu5FBBABG5U28pHk2rXWM",
    authDomain: "catchat-a5e92.firebaseapp.com",
    projectId: "catchat-a5e92",
    storageBucket: "catchat-a5e92.firebasestorage.app",
    messagingSenderId: "856769501386",
    appId: "1:856769501386:web:f902dc2ea472f9af54bc33"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
