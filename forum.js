import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/*==================================================
BOARDS
==================================================*/

const boards = [

    { id: "general", label: "General Chat", icon: "fa-comments" },
    { id: "care", label: "Cat Care Tips", icon: "fa-heart" },
    { id: "photos", label: "Photos & Stories", icon: "fa-camera" },
    { id: "askteam", label: "Ask the Team", icon: "fa-paw" }

];

let activeBoard = boards[0].id;
let activeThreadId = null;
let currentUser = null;
let currentUsername = "A Cat Owner";

let unsubscribeThreadList = null;
let unsubscribeReplies = null;


/*==================================================
AUTH GUARD
==================================================*/

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try{

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if(userDoc.exists() && userDoc.data().username){

            currentUsername = userDoc.data().username;

        }
        else{

            currentUsername = user.email ? user.email.split("@")[0] : "A Cat Owner";

        }

    }
    catch(error){

        currentUsername = user.email ? user.email.split("@")[0] : "A Cat Owner";

    }

    const welcome = document.getElementById("forumWelcome");

    if(welcome){

        welcome.innerHTML = `Signed in as <strong>${escapeHtml(currentUsername)}</strong>`;

    }

    initForum();

});


/*==================================================
LOGOUT
==================================================*/

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){

    logoutBtn.addEventListener("click", async ()=>{

        await signOut(auth);

        window.location.href = "login.html";

    });

}


/*==================================================
HELPERS
==================================================*/

function escapeHtml(text){

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;

}

function formatDate(timestamp){

    if(!timestamp || !timestamp.toDate) return "just now";

    const date = timestamp.toDate();

    return date.toLocaleDateString("en-GB",{

        day:"numeric",
        month:"short",
        year:"numeric"

    }) + " at " + date.toLocaleTimeString("en-GB",{

        hour:"2-digit",
        minute:"2-digit"

    });

}


/*==================================================
BOARD TABS
==================================================*/

function renderBoardTabs(){

    const wrap = document.getElementById("catchatBoards");

    if(!wrap) return;

    wrap.innerHTML = "";

    boards.forEach(board=>{

        const tab = document.createElement("button");

        tab.type = "button";

        tab.className = "catchat-board-tab" + (board.id === activeBoard ? " active" : "");

        tab.innerHTML = `<i class="fa-solid ${board.icon}"></i> ${escapeHtml(board.label)}`;

        tab.addEventListener("click", ()=>{

            activeBoard = board.id;

            showBoardView();

        });

        wrap.appendChild(tab);

    });

}


/*==================================================
THREAD LIST (LIVE)
==================================================*/

function renderThreadList(){

    const list = document.getElementById("catchatThreadList");
    const titleEl = document.getElementById("catchatBoardTitle");

    if(!list || !titleEl) return;

    const board = boards.find(b=>b.id === activeBoard);

    titleEl.textContent = board ? board.label : "";

    if(unsubscribeThreadList){

        unsubscribeThreadList();

    }

    const threadsQuery = query(

        collection(db, "threads"),

        where("boardId", "==", activeBoard),

        orderBy("createdAt", "desc")

    );

    unsubscribeThreadList = onSnapshot(threadsQuery, (snapshot)=>{

        if(snapshot.empty){

            list.innerHTML = `<div class="catchat-empty">No discussions here yet — be the first to start one! 🐾</div>`;

            return;

        }

        list.innerHTML = "";

        snapshot.forEach(docSnap=>{

            const thread = docSnap.data();

            const card = document.createElement("div");

            card.className = "catchat-thread-card";

            const replyCount = thread.replyCount || 0;

            card.innerHTML = `

                <div>

                    <h4>${escapeHtml(thread.title)}</h4>

                    <p class="catchat-thread-meta">

                        Started by ${escapeHtml(thread.authorName)} • ${formatDate(thread.createdAt)}

                    </p>

                </div>

                <div class="catchat-thread-count">

                    ${replyCount}

                    <span>${replyCount === 1 ? "Reply" : "Replies"}</span>

                </div>

            `;

            card.addEventListener("click", ()=>{

                activeThreadId = docSnap.id;

                showThreadView();

            });

            list.appendChild(card);

        });

    }, (error)=>{

        list.innerHTML = `<div class="catchat-empty">Couldn't load discussions right now. Please refresh and try again.</div>`;

        console.error(error);

    });

}


/*==================================================
VIEW SWITCHING
==================================================*/

function hideAllPanels(){

    document.getElementById("catchatBoardView").style.display = "none";

    document.getElementById("catchatThreadView").style.display = "none";

    document.getElementById("catchatNewThreadForm").style.display = "none";

    if(unsubscribeReplies){

        unsubscribeReplies();

        unsubscribeReplies = null;

    }

}

function showBoardView(){

    activeThreadId = null;

    hideAllPanels();

    document.getElementById("catchatBoardView").style.display = "block";

    renderBoardTabs();

    renderThreadList();

}

function showThreadView(){

    hideAllPanels();

    document.getElementById("catchatThreadView").style.display = "block";

    getDoc(doc(db, "threads", activeThreadId)).then(threadDoc=>{

        if(!threadDoc.exists()){

            showBoardView();

            return;

        }

        const thread = threadDoc.data();

        document.getElementById("catchatThreadTitle").textContent = thread.title;

        document.getElementById("catchatThreadMeta").textContent =
            `Started by ${thread.authorName} • ${formatDate(thread.createdAt)}`;

        document.getElementById("catchatThreadBody").textContent = thread.message;

    });

    const repliesEl = document.getElementById("catchatReplies");

    repliesEl.innerHTML = `<div class="catchat-empty">Loading replies...</div>`;

    const repliesQuery = query(

        collection(db, "threads", activeThreadId, "replies"),

        orderBy("createdAt", "asc")

    );

    unsubscribeReplies = onSnapshot(repliesQuery, (snapshot)=>{

        if(snapshot.empty){

            repliesEl.innerHTML = `<div class="catchat-empty">No replies yet — add the first one below!</div>`;

            return;

        }

        repliesEl.innerHTML = snapshot.docs.map(docSnap=>{

            const reply = docSnap.data();

            return `

                <div class="catchat-reply">

                    <div class="catchat-reply-head">

                        <strong>${escapeHtml(reply.authorName)}</strong>

                        <span>${formatDate(reply.createdAt)}</span>

                    </div>

                    <p style="margin:0;">${escapeHtml(reply.message)}</p>

                </div>

            `;

        }).join("");

    });

}

function showNewThreadForm(){

    hideAllPanels();

    document.getElementById("catchatNewThreadForm").style.display = "block";

}


/*==================================================
POSTING
==================================================*/

async function submitNewThread(){

    const titleField = document.getElementById("catchatNewTitle");
    const messageField = document.getElementById("catchatNewMessage");

    const title = titleField.value.trim();
    const message = messageField.value.trim();

    if(!title || !message){

        alert("Please add a title and a message before posting.");

        return;

    }

    const submitBtn = document.getElementById("catchatSubmitThread");

    submitBtn.disabled = true;

    try{

        const newThread = await addDoc(collection(db, "threads"), {

            boardId: activeBoard,

            title,

            message,

            authorName: currentUsername,

            authorUid: currentUser.uid,

            replyCount: 0,

            createdAt: serverTimestamp()

        });

        titleField.value = "";

        messageField.value = "";

        activeThreadId = newThread.id;

        showThreadView();

    }
    catch(error){

        alert("Sorry, that couldn't be posted right now. Please try again.");

        console.error(error);

    }
    finally{

        submitBtn.disabled = false;

    }

}

async function submitReply(){

    const messageField = document.getElementById("catchatReplyMessage");

    const message = messageField.value.trim();

    if(!message){

        alert("Please write a reply before posting.");

        return;

    }

    const submitBtn = document.getElementById("catchatSubmitReply");

    submitBtn.disabled = true;

    try{

        await addDoc(collection(db, "threads", activeThreadId, "replies"), {

            message,

            authorName: currentUsername,

            authorUid: currentUser.uid,

            createdAt: serverTimestamp()

        });

        await updateDoc(doc(db, "threads", activeThreadId), {

            replyCount: increment(1)

        });

        messageField.value = "";

    }
    catch(error){

        alert("Sorry, that reply couldn't be posted right now. Please try again.");

        console.error(error);

    }
    finally{

        submitBtn.disabled = false;

    }

}


/*==================================================
EVENT LISTENERS
==================================================*/

function initForum(){

    document.getElementById("catchatNewThreadBtn").addEventListener("click", showNewThreadForm);

    document.getElementById("catchatCancelNewThread").addEventListener("click", showBoardView);

    document.getElementById("catchatSubmitThread").addEventListener("click", submitNewThread);

    document.getElementById("catchatBackBtn").addEventListener("click", showBoardView);

    document.getElementById("catchatSubmitReply").addEventListener("click", submitReply);

    showBoardView();

}
