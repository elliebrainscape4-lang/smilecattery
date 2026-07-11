import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

function setBusy(isBusy){

    signupBtn.disabled = isBusy;

    loginBtn.disabled = isBusy;

}

function friendlyError(err){

    const code = err.code || "";

    if(code.includes("email-already-in-use")){

        return "That email already has an account — try logging in instead.";

    }

    if(code.includes("weak-password")){

        return "Please choose a password with at least 6 characters.";

    }

    if(code.includes("invalid-email")){

        return "Please enter a valid email address.";

    }

    if(code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")){

        return "Incorrect email or password — please try again.";

    }

    return err.message;

}

signupBtn.addEventListener("click", async () => {

    message.textContent = "";

    if(!username.value.trim() || !email.value.trim() || !password.value){

        message.textContent = "Please fill in a username, email and password.";

        return;

    }

    setBusy(true);

    try {

        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        await setDoc(
            doc(db, "users", userCredential.user.uid),
            {

                username: username.value.trim(),

                email: email.value.trim(),

                role: "member",

                joined: serverTimestamp()

            }
        );

        sessionStorage.setItem("smileCatteryUsername", username.value.trim());

        message.style.color = "var(--green)";

        message.textContent = "✅ Account created! Redirecting...";

        setTimeout(()=>{

            window.location.href = "forum.html";

        }, 700);

    }

    catch(err){

        message.style.color = "var(--terracotta)";

        message.textContent = friendlyError(err);

    }

    finally{

        setBusy(false);

    }

});

loginBtn.addEventListener("click", async ()=>{

    message.textContent = "";

    if(!email.value.trim() || !password.value){

        message.textContent = "Please enter your email and password.";

        return;

    }

    setBusy(true);

    try{

        await signInWithEmailAndPassword(

            auth,

            email.value.trim(),

            password.value

        );

        window.location.href = "forum.html";

    }

    catch(err){

        message.style.color = "var(--terracotta)";

        message.textContent = friendlyError(err);

    }

    finally{

        setBusy(false);

    }

});
