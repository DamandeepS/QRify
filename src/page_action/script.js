const qrCode = document.querySelector("#qrCode"),
      label = document.querySelector("#label");
chrome.storage.sync.get('data', function(data) {
    qrCode.data = data.data;
    label.innerHTML = data.data;
    console.log(data)
});