const qrCode = document.querySelector("#qrCode"),
      input = document.querySelector("#input");
chrome.tabs.getSelected(null,function(tab) {
    var tablink = tab.url;
    qrCode.data = tablink;
    input.value = tablink;
});

input.addEventListener('keyup', e => {
  qrCode.data = input.value;
  if(e.keyCode==13 && input.rows<5)
    input.rows++;
})
