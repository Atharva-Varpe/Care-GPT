function countPrompt() {
  let lastCount = 0;
  let debounceTimeout;

  function getUserPromptCount() {
    return document.querySelectorAll('[data-message-author-role="user"]').length;
  }

  function showToast(message = "✅ Prompt Sent") {
    // Prevent multiple toasts from stacking
    const existing = document.getElementById("chatgpt-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "chatgpt-toast";
    toast.textContent = message;

    // Style the toast
    toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color:rgb(15, 219, 0);
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 205, 68, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.addEventListener("transitionend", () => toast.remove());
    }, 2000); // visible for 2 seconds
  }

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      // Ignore mutations triggered by the toast
      if (mutation.target.id === "chatgpt-toast" || document.getElementById("chatgpt-toast")) {
        return;
      }
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const currentCount = getUserPromptCount();

      if (currentCount > lastCount) {
        const newPrompts = currentCount - lastCount;
        lastCount = currentCount;

        chrome.runtime.sendMessage({
          type: 'PROMPT_ADDED',
          count: newPrompts,
          tabId: chrome.runtime.id
        });

        showToast(`Prompt ${lastCount}`);
      }
    }, 500);
  });


  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial check after load
  setTimeout(() => {
    lastCount = getUserPromptCount();

    chrome.runtime.sendMessage({
      type: 'PROMPT_ADDED',
      count: lastCount,
      tabId: chrome.runtime.id
    });

    showToast(`New prompt! Current prompts done: ${currentCount}`);

  }, 1500);


}

window.addEventListener('load', countPrompt);
