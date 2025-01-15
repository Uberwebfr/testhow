
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
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

// Ajouter une commande dans Firebase
function addCommande() {
    const numero = document.getElementById("commande-number").value;
    if (!numero) {
        alert("Veuillez entrer un numéro de commande.");
        return;
    }

    const commandesRef = ref(database, "commandes");
    push(commandesRef, { numero, produits: [], status: "En cours" })
        .then(() => {
            alert("Commande ajoutée avec succès !");
            fetchCommandes();
        })
        .catch((error) => console.error("Erreur :", error));
}

// Importer les commandes depuis un fichier Excel
function importCommandsFromExcel() {
    const fileInput = document.getElementById("file-upload");
    if (!fileInput.files[0]) {
        alert("Veuillez sélectionner un fichier Excel.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Validation du fichier
            if (rows.length < 2 || rows[0].length < 1) {
                alert("Le fichier doit contenir au moins une colonne : Code Produit.");
                return;
            }

            // Vérifier les colonnes
            const headers = rows[0];
            if (!headers.includes("Code Produit") || !headers.includes("Quantité Commande")) {
                alert("Le fichier doit contenir les colonnes 'Code Produit' et 'Quantité Commande'.");
                return;
            }

            // Ajouter chaque produit comme une commande dans Firebase
            const commandesRef = ref(database, "commandes");
            const numeroCommande = `CMD-${Date.now()}`; // Générer un numéro unique pour la commande
            const produits = rows.slice(1).map((row) => ({
                codeProduit: row[headers.indexOf("Code Produit")],
                description: row[headers.indexOf("Description")] || "",
                quantite: row[headers.indexOf("Quantité Commande")],
            })).filter((p) => p.codeProduit && p.quantite); // Filtrer les lignes vides ou incorrectes

            if (produits.length === 0) {
                alert("Aucun produit valide trouvé dans le fichier.");
                return;
            }

            push(commandesRef, { numero: numeroCommande, produits, status: "En cours" })
                .then(() => {
                    alert(`Commande ${numeroCommande} importée avec succès !`);
                    fetchCommandes();
                })
                .catch((error) => console.error("Erreur :", error));
        } catch (error) {
            console.error("Erreur lors de l'importation :", error);
            alert("Une erreur s'est produite lors de l'importation du fichier Excel.");
        }
    };

    reader.readAsArrayBuffer(file);
}

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
                `;
                container.appendChild(div);
            }
        } else {
            container.innerHTML = "<p>Aucune commande trouvée.</p>";
        }
    });
}

// Ajouter des écouteurs pour les boutons
document.getElementById("add-commande").addEventListener("click", addCommande);
document.getElementById("import-commands-button").addEventListener("click", importCommandsFromExcel);
document.addEventListener("DOMContentLoaded", fetchCommandes);
