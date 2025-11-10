chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AUTH_TOKEN") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error("Failed to get auth token:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }
      sendResponse({ success: true, token });
    });

    return true;
  }
});
