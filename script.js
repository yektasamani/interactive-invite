import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    onValue,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB--epumE0mvxc-U4kCnt1csRPDugbFpTg",
    authDomain: "interactive-invite.firebaseapp.com",
    databaseURL: "https://interactive-invite-default-rtdb.firebaseio.com",
    projectId: "interactive-invite",
    storageBucket: "interactive-invite.firebasestorage.app",
    messagingSenderId: "198311215035",
    appId: "1:198311215035:web:454bb2eb11af73eef14e9e",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const target = new Date("2026-04-25T18:30:00-07:00");

function tick() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
        document.getElementById("days").textContent = "the date has begun";
        document.getElementById("hours").textContent = "";
        document.getElementById("minutes").textContent = "";
        document.getElementById("seconds").textContent = "";
        return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById("days").textContent = d + "d ";
    document.getElementById("hours").textContent = h + "h ";
    document.getElementById("minutes").textContent = m + "m ";
    document.getElementById("seconds").textContent = s + "s";
}

tick();
setInterval(tick, 1000);

const capreseItems = ["cheese", "tomato", "basil", "glaze"].map((id) =>
    document.getElementById(id),
);

const recipe = document.getElementById("recipe");
const recipeDivider = document.getElementById("recipeDivider");

function checkCaprese() {
    if (capreseItems.every((cb) => cb.checked)) {
        recipe.ariaHidden = "false";
        recipeDivider.ariaHidden = "false";
    } else {
        recipe.ariaHidden = "true";
        recipeDivider.ariaHidden = "true";
    }
}

capreseItems.forEach((cb) => cb.addEventListener("change", checkCaprese));

const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');

allCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
        set(ref(db, "checklist/" + cb.id), cb.checked);
    });
});

onValue(ref(db, "checklist"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        allCheckboxes.forEach((cb) => {
            if (data[cb.id] !== undefined) {
                cb.checked = data[cb.id];
            }
        });
        checkCaprese();
    }
});

document.getElementById("rsvpYes").addEventListener("click", () => {
    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_key: "db6a819a-c925-4321-9ede-00052860947e",
            subject: "RSVP — date night!",
            message: "i'll be there",
        }),
    });
    set(ref(db, "rsvp/status"), "yes");
    document.getElementById("rsvpConfirm").textContent = "you rsvp'd yes";
    document.getElementById("rsvpConfirm").style.display = "block";
});

document.getElementById("rsvpDate").addEventListener("click", () => {
    document.getElementById("dateForm").style.display = "block";
});

document.getElementById("dateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("dateInput").value;
    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_key: "db6a819a-c925-4321-9ede-00052860947e",
            subject: "New date proposal",
            message: date,
        }),
    });
    set(ref(db, "rsvp/proposedDate"), date);
    document.getElementById("rsvpConfirm").textContent = "date proposal sent!";
    document.getElementById("rsvpConfirm").style.display = "block";
    document.getElementById("dateForm").style.display = "none";
    document.getElementById("rsvpDate").style.display = "none";
});

onValue(ref(db, "rsvp/status"), (snapshot) => {
    if (snapshot.val() === "yes") {
        document.querySelector(".rsvp-section h2").textContent = "change of plans?";
        document.getElementById("rsvpConfirm").textContent = "you rsvp'd yes";
        document.getElementById("rsvpConfirm").style.display = "block";
        document.getElementById("rsvpYes").style.display = "none";
    }
});

onValue(ref(db, "rsvp/proposedDate"), (snapshot) => {
    if (snapshot.val()) {
        document.getElementById("rsvpDate").style.display = "none";
        document.getElementById("rsvpConfirm").textContent = "date proposal sent!";
        document.getElementById("rsvpConfirm").style.display = "block";
        document.getElementById("dateForm").style.display = "none";
        document.getElementById("rsvpYes").style.display = "none";
    }
});
