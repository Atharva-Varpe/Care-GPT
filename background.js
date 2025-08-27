let totalPromptCount = 0;
const tabPromptCounts = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROMPT_ADDED') {
    const tabId = sender.tab.id;

    if (!tabPromptCounts[tabId]) {
      tabPromptCounts[tabId] = 0;
    }

    tabPromptCounts[tabId] += message.count;
    console.log("Prompt count incremented.");
    totalPromptCount += message.count;

    console.log("Prompt count update triggered.");
    chrome.storage.local.set({ totalPromptCount });

    console.log("[BG] Badge text being set to:", totalPromptCount);
    chrome.action.setBadgeText({ text: totalPromptCount.toString() });
  }
});


// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get('totalPromptCount', (result) => {
    totalPromptCount = result.totalPromptCount || 0;
    chrome.action.setBadgeText({ text: totalPromptCount.toString() });
  });
}); 