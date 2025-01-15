import { database } from "./firebase-config.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Charger les commandes
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
                <button onclick="loadCommande('${id}')">Préparer</button>
            `;
            container.appendChild(div);
        }
    });
}

// Charger une commande
function loadCommande(id) {
    const commandeRef = ref(database, `commandes/${id}`);
    onValue(commandeRef, (snapshot) => {
        const commande = snapshot.val();
        document.getElementById("current-commande").textContent = commande.numero;
        const tableBody = document.getElementById("commande-table");
        tableBody.innerHTML = "";
        commande.produits.forEach((product, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.reference}</td>
                <td>${product.description}</td>
                <td>${product.quantite}</td>
                <td>${product.status || "En attente"}</td>
                <td><button onclick="validateProduct('${id}', ${index})">Valider</button></td>
            `;
            tableBody.appendChild(tr);
        });
    });
}

// Valider un produit
function validateProduct(commandeId, productIndex) {
    const commandeRef = ref(database, `commandes/${commandeId}`);
    onValue(commandeRef, (snapshot) => {
        const commande = snapshot.val();
        commande.produits[productIndex].status = "Validé";
        update(commandeRef, { produits: commande.produits })
            .then(() => alert("Produit validé !"))
            .catch(error => console.error("Erreur :", error));
    }, { onlyOnce: true });
}

// Initialisation
document.addEventListener("DOMContentLoaded", fetchCommandes);
