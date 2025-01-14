// Fonction pour récupérer les commandes depuis le LocalStorage
function getCommandes() {
    return JSON.parse(localStorage.getItem("commandes")) || [];
}

// Fonction pour sauvegarder les commandes dans le LocalStorage
function saveCommandes(commandes) {
    localStorage.setItem("commandes", JSON.stringify(commandes));
}

// Fonction pour afficher la liste des commandes sous forme de cartes
function renderCommandes() {
    const commandes = getCommandes();
    const container = document.getElementById("commandes-container");
    container.innerHTML = ""; // Efface les cartes existantes

    commandes.forEach((commande, index) => {
        const statut = commande.status || "En cours";

        // Crée une carte pour chaque commande
        const card = document.createElement("div");
        card.classList.add("commande-card");
        card.innerHTML = `
            <div class="commande-number">Commande ${commande.numero}</div>
            <div class="commande-status ${statut === "Prête" ? "prete" : "en-cours"}">
                ${statut}
            </div>
        `;

        // Ajoute un événement pour charger la commande lorsqu'on clique sur la carte
        card.addEventListener("click", () => loadCommande(index));

        container.appendChild(card);
    });
}

// Fonction pour charger une commande dans l'interface
function loadCommande(index) {
    const commandes = getCommandes();
    const commande = commandes[index];

    // Affiche les détails de la commande
    document.getElementById("current-commande").textContent = commande.numero;

    const tableBody = document.getElementById("commande-table");
    tableBody.innerHTML = "";

    commande.produits.forEach((product, productIndex) => {
        const statusClass = product.status === "Validé" ? "valide" : "en-attente";
        const statusText = product.status || "En attente";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${product.codeProduit}</td>
            <td>${product.description}</td>
            <td>${product.quantite}</td>
            <td class="status ${statusClass}" id="status-${productIndex}">${statusText}</td>
            <td>
                <button class="validate-manually" data-index="${productIndex}">Valider manuellement</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById("preparation-interface").style.display = "block";

    // Attache des événements aux boutons "Valider manuellement"
    const buttons = document.querySelectorAll(".validate-manually");
    buttons.forEach(button => {
        button.addEventListener("click", () => validateManually(index, button.dataset.index));
    });
}

// Fonction pour valider un produit manuellement
function validateManually(commandeIndex, productIndex) {
    const commandes = getCommandes();
    const commande = commandes[commandeIndex];
    const product = commande.produits[productIndex];
    const statusCell = document.getElementById(`status-${productIndex}`);

    if (product.status === "Validé") {
        alert("Ce produit est déjà validé !");
        return;
    }

    // Met à jour le statut du produit
    product.status = "Validé";
    statusCell.textContent = product.status;
    statusCell.classList.remove("en-attente");
    statusCell.classList.add("valide");

    // Sauvegarde les modifications dans le LocalStorage
    saveCommandes(commandes);

    // Vérifie si tous les produits sont validés pour mettre à jour la commande
    checkIfCommandeIsReady(commandeIndex);
}

// Fonction pour vérifier si tous les produits d'une commande sont validés
function checkIfCommandeIsReady(commandeIndex) {
    const commandes = getCommandes();
    const commande = commandes[commandeIndex];

    const allValidated = commande.produits.every(product => product.status === "Validé");

    if (allValidated) {
        alert(`Commande ${commande.numero} prête !`);
        commande.status = "Prête";
        saveCommandes(commandes);
        renderCommandes();
    }
}

// Fonction d'initialisation (chargée au démarrage de la page)
document.addEventListener("DOMContentLoaded", renderCommandes);
