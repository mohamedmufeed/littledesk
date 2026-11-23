// LittleDesk Chrome Manifest V3 Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[LittleDesk] Extension installed successfully. Welcome to your personal comic scrapbook!');
  } else if (details.reason === 'update') {
    console.log('[LittleDesk] Extension updated to latest version.');
  }
});

// Periodic background alarm for syncing or reminder checks
chrome.alarms.create('littledesk_sync_alarm', {
  periodInMinutes: 30,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'littledesk_sync_alarm') {
    console.log('[LittleDesk] Background sync check triggered.');
  }
});

export {};
