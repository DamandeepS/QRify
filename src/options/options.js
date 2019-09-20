
// Saves options to chrome.storage
function save_options() {
    const darkMode = document.getElementById('darkMode').checked;
    chrome.storage.sync.set({
      darkMode
    }, function() {
      // Update status to let user know options were saved.
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      'darkMode': false
    }, function(items) {
      document.getElementById('darkMode').checked = items.darkMode;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('darkMode').addEventListener('click',
      save_options);
  