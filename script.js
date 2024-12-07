import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDTrZUPrjXtyNdhLPDMUyM8jGikFAkQLZQ",
    authDomain: "creditcardrewards-e53f6.firebaseapp.com",
    projectId: "creditcardrewards-e53f6",
    storageBucket: "creditcardrewards-e53f6.appspot.com",
    messagingSenderId: "122226651915",
    appId: "1:122226651915:web:504c628b4189a7c9d8680e",
    measurementId: "G-7VJMJ3KHK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const cardForm = document.getElementById("card-form");
const dataTable = document.getElementById("data-table");

// Authentication Handlers
loginBtn.addEventListener("click", async () => {
    try {
        console.log("Login button clicked.");
        await signInWithPopup(auth, provider);
        console.log("User logged in successfully.");
    } catch (error) {
        console.error("Login error:", error.message);
        alert("Login failed. Error: " + error.message);
    }
});

logoutBtn.addEventListener("click", async () => {
    try {
        console.log("Logout button clicked.");
        await signOut(auth);
        console.log("User logged out successfully.");
        clearTableData();
    } catch (error) {
        console.error("Logout error:", error.message);
        alert("Failed to log out. Please try again.");
    }
});

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    const appContent = document.getElementById("app-content"); // Main content
    const loginPrompt = document.getElementById("login-prompt"); // Login screen

    if (user) {
        console.log("Logged in as:", user.uid);
        loginPrompt.style.display = "none"; // Hide login prompt
        appContent.style.display = "block"; // Show main content
        displayCardData(user.uid);
    } else {
        console.log("No user is logged in.");
        appContent.style.display = "none"; // Hide main content
        loginPrompt.style.display = "block"; // Show login prompt
    }
});

// Add Card
cardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add a card.");
        return;
    }

    const cardData = {
        issuingBank: document.getElementById("issuing-bank").value,
        cardName: document.getElementById("card-name").value,
        cardNetwork: document.getElementById("card-network").value,
        pointsBalance: parseInt(document.getElementById("points-balance").value),
        conversionOption: document.getElementById("conversion-options").value,
        conversionFactor: parseFloat(document.getElementById("conversion-factor").value),
        convertedValue: parseFloat(document.getElementById("converted-value").value)
    };

    try {
        console.log("Saving card data for user:", user.uid);
        await addDoc(collection(db, `users/${user.uid}/cards`), cardData);
        console.log("Card added successfully.");
        alert("Card added successfully!");
        cardForm.reset();
        displayCardData(user.uid);
    } catch (error) {
        console.error("Error adding document:", error.message);
        alert("Failed to save card data. Error: " + error.message);
    }
});

// Display User-Specific Card Data
const displayCardData = async (userId) => {
    try {
        console.log("Fetching cards for user:", userId);

        const querySnapshot = await getDocs(collection(db, `users/${userId}/cards`));
        dataTable.innerHTML = ""; // Clear existing rows

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = `
                <tr>
                    <td>${data.issuingBank}</td>
                    <td>${data.cardName}</td>
                    <td>${data.cardNetwork}</td>
                    <td>${data.pointsBalance}</td>
                    <td>${data.conversionOption}</td>
                    <td>${data.convertedValue.toFixed(2)}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCard('${userId}', '${doc.id}')">Delete</button></td>
                </tr>
            `;
            dataTable.innerHTML += row;
        });

        console.log("Card data displayed successfully.");
    } catch (error) {
        console.error("Error fetching card data:", error.message);
        alert("Failed to load card data. Error: " + error.message);
    }
};

// Delete Card
const deleteCard = async (userId, docId) => {
    try {
        await deleteDoc(doc(db, `users/${userId}/cards`, docId));
        console.log("Card deleted successfully.");
        displayCardData(userId);
    } catch (error) {
        console.error("Error deleting document:", error.message);
        alert("Failed to delete card. Error: " + error.message);
    }
};

// Clear Table Data on Logout
const clearTableData = () => {
    dataTable.innerHTML = "";
};

// Attach Delete Function to Window (for dynamic buttons)
window.deleteCard = deleteCard;
