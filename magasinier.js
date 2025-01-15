import { database } from "./firebase-config.js";
import {
    ref,
    set,
    push,
    onValue,
    update
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

let currentCommandeId = null; // ID de la commande en cours

// Charger les commandes depuis Firebase
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
                <button onclick="loadCommande('${id}')">Préparer</button>
            `;
            container.appendChild(div);
        }
    });
}

// Charger les détails d'une commande
function loadCommande(id) {
    const commandeRef = ref(database, `commandes/${id}`);
    onValue(commandeRef, (snapshot) => {
        const commande = snapshot.val();
        currentCommandeId = id;
        document.getElementById("current-commande").textContent = commande.numero;

        const tableBody = document.getElementById("commande-table-body");
        tableBody.innerHTML = "";

        commande.produits.forEach((produit, index) => {
            const statusClass = produit.status === "Validé" ? "valide" : "en-attente";
            const statusText = produit.status || "En attente";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${produit.reference}</td>
                <td>${produit.description}</td>
                <td>${produit.quantite}</td>
                <td class="status ${statusClass}" id="status-${index}">${statusText}</td>
                <td>
                    <button class="validate-manually" data-index="${index}">Valider</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.getElementById("commande-details").style.display = "block";

        // Attacher les événements aux boutons "Valider"
        document.querySelectorAll(".validate-manually").forEach((button) => {
            button.addEventListener("click", () => validateManually(id, button.dataset.index));
        });
    });
}

// Valider un produit manuellement
function validateManually(commandeId, productIndex) {
    const commandeRef = ref(database, `commandes/${commandeId}`);
    onValue(commandeRef, (snapshot) => {
        const commande = snapshot.val();
        const produit = commande.produits[productIndex];

        if (produit.status === "Validé") {
            alert("Ce produit est déjà validé !");
            return;
        }

        produit.status = "Validé";

        // Mettre à jour Firebase
        update(commandeRef, { produits: commande.produits })
            .then(() => {
                document.getElementById(`status-${productIndex}`).textContent = "Validé";
                document
                    .getElementById(`status-${productIndex}`)
                    .classList.remove("en-attente");
                document
                    .getElementById(`status-${productIndex}`)
                    .classList.add("valide");

                checkIfCommandeIsReady(commandeId);
            })
            .catch((error) => console.error("Erreur lors de la validation :", error));
    }, { onlyOnce: true });
}

// Vérifier si tous les produits d'une commande sont validés
function checkIfCommandeIsReady(commandeId) {
    const commandeRef = ref(database, `commandes/${commandeId}`);
    onValue(commandeRef, (snapshot) => {
        const commande = snapshot.val();

        const allValidated = commande.produits.every(
            (produit) => produit.status === "Validé"
        );

        if (allValidated) {
            alert(`Commande ${commande.numero} prête !`);
            update(commandeRef, { status: "Prête" })
                .then(() => fetchCommandes())
                .catch((error) =>
                    console.error("Erreur lors de la mise à jour de la commande :", error)
                );
        }
    }, { onlyOnce: true });
}

// Initialisation : Charger les commandes au démarrage
document.addEventListener("DOMContentLoaded", fetchCommandes);
