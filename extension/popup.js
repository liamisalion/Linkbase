let serverUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['serverUrl'], (result) => {
    if (result.serverUrl) {
      serverUrl = result.serverUrl;
      document.getElementById('serverUrl').value = serverUrl;
    }
  });

  document.getElementById('serverUrl').addEventListener('change', (e) => {
    serverUrl = e.target.value.replace(/\/+$/, '');
    chrome.storage.local.set({ serverUrl });
  });
});

function switchTab(tab) {
  document.getElementById('tabContact').className = tab === 'contact' ? 'tab active' : 'tab';
  document.getElementById('tabPost').className = tab === 'post' ? 'tab active' : 'tab';
  document.getElementById('contactForm').style.display = tab === 'contact' ? '' : 'none';
  document.getElementById('postForm').style.display = tab === 'post' ? '' : 'none';
}

async function testConnection() {
  const statusEl = document.getElementById('connStatus');
  statusEl.innerHTML = '<div class="status status-info">测试中...</div>';
  try {
    const res = await fetch(`${serverUrl}/api/contacts`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      statusEl.innerHTML = '<div class="status status-success">✓ 连接成功</div>';
    } else {
      statusEl.innerHTML = '<div class="status status-error">✗ 服务器返回错误</div>';
    }
  } catch {
    statusEl.innerHTML = '<div class="status status-error">✗ 无法连接到 LinkBase 服务器</div>';
  }
}

async function saveContact() {
  const btn = document.getElementById('saveContactBtn');
  const statusEl = document.getElementById('contactStatus');
  btn.disabled = true;
  statusEl.innerHTML = '<div class="status status-info">保存中...</div>';

  const data = {
    name: document.getElementById('name').value,
    company: document.getElementById('company').value,
    title: document.getElementById('title').value,
    type: document.getElementById('type').value,
    notes: document.getElementById('notes').value,
  };

  if (!data.name.trim()) {
    statusEl.innerHTML = '<div class="status status-error">请填写姓名</div>';
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(`${serverUrl}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      statusEl.innerHTML = '<div class="status status-success">✓ 联系人已保存到 LinkBase</div>';
      document.getElementById('name').value = '';
      document.getElementById('company').value = '';
      document.getElementById('title').value = '';
      document.getElementById('notes').value = '';
    } else {
      statusEl.innerHTML = '<div class="status status-error">✗ 保存失败</div>';
    }
  } catch {
    statusEl.innerHTML = '<div class="status status-error">✗ 无法连接到 LinkBase</div>';
  }
  btn.disabled = false;
}

async function savePost() {
  const btn = document.getElementById('savePostBtn');
  const statusEl = document.getElementById('postStatus');
  btn.disabled = true;
  statusEl.innerHTML = '<div class="status status-info">保存中...</div>';

  const data = {
    type: 'text',
    data: `社媒动态 [${document.getElementById('postPlatform').value}]\n发布者: ${document.getElementById('postPerson').value} (${document.getElementById('postCompany').value})\n\n${document.getElementById('postContent').value}`,
  };

  if (!document.getElementById('postContent').value.trim()) {
    statusEl.innerHTML = '<div class="status status-error">请填写动态内容</div>';
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(`${serverUrl}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      statusEl.innerHTML = '<div class="status status-success">✓ 动态已保存到 LinkBase</div>';
      document.getElementById('postContent').value = '';
      document.getElementById('postPerson').value = '';
      document.getElementById('postCompany').value = '';
    } else {
      statusEl.innerHTML = '<div class="status status-error">✗ 保存失败</div>';
    }
  } catch {
    statusEl.innerHTML = '<div class="status status-error">✗ 无法连接到 LinkBase</div>';
  }
  btn.disabled = false;
}
