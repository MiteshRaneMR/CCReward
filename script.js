import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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

// Set session-based persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Session persistence set to local."))
    .catch((error) => console.error("Error setting persistence:", error.message));

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginPrompt = document.getElementById("login-prompt");
const cardForm = document.getElementById("card-form");
const dataTable = document.getElementById("data-table");
const pointsBalanceInput = document.getElementById("points-balance");
const conversionFactorInput = document.getElementById("conversion-factor");
const convertedValueInput = document.getElementById("converted-value");

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    console.log("Authentication state changed:", user);

    const appContent = document.getElementById("app-content");
    const loginPrompt = document.getElementById("login-prompt");

    if (user) {
        console.log("User is authenticated:", user.uid);
        loginPrompt.classList.add("d-none"); // Hide login prompt
        appContent.classList.remove("d-none"); // Show app content
        displayCardData(user.uid); // Fetch and display user data
    } else {
        console.log("No user is authenticated.");
        appContent.classList.add("d-none"); // Hide app content
        loginPrompt.classList.remove("d-none"); // Show login prompt
    }
});

// Google Login
loginBtn.addEventListener("click", async () => {
    try {
        console.log("Google login button clicked.");
        const result = await signInWithPopup(auth, provider);
        console.log("Google login successful:", result.user);
    } catch (error) {
        console.error("Google login error:", error.message);
        alert("Login failed. Error: " + error.message);
    }
});

// Email/Password Login
emailLoginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please enter a valid email and password.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Email login successful:", userCredential.user);
        alert("Logged in successfully.");
    } catch (error) {
        console.error("Email login error:", error.message);
        alert("Failed to log in. Error: " + error.message);
    }
});

// Email/Password Sign-Up
emailSignupBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please enter a valid email and password.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up successfully:", userCredential.user);
        alert("Account created successfully. You can now log in.");
    } catch (error) {
        console.error("Sign-up error:", error.message);
        alert("Failed to create account. Error: " + error.message);
    }
});

// Logout
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

// Auto-calculate the converted value when points or conversion factor changes
const updateConvertedValue = () => {
    const pointsBalance = parseFloat(pointsBalanceInput.value) || 0;
    const conversionFactor = parseFloat(conversionFactorInput.value) || 0;
    const convertedValue = pointsBalance * conversionFactor;
    convertedValueInput.value = convertedValue.toFixed(2);
};

// Event listeners for calculating converted value on input
pointsBalanceInput.addEventListener("input", updateConvertedValue);
conversionFactorInput.addEventListener("input", updateConvertedValue);

// Add Card
cardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add a card.");
        return;
    }

    const issuingBank = document.getElementById("issuing-bank").value.trim();
    const cardName = document.getElementById("card-name").value.trim();
    const cardNetwork = document.getElementById("card-network").value;
    const pointsBalance = parseInt(document.getElementById("points-balance").value);
    const conversionOption = document.getElementById("conversion-options").value;
    const conversionFactor = parseFloat(document.getElementById("conversion-factor").value);
    const convertedValue = parseFloat(document.getElementById("converted-value").value);

    // Validate inputs
    if (!issuingBank || !cardName || !cardNetwork || isNaN(pointsBalance) || isNaN(conversionFactor) || isNaN(convertedValue)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    const cardData = {
        issuingBank,
        cardName,
        cardNetwork,
        pointsBalance,
        conversionOption,
        conversionFactor,
        convertedValue
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

        if (querySnapshot.empty) {
            console.log("No card data found.");
            dataTable.innerHTML = `<tr><td colspan="7">No cards found. Add a new card to get started.</td></tr>`;
            return;
        }

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
