import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

document.getElementById("signupBtn").addEventListener("click", async () => {

    try {

        await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        message.textContent = "✅ Account created successfully!";

    } catch (err) {

        message.textContent = err.message;

    }

});

document.getElementById("loginBtn").addEventListener("click", async () => {

    try {

        await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        message.textContent = "✅ Logged in successfully!";

    } catch (err) {

        message.textContent = err.message;

    }

});
