import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Firebase configuration for the new project
const firebaseConfig = {
    apiKey: "AIzaSyDTrZUPrjXtyNdhLPDMUyM8jGikFAkQLZQ",
    authDomain: "creditcardrewards-e53f6.firebaseapp.com",
    projectId: "creditcardrewards-e53f6",
    storageBucket: "creditcardrewards-e53f6.appspot.com",
    messagingSenderId: "122226651915",
    appId: "1:122226651915:web:504c628b4189a7c9d8680e",
    measurementId: "G-7VJMJ3KHK7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const cardForm = document.getElementById("card-form");
const pointsBalanceInput = document.getElementById("points-balance");
const conversionFactorInput = document.getElementById("conversion-factor");
const convertedValueInput = document.getElementById("converted-value");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const dataTable = document.getElementById("data-table");

// Update Converted Value
const updateConvertedValue = () => {
    const pointsBalance = parseFloat(pointsBalanceInput.value) || 0;
    const conversionFactor = parseFloat(conversionFactorInput.value) || 0;
    const convertedValue = pointsBalance * conversionFactor;
    convertedValueInput.value = convertedValue.toFixed(2);
};

pointsBalanceInput.addEventListener("input", updateConvertedValue);
conversionFactorInput.addEventListener("input", updateConvertedValue);

// Authentication Handlers
loginBtn.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login error:", error.message);
        alert("Failed to log in. Please try again.");
    }
});

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error:", error.message);
        alert("Failed to log out. Please try again.");
    }
});

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in as:", user.uid);
        loginBtn.classList.add("d-none");
        logoutBtn.classList.remove("d-none");
        displayCardData(user.uid);
    } else {
        console.log("No user logged in.");
        loginBtn.classList.remove("d-none");
        logoutBtn.classList.add("d-none");
        clearTableData();
    }
});

// Add Card
const displayCardData = async (userId) => {
    try {
        console.log("Fetching cards for user:", userId);

        const querySnapshot = await getDocs(collection(db, `users/${userId}/cards`));
        dataTable.innerHTML = "";
        cachedData = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            cachedData.push(data);

            console.log("Fetched card data:", data);

            const row = `
                <tr>
                    <td>${data.issuingBank}</td>
                    <td>${data.cardName}</td>
                    <td>${data.cardNetwork}</td>
                    <td>${data.pointsBalance}</td>
                    <td>${data.conversionOption}</td>
                    <td>${data.convertedValue.toFixed(2)}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCard('${userId}', '${data.id}')">Delete</button></td>
                </tr>
            `;
            dataTable.innerHTML += row;
        });

        console.log("All card data loaded into the table.");
    } catch (error) {
        console.error("Error fetching card data:", error.message);
        alert("Failed to load card data. Error: " + error.message);
    }
};
// Display User-Specific Card Data
const displayCardData = async (userId) => {
    try {
        console.log("Fetching cards for user:", userId);

        const querySnapshot = await getDocs(collection(db, `users/${userId}/cards`));
        dataTable.innerHTML = "";
        cachedData = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            cachedData.push(data);

            console.log("Fetched card data:", data);

            const row = `
                <tr>
                    <td>${data.issuingBank}</td>
                    <td>${data.cardName}</td>
                    <td>${data.cardNetwork}</td>
                    <td>${data.pointsBalance}</td>
                    <td>${data.conversionOption}</td>
                    <td>${data.convertedValue.toFixed(2)}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCard('${userId}', '${data.id}')">Delete</button></td>
                </tr>
            `;
            dataTable.innerHTML += row;
        });

        console.log("All card data loaded into the table.");
    } catch (error) {
        console.error("Error fetching card data:", error.message);
        alert("Failed to load card data. Error: " + error.message);
    }
};

// Delete Card
const deleteCard = async (userId, docId) => {
    try {
        await deleteDoc(doc(db, `users/${userId}/cards`, docId));
        alert("Card deleted successfully!");
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

// Test Adding Data
const testAddData = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        const testData = { testField: "Test Value" };
        console.log("Adding test data:", testData);

        await addDoc(collection(db, `users/${user.uid}/cards`), testData);
        console.log("Test data added successfully.");
    } catch (error) {
        console.error("Error adding test data:", error.message);
    }
};

// Attach Delete Function to Window (for dynamic buttons)
window.deleteCard = deleteCard;
