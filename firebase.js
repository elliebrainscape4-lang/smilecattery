import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
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

const db = getFirestore(app);

window.db = db;

async function testConnection() {

    const querySnapshot = await getDocs(collection(db, "posts"));

    querySnapshot.forEach((doc) => {

        console.log(doc.id, doc.data());

    });

}

testConnection();
