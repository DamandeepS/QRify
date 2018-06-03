chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({data: ''}, function(e) {
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'developer.chrome.com'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });


function HandleViewQR(info, tab) {
  let qrInput = "";
  if("selectionText" in info)
    qrInput = info["selectionText"].substr(0,500);
  if("linkUrl" in info) {
    qrInput = info["linkUrl"];
    while(qrInput.length>600) {
      var deepCopy = (' ' + qrInput).slice(1);
      var lastIndex = qrInput.lastIndexOf("/");
      if(lastIndex>0)
      qrInput = qrInput.substr(0,lastIndex)
      if(deepCopy==qrInput)
        break;
    }
  }
  chrome.storage.sync.set({data: qrInput}, function(e) {
  });

  chrome.tabs.executeScript({
    file: '/inject/inject.js'
  });
}

function HandleViewQRForPageURL(info, tab) {  
  chrome.storage.sync.set({data: tab["url"]}, function(e) {
  });
  
  chrome.tabs.executeScript({
    file: '/inject/inject.js'
  });
}
  

chrome.contextMenus.create({"title":"View QR for Selected link/text", "contexts": ["selection", "link"],  "onclick":  HandleViewQR});
chrome.contextMenus.create({"title":"View QR for Page URL", "contexts": ["all"],  "onclick":  HandleViewQRForPageURL});