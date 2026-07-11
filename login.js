import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

signupBtn.addEventListener("click", async () => {

    try {

        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        await setDoc(
            doc(db, "users", userCredential.user.uid),
            {

                username: username.value,

                email: email.value,

                role: "member",

                joined: serverTimestamp()

            }
        );

        message.textContent =
        "✅ Account created!";

    }

    catch(err){

        message.textContent = err.message;

    }

});

loginBtn.addEventListener("click", async ()=>{

    try{

        await signInWithEmailAndPassword(

            auth,

            email.value,

            password.value

        );

        window.location.href="forum.html";

    }

    catch(err){

        message.textContent=err.message;

    }

});
