const qrCode = document.querySelector("#qrCode"),
      input = document.querySelector("#input"),
      errorMessage = document.querySelector("#error");
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (chrome.runtime.lastError) {
        showError(chrome.runtime.lastError.message);
        return;
    }
    if (!tabs[0] || typeof tabs[0].url !== 'string') {
        showError('The current tab URL is unavailable. Enter text below to generate a QR code.');
        return;
    }
    qrCode.data = tabs[0].url;
    input.value = tabs[0].url;
});

input.addEventListener('input', syncInputWithQRcode);

function syncInputWithQRcode() {
    var text = input.value.substring(0,500) || "";
    qrCode.data = text;
    input.value = text;
    input.rows = Math.max(1, Math.min(6, Math.floor(text.length/35)));
    errorMessage.hidden = true;
}

function showError(message) {
    console.error('QRify:', message);
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}
