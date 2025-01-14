// Fonction pour récupérer les commandes depuis le LocalStorage
function getCommandes() {
    return JSON.parse(localStorage.getItem("commandes")) || [];
}

// Fonction pour sauvegarder les commandes dans le LocalStorage
function saveCommandes(commandes) {
    localStorage.setItem("commandes", JSON.stringify(commandes));
}

// Fonction pour afficher les commandes sous forme de cartes
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
            <div class="actions">
                <button class="view-details" data-index="${index}">Détails</button>
                <button class="edit-commande" data-index="${index}">Modifier</button>
                <button class="delete-commande" data-index="${index}">Supprimer</button>
            </div>
        `;

        // Ajoute des gestionnaires d'événements aux boutons
        card.querySelector(".view-details").addEventListener("click", () => viewDetails(index));
        card.querySelector(".edit-commande").addEventListener("click", () => editCommande(index));
        card.querySelector(".delete-commande").addEventListener("click", () => deleteCommande(index));

        container.appendChild(card);
    });
}

// Fonction pour charger un fichier Excel et ajouter une commande
document.getElementById("add-commande").addEventListener("click", () => {
    const fileInput = document.getElementById("file-upload");
    const commandeNumber = document.getElementById("commande-number").value;

    if (!commandeNumber) {
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

        // Récupère les produits à partir des lignes du fichier Excel
        const produits = rows.slice(1).map(row => ({
            codeProduit: row[0],
            description: row[1],
            quantite: row[3],
        }));

        // Ajoute la commande dans le LocalStorage
        const commandes = getCommandes();
        commandes.push({ 
            numero: commandeNumber, 
            produits, 
            status: "En cours" 
        });
        saveCommandes(commandes);

        // Recharge l'affichage des commandes
        renderCommandes();
        alert(`Commande ${commandeNumber} ajoutée avec succès.`);
    };

    reader.readAsArrayBuffer(file);
});

// Fonction pour afficher les détails d'une commande

function viewDetails(index) {
    const commandes = getCommandes();
    const commande = commandes[index];

    const modal = document.getElementById("details-modal");
    const modalContent = modal.querySelector(".modal-content");

    // Contenu restructuré avec un tableau pour une présentation plus propre
    modalContent.innerHTML = `
        <h3>Détails de la commande ${commande.numero}</h3>
        <table>
            <thead>
                <tr>
                    <th>Code Produit</th>
                    <th>Description</th>
                    <th>Quantité</th>
                </tr>
            </thead>
            <tbody>
                ${commande.produits.map(product => `
                    <tr>
                        <td>${product.codeProduit}</td>
                        <td>${product.description}</td>
                        <td>${product.quantite}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        <div style="margin-top: 20px;">
            <button onclick="closeModal()">Fermer</button>
        </div>
    `;

    modal.style.display = "block";
}


// Fonction pour modifier une commande
function editCommande(index) {
    const commandes = getCommandes();
    const commande = commandes[index];

    const newNumber = prompt("Entrez le nouveau numéro de commande :", commande.numero);
    if (newNumber) {
        commande.numero = newNumber;
        saveCommandes(commandes);
        renderCommandes();
        alert(`Commande ${index} modifiée avec succès.`);
    }
}

// Fonction pour supprimer une commande
function deleteCommande(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
        const commandes = getCommandes();
        commandes.splice(index, 1);
        saveCommandes(commandes);
        renderCommandes();
        alert("Commande supprimée avec succès.");
    }
}

// Fonction pour fermer le modal
function closeModal() {
    const modal = document.getElementById("details-modal");
    modal.style.display = "none";
}

// Affiche les commandes lors du chargement de la page
document.addEventListener("DOMContentLoaded", renderCommandes);


// Gestion des produits (base de données)
function getProductDatabase() {
    return JSON.parse(localStorage.getItem("productDatabase")) || [];
}

function saveProductDatabase(products) {
    localStorage.setItem("productDatabase", JSON.stringify(products));
}

function renderProductDatabase() {
    const products = getProductDatabase();
    const productTableBody = document.getElementById("product-table-body");
    productTableBody.innerHTML = ""; // Efface les produits existants

    products.forEach(product => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${product.reference}</td>
            <td>${product.gencode}</td>
            <td>${product.description}</td>
        `;
        productTableBody.appendChild(tr);
    });
}

// Importer la base de données des produits via Excel
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

        // Vérification du format
        if (rows.length < 1 || rows[0].length < 3) {
            alert("Le fichier doit contenir au moins 3 colonnes : Référence, Gencode, Descriptif.");
            return;
        }

        // Structure des produits
        const products = rows.slice(1).map(row => ({
            reference: row[0],
            gencode: row[1],
            description: row[2]
        }));

        saveProductDatabase(products);

        renderProductDatabase();
        alert("Base de données des produits importée avec succès.");
    };

    reader.readAsArrayBuffer(file);
});


document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".menu-tab");
    const sections = document.querySelectorAll(".admin-section");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Supprime la classe "active" de tous les onglets et sections
            tabs.forEach(t => t.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            // Ajoute la classe "active" à l'onglet et la section correspondants
            tab.classList.add("active");
            const sectionId = tab.getAttribute("data-section");
            document.getElementById(sectionId).classList.add("active");
        });
    });
});


// Chargement initial des produits
document.addEventListener("DOMContentLoaded", renderProductDatabase);

