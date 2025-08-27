function injectPromptCounterButton() {
  function getUserPromptCount() {
    return document.querySelectorAll('[data-message-author-role="user"]').length;
  }

  function showToast(message) {
    const existing = document.getElementById("chatgpt-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "chatgpt-toast";
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 30px;
      background-color: rgb(0, 200, 255);
      color: #000;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.addEventListener("transitionend", () => toast.remove());
    }, 2000);
  }

  function addButton() {
    
    const trailing = document.querySelector("div.flex.items-center.gap-2");
    if (!trailing) return;

    // prevent duplicate
    if (trailing.querySelector("#prompt-counter-btn")) return;

    const btn = document.createElement("button");
    btn.id = "prompt-counter-btn";
    btn.type = "button";
    btn.textContent = "🌳";
    btn.className = "flex h-9 items-center justify-center rounded-full disabled:text-gray-50 disabled:opacity-30 w-9 composer-secondary-button-color hover:opacity-80"; // reuse ChatGPT button styling

    btn.addEventListener("click", () => {
      const count = getUserPromptCount();
      addDashboard(count);
      showToast(`Prompts in this chat: ${count}`);
      chrome.runtime.sendMessage({
        type: "PROMPT_COUNT_REQUESTED",
        count,
      });
    });

    trailing.appendChild(btn);
  }

  function addDashboard(count) {
    const newChatDiv = document.querySelector("aside.relative.bg-token-bg-elevated-secondary");
    if (!newChatDiv) return;

    let db = newChatDiv.querySelector("#prompt-counter-db");

    if (!db) {
      // create container if it doesn't exist yet
      db = document.createElement("div");
      db.id = "prompt-counter-db";
      db.className =
        "group __menu-item hoverable p-3 my-3 rounded-lg shadow border border-green-600 hover:border-2";
      // db.style.cursor = "default";

      db.innerHTML = `
        <div class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Prompts Sent
          </span>
          <span id="prompt-count-value" 
                class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${count}
          </span>
        </div>
      `;

      newChatDiv.appendChild(db);
    } else {
      // update existing counter
      const countEl =  db.querySelector("#prompt-count-value");
      if (countEl) countEl.textContent = count;
    }
  }

  const observer = new MutationObserver(() => addButton());
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial attempt
  addButton();
  addDashboard(getUserPromptCount());
}

window.addEventListener("load", injectPromptCounterButton);
