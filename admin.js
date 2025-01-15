import { database } from "./firebase-config.js";
import {
    ref,
    set,
    push,
    onValue
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Ajouter une commande dans Firebase
function addCommande() {
    const numero = document.getElementById("commande-number").value;
    if (!numero) {
        alert("Veuillez entrer un numéro de commande.");
        return;
    }

    const commande = {
        numero,
        produits: [], // Liste vide, produits à ajouter ultérieurement
        status: "En cours"
    };

    const commandesRef = ref(database, "commandes");
    push(commandesRef, commande)
        .then(() => {
            alert("Commande ajoutée avec succès !");
            document.getElementById("commande-number").value = ""; // Réinitialise le champ
            fetchCommandes();
        })
        .catch((error) => console.error("Erreur lors de l'ajout de la commande :", error));
}

// Charger et afficher les commandes
function fetchCommandes() {
    const commandesRef = ref(database, "commandes");
    onValue(commandesRef, (snapshot) => {
        const commandes = snapshot.val();
        const container = document.getElementById("commandes-container");
        container.innerHTML = "";

        for (const id in commandes) {
            const commande = commandes[id];
            const div = document.createElement("div");
            div.classList.add("commande-card");
            div.innerHTML = `
                <div><strong>Commande :</strong> ${commande.numero}</div>
                <div><strong>Status :</strong> ${commande.status || "En cours"}</div>
            `;
            container.appendChild(div);
        }
    });
}

// Importer la base de données des produits depuis un fichier Excel
function importProducts() {
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

        // Vérification du format
        if (rows.length < 1 || rows[0].length < 3) {
            alert("Le fichier doit contenir au moins 3 colonnes : Référence, Gencode, Descriptif.");
            return;
        }

        // Construire la liste des produits
        const products = rows.slice(1).map(row => ({
            reference: row[0],
            gencode: row[1],
            description: row[2]
        }));

        saveProductsToDatabase(products);
    };

    reader.readAsArrayBuffer(file);
}

// Sauvegarder les produits dans Firebase
function saveProductsToDatabase(products) {
    const productsRef = ref(database, "products");
    set(productsRef, products)
        .then(() => {
            alert("Base de données des produits importée avec succès !");
            fetchProducts();
        })
        .catch((error) => console.error("Erreur lors de l'importation des produits :", error));
}

// Charger et afficher les produits
function fetchProducts() {
    const productsRef = ref(database, "products");
    onValue(productsRef, (snapshot) => {
        const products = snapshot.val();
        const tableBody = document.getElementById("product-table-body");
        tableBody.innerHTML = "";

        if (products) {
            products.forEach((product) => {
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

// Écouteurs d'événements
document.getElementById("add-commande").addEventListener("click", addCommande);
document.getElementById("import-product-button").addEventListener("click", importProducts);

// Charger les commandes et les produits au démarrage
document.addEventListener("DOMContentLoaded", () => {
    fetchCommandes();
    fetchProducts();
});
