// Chargement des données Excel
document.getElementById("load-data").addEventListener("click", () => {
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

        // Extract data: Assume header row is at index 0
        const tableBody = document.getElementById("commande-table");
        tableBody.innerHTML = ""; // Clear previous data
        rows.slice(1).forEach(row => {
            const [codeProduit, description, , quantite] = row;
            if (codeProduit && description && quantite) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${codeProduit}</td>
                    <td>${description}</td>
                    <td>${quantite}</td>
                    <td><input type="text" class="barcode" value="${codeProduit}" readonly></td>
                    <td class="status">En attente</td>
                `;
                tableBody.appendChild(tr);
            }
        });

        document.getElementById("current-commande").textContent = commandeNumber;
        document.getElementById("admin-interface").style.display = "none";
        document.getElementById("preparation-interface").style.display = "block";
    };

    reader.readAsArrayBuffer(file);
});

// Gestion du scan de code-barres via caméra
let html5QrcodeScanner;
document.getElementById("start-camera").addEventListener("click", () => {
    const videoElement = document.getElementById("barcode-video");
    videoElement.style.display = "block";

    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("barcode-video");
    }

    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Utilise la caméra arrière
        {
            fps: 10,
            qrbox: 250,
        },
        (decodedText) => {
            handleBarcodeScan(decodedText);
        },
        (errorMessage) => {
            console.error("Erreur de scan : ", errorMessage);
        }
    ).catch(err => {
        console.error("Impossible de démarrer le scanner :", err);
    });
});

// Fonction pour traiter un code-barres scanné
function handleBarcodeScan(scannedBarcode) {
    const rows = document.querySelectorAll("#commande-table tr");

    let found = false;
    rows.forEach(row => {
        const barcodeInput = row.querySelector(".barcode");
        const statusCell = row.querySelector(".status");

        if (barcodeInput.value === scannedBarcode && statusCell.textContent === "En attente") {
            statusCell.textContent = "Validé";
            statusCell.style.color = "green";
            found = true;
        }
    });

    if (found) {
        alert(`Produit avec code-barres ${scannedBarcode} validé.`);
    } else {
        alert(`Code-barres ${scannedBarcode} non trouvé dans la commande.`);
    }
}
