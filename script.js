import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBn5tW8rhxvJXqZNgaSaupV5xiES1z2Gxk",
    authDomain: "credit-card-tracker-f69b4.firebaseapp.com",
    projectId: "credit-card-tracker-f69b4",
    storageBucket: "credit-card-tracker-f69b4.appspot.com",
    messagingSenderId: "1019767677949",
    appId: "1:1019767677949:web:27aac376f0d8af25d26f94",
    measurementId: "G-DGK4WNXV1F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cardForm = document.getElementById("card-form");
const pointsBalanceInput = document.getElementById("points-balance");
const conversionFactorInput = document.getElementById("conversion-factor");
const convertedValueInput = document.getElementById("converted-value");
let cachedData = [];

const updateConvertedValue = () => {
    const pointsBalance = parseFloat(pointsBalanceInput.value) || 0;
    const conversionFactor = parseFloat(conversionFactorInput.value) || 0;
    const convertedValue = pointsBalance * conversionFactor;
    convertedValueInput.value = convertedValue.toFixed(2);
};

pointsBalanceInput.addEventListener("input", updateConvertedValue);
conversionFactorInput.addEventListener("input", updateConvertedValue);

cardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const pointsBalance = parseInt(pointsBalanceInput.value);
    const conversionFactor = parseFloat(conversionFactorInput.value);

    if (isNaN(pointsBalance) || pointsBalance <= 0) {
        alert("Points Balance must be a positive number.");
        return;
    }
    if (isNaN(conversionFactor) || conversionFactor <= 0) {
        alert("Conversion Factor must be a positive number.");
        return;
    }

    const cardData = {
        issuingBank: document.getElementById("issuing-bank").value,
        cardName: document.getElementById("card-name").value,
        cardNetwork: document.getElementById("card-network").value,
        pointsBalance,
        conversionOption: document.getElementById("conversion-options").value,
        conversionFactor,
        convertedValue: parseFloat(convertedValueInput.value),
    };

    try {
        const docRef = await addDoc(collection(db, "cards"), cardData);
        alert("Card added successfully with ID: " + docRef.id);
        cardForm.reset();
        displayCardData();
    } catch (error) {
        console.error("Error adding document:", error.message);
        alert("Failed to save card data. Error: " + error.message);
    }
});

const displayCardData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const tableBody = document.getElementById("data-table");
        tableBody.innerHTML = "";
        cachedData = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            cachedData.push(data);

            const row = `
                <tr>
                    <td>${data.issuingBank}</td>
                    <td>${data.cardName}</td>
                    <td>${data.cardNetwork}</td>
                    <td>${data.pointsBalance}</td>
                    <td>${data.conversionOption}</td>
                    <td>${data.convertedValue.toFixed(2)}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCard('${data.id}')">Delete</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching card data:", error.message);
        alert("Failed to load card data. Error: " + error.message);
    }
};

const deleteCard = async (docId) => {
    try {
        await deleteDoc(doc(db, "cards", docId));
        alert("Card deleted successfully!");
        displayCardData();
    } catch (error) {
        console.error("Error deleting document:", error.message);
        alert("Failed to delete card. Error: " + error.message);
    }
};

window.sortTable = (key) => {
    if (cachedData.length === 0) return;
    cachedData.sort((a, b) => (typeof a[key] === "number" ? a[key] - b[key] : a[key].localeCompare(b[key])));
    displaySortedData();
};

const displaySortedData = () => {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = "";

    cachedData.forEach((data) => {
        const row = `
            <tr>
                <td>${data.issuingBank}</td>
                <td>${data.cardName}</td>
                <td>${data.cardNetwork}</td>
                <td>${data.pointsBalance}</td>
                <td>${data.conversionOption}</td>
                <td>${data.convertedValue.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteCard('${data.id}')">Delete</button></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

window.filterTable = () => {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filteredData = cachedData.filter((data) =>
        data.issuingBank.toLowerCase().includes(query) ||
        data.cardName.toLowerCase().includes(query) ||
        data.cardNetwork.toLowerCase().includes(query)
    );

    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = "";

    filteredData.forEach((data) => {
        const row = `
            <tr>
                <td>${data.issuingBank}</td>
                <td>${data.cardName}</td>
                <td>${data.cardNetwork}</td>
                <td>${data.pointsBalance}</td>
                <td>${data.conversionOption}</td>
                <td>${data.convertedValue.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteCard('${data.id}')">Delete</button></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

window.onload = displayCardData;
window.deleteCard = deleteCard;