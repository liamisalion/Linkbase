(function() {
  let serverUrl = 'http://localhost:3000';

  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['serverUrl'], (result) => {
      if (result.serverUrl) serverUrl = result.serverUrl;
    });
  }

  function createButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'linkloop-save-btn';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(btn);
    });
    return btn;
  }

  function showFeedback(btn, success) {
    const orig = btn.textContent;
    btn.textContent = success ? '✓ 已保存' : '✗ 失败';
    btn.style.background = success ? '#057642' : '#b42318';
    btn.style.color = 'white';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
  }

  function initLinkedIn() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.feed-shared-update-v2:not([data-lb])').forEach(post => {
        post.setAttribute('data-lb', '1');
        const actionsBar = post.querySelector('.social-details-social-counts') ||
                          post.querySelector('.feed-shared-social-action-bar');
        if (!actionsBar) return;

        const btn = createButton('📌 保存到 LinkLoop', async (b) => {
          const text = post.querySelector('.feed-shared-text')?.textContent?.trim() || '';
          const author = post.querySelector('.update-components-actor__name')?.textContent?.trim() || '';
          const subtitle = post.querySelector('.update-components-actor__description')?.textContent?.trim() || '';

          try {
            const res = await fetch(`${serverUrl}/api/import`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'text', data: `社媒动态 [LinkedIn]\n发布者: ${author} (${subtitle})\n\n${text}` }),
            });
            showFeedback(b, res.ok);
          } catch { showFeedback(b, false); }
        });
        actionsBar.appendChild(btn);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initTwitter() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('article[data-testid="tweet"]:not([data-lb])').forEach(tweet => {
        tweet.setAttribute('data-lb', '1');
        const actionsBar = tweet.querySelector('[role="group"]');
        if (!actionsBar) return;

        const btn = createButton('📌 LL', async (b) => {
          const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || '';
          const author = tweet.querySelector('[data-testid="User-Name"]')?.textContent?.trim() || '';

          try {
            const res = await fetch(`${serverUrl}/api/import`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'text', data: `社媒动态 [X]\n发布者: ${author}\n\n${text}` }),
            });
            showFeedback(b, res.ok);
          } catch { showFeedback(b, false); }
        });
        actionsBar.appendChild(btn);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (location.hostname.includes('linkedin.com')) initLinkedIn();
  else if (location.hostname.includes('twitter.com') || location.hostname.includes('x.com')) initTwitter();
})();
