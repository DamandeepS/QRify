const qrCode = document.querySelector("#qrCode"),
      input = document.querySelector("#input");
chrome.tabs.getSelected(null,function(tab) {
    var tablink = tab.url;
    qrCode.data = tablink;
    input.value = tablink;
});

input.addEventListener('keyup', e => {
  syncInputWithQRcode();
})

input.addEventListener('input', e=> {
  syncInputWithQRcode();
})

function syncInputWithQRcode() {
    var text = input.value.substring(0,500) || "";
    qrCode.data = text;
    input.value = text;
    input.rows = (Math.floor(text.length/35) > 6) ? 6 : Math.floor(text.length/35);
}
