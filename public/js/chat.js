/* chat.js — MannMitra client-side chat logic */

const messagesEl = document.getElementById('chatMessages');
const inputEl    = document.getElementById('messageInput');
const sendBtn    = document.getElementById('sendBtn');
const quickEl    = document.getElementById('quickReplies');

// ── Helpers ────────────────────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── Render a single message bubble ────────────────────────────────────────
function addMessage(text, role) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'bot' ? '🌿' : '🙂';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = getTime();

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';

  if (role === 'user') {
    content.style.alignItems = 'flex-end';
  }

  content.appendChild(bubble);
  content.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(content);

  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

// ── Show/hide typing indicator ─────────────────────────────────────────────
function showTyping() {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '🌿';

  const dots = document.createElement('div');
  dots.className = 'typing-dots';
  dots.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

  indicator.appendChild(avatar);
  indicator.appendChild(dots);
  messagesEl.appendChild(indicator);
  scrollToBottom();
}

function hideTyping() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
}

// ── Show crisis alert in chat ──────────────────────────────────────────────
function showCrisisAlert(crisisMessage) {
  const alertEl = document.createElement('div');
  alertEl.className = 'crisis-alert';

  const title = document.createElement('div');
  title.className = 'crisis-alert-title';
  title.textContent = '🚨 Immediate Support Available';

  const body = document.createElement('p');
  body.textContent = crisisMessage;

  const link = document.createElement('a');
  link.href = 'support.html';
  link.className = 'btn btn-primary';
  link.style.cssText = 'font-size:0.88rem; padding:0.55rem 1.1rem;';
  link.textContent = '📋 Book a Session Now';

  alertEl.appendChild(title);
  alertEl.appendChild(body);
  alertEl.appendChild(link);

  messagesEl.appendChild(alertEl);
  scrollToBottom();
}

// ── Send message to backend ────────────────────────────────────────────────
async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Hide quick replies after first use
  if (quickEl) quickEl.style.display = 'none';

  addMessage(trimmed, 'user');
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;
  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed })
    });

    const data = await res.json();
    hideTyping();

    if (res.ok) {
      addMessage(data.reply, 'bot');
      if (data.crisis && data.crisisMessage) {
        showCrisisAlert(data.crisisMessage);
      }
    } else {
      addMessage('I\'m sorry, something went wrong. Please try again.', 'bot');
    }
  } catch {
    hideTyping();
    addMessage(
      'I\'m having trouble connecting right now. Please check your internet and try again. If you\'re in crisis, please call 112 or 9152987821.',
      'bot'
    );
  }

  sendBtn.disabled = false;
  inputEl.focus();
}

// ── Auto-resize textarea ───────────────────────────────────────────────────
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

// ── Send on Enter (Shift+Enter for new line) ───────────────────────────────
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(inputEl.value);
  }
});

// ── Send button click ──────────────────────────────────────────────────────
sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

// ── Quick reply buttons ────────────────────────────────────────────────────
if (quickEl) {
  quickEl.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.msg));
  });
}

// ── Welcome message on load ────────────────────────────────────────────────
(function init() {
  const welcomeMsg =
    'Namaste! 🙏 I\'m MannMitra, your mental wellness companion.\n\n' +
    'This is a safe, private space — you can share anything that\'s on your mind. ' +
    'I\'m here to listen and support you.\n\n' +
    'How are you feeling today?';
  addMessage(welcomeMsg, 'bot');
  inputEl.focus();
})();
