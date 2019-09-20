const qrCode = document.querySelector("#qrCode"),
      input = document.querySelector("#input"),
      paste = document.querySelector("#paste");
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

paste.addEventListener('click', e => {
    input.focus();
    input.value="";
    document.execCommand('paste');
});

function syncInputWithQRcode() {
    var text = input.value.substring(0,1200) || "";
    qrCode.data = text;
    input.value = text;
    input.rows = Math.max((Math.floor(text.length/35) > 6) ? 6 : Math.floor(text.length/35), input.rows);
}

chrome.storage.sync.get({
  'darkMode': false
}, function(items) {
  if(items.darkMode)
  document.body.setAttribute('data-theme', items.darkMode ? 'dark' : '');
});


input.focus();
