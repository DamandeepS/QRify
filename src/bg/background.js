// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({data: ''}, function(e) {
      console.log(e)
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
  // console.log("item " + info.menuItemId + " was clicked");
  let qrInput = "";
  if("selectionText" in info)
  qrInput = info["selectionText"].substr(0,500);
  if("linkUrl" in info)
  qrInput = info["linkUrl"];
  console.log(info, qrInput);
  
  chrome.storage.sync.set({data: qrInput}, function(e) {
    console.log(e)
  });

  chrome.tabs.executeScript({
    file: '/inject/inject.js'
  });
}

function HandleViewQRForPageURL(info, tab) {
  console.log(info, info["pageUrl"]);
  
  chrome.storage.sync.set({data: info["pageUrl"]}, function(e) {
    console.log(e)
  });
  
  chrome.tabs.executeScript({
    file: '/inject/inject.js'
  });
}
  

chrome.contextMenus.create({"title":"View QR", "contexts": ["selection", "link"],  "onclick":  HandleViewQR});
chrome.contextMenus.create({"title":"View QR for Page URL", "contexts": ["all"],  "onclick":  HandleViewQRForPageURL});

