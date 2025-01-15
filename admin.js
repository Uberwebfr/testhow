
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import * as XLSX from "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Ajouter une commande
document.getElementById("add-commande").addEventListener("click", () => {
    const numero = document.getElementById("commande-number").value;
    const fileInput = document.getElementById("file-upload");

    if (!numero) {
        alert("Veuillez entrer un numéro de commande.");
        return;
    }
    if (!fileInput.files[0]) {
        alert("Veuillez importer un fichier Excel.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Récupère les produits
        const produits = rows.slice(1).map(row => ({
            codeProduit: row[0],
            description: row[1],
            quantite: row[3],
        }));

        // Ajouter dans Firebase
        const commandesRef = ref(database, "commandes");
        push(commandesRef, { numero, produits, status: "En cours" })
            .then(() => {
                alert(`Commande ${numero} ajoutée avec succès.`);
                fetchCommandes();
            })
            .catch(error => console.error("Erreur :", error));
    };

    reader.readAsArrayBuffer(file);
});

// Charger les commandes depuis Firebase
function fetchCommandes() {
    const commandesRef = ref(database, "commandes");
    onValue(commandesRef, (snapshot) => {
        const commandes = snapshot.val();
        const container = document.getElementById("commandes-container");
        container.innerHTML = ""; // Réinitialise l'affichage

        if (commandes) {
            for (const id in commandes) {
                const commande = commandes[id];
                const div = document.createElement("div");
                div.classList.add("commande-card");
                div.innerHTML = `
                    <div><strong>Commande :</strong> ${commande.numero}</div>
                    <div><strong>Status :</strong> ${commande.status}</div>
                    <button onclick="deleteCommande('${id}')">Supprimer</button>
                `;
                container.appendChild(div);
            }
        } else {
            container.innerHTML = "<p>Aucune commande trouvée.</p>";
        }
    });
}

// Supprimer une commande
function deleteCommande(id) {
    const commandeRef = ref(database, `commandes/${id}`);
    remove(commandeRef)
        .then(() => {
            alert("Commande supprimée.");
            fetchCommandes();
        })
        .catch(error => console.error("Erreur :", error));
}

// Charger les produits depuis Firebase
function fetchProducts() {
    const productsRef = ref(database, "products");
    onValue(productsRef, (snapshot) => {
        const products = snapshot.val();
        const tableBody = document.getElementById("product-table-body");
        tableBody.innerHTML = "";

        if (products) {
            products.forEach(product => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${product.reference}</td>
                    <td>${product.gencode}</td>
                    <td>${product.description}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    });
}

// Importer la base de données des produits
document.getElementById("import-product-button").addEventListener("click", () => {
    const fileInput = document.getElementById("product-file");

    if (!fileInput.files[0]) {
        alert("Veuillez sélectionner un fichier Excel.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const products = rows.slice(1).map(row => ({
            reference: row[0],
            gencode: row[1],
            description: row[2]
        }));

        const productsRef = ref(database, "products");
        set(productsRef, products)
            .then(() => {
                alert("Base de produits importée avec succès.");
                fetchProducts();
            })
            .catch(error => console.error("Erreur :", error));
    };

    reader.readAsArrayBuffer(file);
});

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    fetchCommandes();
    fetchProducts();
});
