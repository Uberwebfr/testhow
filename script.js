// Scanner de code-barres avec HTML5
let html5QrcodeScanner;
document.getElementById("start-camera").addEventListener("click", () => {
    const videoElement = document.getElementById("barcode-video");
    videoElement.style.display = "block";

    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("barcode-video");
    }

    html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => handleBarcodeScan(decodedText),
        (errorMessage) => console.error("Erreur de scan : ", errorMessage)
    ).catch(err => console.error("Impossible de démarrer le scanner :", err));
});

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
    alert(found ? `Code-barres ${scannedBarcode} validé.` : `Code-barres ${scannedBarcode} introuvable.`);
}
