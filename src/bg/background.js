importScripts('../../inject/inject.js');

const selectionMenuId = 'qrify-selection';
const pageMenuId = 'qrify-page';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error('QRify: could not reset context menus', chrome.runtime.lastError.message);
      return;
    }
    const menus = [
      {
        id: selectionMenuId,
        title: 'View QR for Selected link/text',
        contexts: ['selection', 'link']
      },
      {
        id: pageMenuId,
        title: 'View QR for Page URL',
        contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video']
      }
    ];
    for (const menu of menus) {
      chrome.contextMenus.create(menu, () => {
        if (chrome.runtime.lastError) {
          console.error('QRify: could not create context menu', chrome.runtime.lastError.message);
        }
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener(handleContextMenu);

async function handleContextMenu(info, tab) {
  if (info.menuItemId !== selectionMenuId && info.menuItemId !== pageMenuId) {
    return;
  }
  try {
    if (!tab || !Number.isInteger(tab.id)) {
      throw new Error('No tab is available for this context menu.');
    }
    let data = tab.url;
    if (info.menuItemId === selectionMenuId) {
      data = (info.selectionText || '').slice(0, 500);
      if (info.linkUrl) {
        data = info.linkUrl;
        while (data.length > 600) {
          const lastSlash = data.lastIndexOf('/');
          if (lastSlash <= 0) break;
          data = data.slice(0, lastSlash);
        }
      }
    }
    if (typeof data !== 'string' || !data) {
      throw new Error('No text or URL is available to encode.');
    }
    const target = {tabId: tab.id};
    await chrome.scripting.executeScript({
      target,
      files: ['js/qr-code.js']
    });
    const results = await chrome.scripting.executeScript({
      target,
      func: showQRCode,
      args: [data]
    });
    if (results[0]?.result !== true) {
      throw new Error('The QR overlay did not finish rendering. Check the tab console for details.');
    }
    await chrome.action.setBadgeText({tabId: tab.id, text: ''});
    await chrome.action.setTitle({tabId: tab.id, title: 'QRify'});
  } catch (error) {
    console.error('QRify: could not display QR code', error);
    if (tab && Number.isInteger(tab.id)) {
      await chrome.action.setBadgeText({tabId: tab.id, text: 'ERR'});
      await chrome.action.setTitle({
        tabId: tab.id,
        title: 'QRify: cannot display QR on this page. Try the toolbar popup.'
      });
    }
  }
}
