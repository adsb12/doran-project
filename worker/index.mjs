const page = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="초대 링크 하나로 친구와 나누는 대화">
<title>도란 — 친구와 채팅</title>
<style>
*{box-sizing:border-box} :root{color-scheme:light;--ink:#252135;--muted:#655e73;--accent:#6243c4;--line:#eae4f3;--soft:#f2ecff}
body{margin:0;min-height:100dvh;background:radial-gradient(ellipse at top left,#eee4ff,transparent 58%),#f8f6fb;color:var(--ink);font:16px system-ui,sans-serif}
.shell{max-width:820px;margin:auto;padding:33px 24px 26px}.brand,.top,.composer{display:flex;align-items:center;gap:12px}.brand{font-size:25px;font-weight:850;letter-spacing:-.06em;margin-bottom:22px}.mark,.empty-icon{display:grid;place-items:center;background:var(--accent);color:white;border-radius:13px;width:40px;height:40px;letter-spacing:.1em;font-weight:900}.card{border:1px solid var(--line);border-radius:26px;background:#fff;box-shadow:0 18px 55px #3b226313;overflow:hidden}.top{padding:20px 24px;border-bottom:1px solid var(--line);justify-content:space-between}.top h1{margin:0;font-size:21px;letter-spacing:-.04em}.status{margin:4px 0 0;color:var(--muted);font-size:13px}.status:before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;background:#9b92ac}.status.ready:before{background:#32a371}
button,input{font:inherit}button{cursor:pointer;border:0;font-weight:750;border-radius:12px;padding:11px 15px;white-space:nowrap}button:disabled{opacity:.55;cursor:default}.primary{background:var(--accent);color:white}.secondary{background:var(--soft);color:#5235a5}.quiet{background:white;color:var(--muted);padding:8px 10px}.footer{border-top:1px solid var(--line);padding:14px 24px}.identity{display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:13px;margin:0 0 7px}.composer input,.join input{width:100%;min-width:0;border:1px solid #ded6eb;padding:12px 14px;border-radius:12px;color:var(--ink);background:#fcfbfe}button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.history{height:clamp(240px,52dvh,540px);overflow:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px}.empty{margin:auto;text-align:center;color:var(--muted)}.empty strong{display:block;color:var(--ink);font-size:20px;margin:13px 0 5px}.empty-icon{margin:auto;width:58px;height:58px;background:var(--soft);color:var(--accent);border-radius:19px;font-size:22px}.message{align-self:flex-start;max-width:83%}.message.mine{align-self:flex-end}.meta{color:var(--muted);font-size:12px;margin:0 3px 5px}.mine .meta{text-align:right}.bubble{border-radius:5px 15px 15px;background:#f1edf6;padding:9px 13px;margin:0;overflow-wrap:anywhere;white-space:pre-wrap}.mine .bubble{border-radius:15px 5px 15px 15px;background:var(--accent);color:white}.feedback{font-size:13px;color:var(--muted);min-height:1.3em;margin:7px 0 0}.join{padding:42px 26px;max-width:430px;margin:auto}.join h1{margin:0;letter-spacing:-.05em}.join p{color:var(--muted);line-height:1.55}.join label{display:block;font-size:14px;font-weight:750;margin:24px 0 7px}.join button{width:100%;margin-top:12px}.outside{display:block;margin:8px 0 0 auto;background:transparent}.manual{width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;font:inherit}[hidden]{display:none!important}
@media(max-width:520px){.shell{padding:18px 12px}.brand{margin-bottom:14px}.top,.history,.footer{padding-left:14px;padding-right:14px}.top{padding-top:14px;padding-bottom:14px}.card{border-radius:19px}.composer{gap:7px}}
</style>
</head>
<body><main class="shell">
<div class="brand"><span class="mark" aria-hidden="true">···</span> 도란</div>
<section id="welcome" class="card">
<form id="join" class="join"><h1 id="welcome-title">친구와 대화하기</h1><p id="welcome-copy">채팅방을 만들고 친구에게 초대 링크를 보내세요.</p>
<label for="nickname">닉네임</label><input id="nickname" required maxlength="24" placeholder="친구가 알아볼 이름" autocomplete="nickname">
<button id="join-button" class="primary">채팅방 만들기</button><button type="button" id="back" class="quiet" hidden>돌아가기</button></form>
</section>
<section id="chat" class="card" hidden>
<header class="top"><div><h1>친구 채팅방</h1><p id="status" class="status" role="status">연결 중</p></div><button id="invite" class="secondary">초대 링크 복사</button></header>
<div id="history" class="history" role="log" aria-label="채팅 기록" tabindex="0">
<div id="empty" class="empty"><div class="empty-icon" aria-hidden="true">···</div><strong>첫 인사를 건네보세요</strong>친구가 초대 링크를 열면 함께 대화할 수 있어요.</div>
</div>
<div class="footer">
<div class="identity"><span id="my-name"></span><button id="rename" class="quiet">닉네임 변경</button></div>
<form class="composer" id="compose"><input id="draft" aria-label="메시지" placeholder="메시지 쓰기" maxlength="1000" required autocomplete="off"><button id="send" class="primary">보내기</button></form>
<p id="feedback" class="feedback" role="status"></p><input id="manual" class="manual" aria-label="초대 링크" readonly hidden>
</div></section>
<button id="new-room" class="quiet outside" hidden>새 채팅방 만들기</button>
</main>
<script>
const el = id => document.getElementById(id);
const roomPattern = /^[a-f0-9]{32}$/;
const requested = new URL(location.href).searchParams.get('room') || '';
const room = roomPattern.test(requested) ? requested : '';
const clientKey = 'doran-client';
const nameKey = 'doran-nickname';
const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2,'0')).join('');
const storedClient = read(clientKey);
const client = roomPattern.test(storedClient || '') ? storedClient : randomId();
save(clientKey, client);
let nickname = read(nameKey) || '';
let cursor = 0;
let socket;
let reconnectTimer;
let reconnectDelay = 500;
let loading = false;
let needsRefresh = false;
let initialized = false;
const historyBox = el('history');
const url = '/api/rooms/' + room;
const time = new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit'});

function showRoom() {
  el('welcome').hidden = true;
  el('chat').hidden = false;
  el('new-room').hidden = false;
  el('my-name').textContent = '내 닉네임 · ' + nickname;
  connect();
}
function addMessage(message) {
  const item = document.createElement('article');
  item.className = 'message' + (message.client === client ? ' mine' : '');
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = message.nickname + ' · ' + time.format(message.sent_at);
  const body = document.createElement('p');
  body.className = 'bubble';
  body.textContent = message.body;
  item.append(meta, body);
  historyBox.append(item);
  el('empty').hidden = true;
}
function setConnected(connected) {
  el('status').textContent = connected ? '연결됨' : '다시 연결하는 중';
  el('status').classList.toggle('ready', connected);
}
function connect() {
  if (socket || reconnectTimer) return;
  const address = new URL(url + '/socket', location.href);
  address.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const connection = new WebSocket(address);
  socket = connection;
  connection.addEventListener('open', () => { refresh(); });
  connection.addEventListener('message', event => {
    if (event.data === 'update') refresh();
  });
  connection.addEventListener('close', () => {
    socket = undefined;
    setConnected(false);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 10000);
  });
}
async function refresh() {
  needsRefresh = true;
  if (loading) return;
  loading = true;
  try {
    while (needsRefresh) {
      needsRefresh = false;
      const after = initialized ? cursor : '';
      const response = await fetch(url + '?after=' + after, {signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error();
      const messages = await response.json();
      const nearBottom = historyBox.scrollHeight - historyBox.scrollTop - historyBox.clientHeight < 85;
      for (const message of messages) {
        addMessage(message);
        cursor = message.id;
      }
      if (initialized && messages.length === 100) needsRefresh = true;
      initialized = true;
      if (nearBottom && messages.length) historyBox.scrollTop = historyBox.scrollHeight;
    }
    if (socket?.readyState === WebSocket.OPEN) {
      reconnectDelay = 500;
      setConnected(true);
    }
  } catch {
    setConnected(false);
    socket?.close();
  } finally { loading = false; }
}
el('nickname').value = nickname;
if (room) {
  el('welcome-title').textContent = '친구 채팅방에 초대됐어요';
  el('welcome-copy').textContent = '대화에 사용할 닉네임을 입력하세요.';
  el('join-button').textContent = '입장하기';
  if (nickname) showRoom();
}
el('join').addEventListener('submit', event => {
  event.preventDefault();
  const value = el('nickname').value.trim();
  if (!value) { el('nickname').focus(); return; }
  nickname = value;
  save(nameKey,nickname);
  if (!room) { location.href = '/?room=' + randomId(); return; }
  showRoom();
  el('draft').focus();
});
el('rename').onclick = () => {
  el('welcome-title').textContent = '닉네임 변경';
  el('welcome-copy').textContent = '새로 보내는 메시지에 사용할 이름이에요.';
  el('join-button').textContent = '저장';
  el('back').hidden = false;
  el('chat').hidden = true;
  el('new-room').hidden = true;
  el('welcome').hidden = false;
  el('nickname').value = nickname;
  el('nickname').focus();
};
el('back').onclick = showRoom;
el('new-room').onclick = () => { location.href = '/'; };
el('invite').onclick = async () => {
  const link = new URL('/?room=' + room, location.origin).href;
  try {
    await navigator.clipboard.writeText(link);
    el('manual').hidden = true;
    el('feedback').textContent = '초대 링크를 복사했어요.';
  } catch {
    el('manual').hidden = false;
    el('manual').value = link;
    el('manual').select();
    el('feedback').textContent = '아래 링크를 복사해 친구에게 보내세요.';
  }
};
el('compose').addEventListener('submit', async event => {
  event.preventDefault();
  const draft = el('draft');
  const body = draft.value.trim();
  if (!body || el('send').disabled) return;
  const previous = draft.value;
  el('send').disabled = true;
  try {
    const response = await fetch(url,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({client,nickname,body}),signal:AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error();
    if (draft.value === previous) draft.value = '';
    el('feedback').textContent = '';
    historyBox.scrollTop = historyBox.scrollHeight;
  } catch { el('feedback').textContent = '전송 상태를 확인하지 못했어요. 대화 기록을 확인해 주세요.'; }
  finally { el('send').disabled = false; draft.focus(); }
});
</script></body></html>`;

const noCache = {'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
const json = (value, status = 200) => Response.json(value, {status, headers:noCache});
const idPattern = /^[a-f0-9]{32}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(page, {headers:{...noCache,'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff'}});
    }
    const route = /^\/api\/rooms\/([a-f0-9]{32})(\/socket)?$/.exec(url.pathname);
    if (!route) return json({error:'찾을 수 없어요.'},404);
    const room = route[1];
    try {
      if (route[2] || request.method === 'POST') {
        if (route[2] && request.headers.get('Origin') !== url.origin) {
          return json({error:'허용되지 않는 연결이에요.'},403);
        }
        return await env.CHAT_ROOMS.getByName(room).fetch(request);
      }
      if (request.method === 'GET') {
        const rawAfter = url.searchParams.get('after');
        const after = rawAfter ? Number(rawAfter) : null;
        if (after !== null && (!Number.isSafeInteger(after) || after < 0)) return json({error:'잘못된 요청이에요.'},400);
        const query = after !== null
          ? env.DB.prepare('SELECT id, client, nickname, body, sent_at FROM messages WHERE room = ? AND id > ? ORDER BY id LIMIT 100').bind(room, after)
          : env.DB.prepare('SELECT id, client, nickname, body, sent_at FROM messages WHERE room = ? ORDER BY id DESC LIMIT 100').bind(room);
        const {results} = await query.all();
        return json(after !== null ? results : results.reverse());
      }
      return json({error:'지원하지 않는 요청이에요.'},405);
    } catch {
      return json({error:'채팅 서버에 연결할 수 없어요.'},503);
    }
  }
};

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/socket')) {
      if (request.method !== 'GET' || request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return json({error:'웹소켓 연결이 필요해요.'},426);
      }
      const [client, server] = Object.values(new WebSocketPair());
      this.state.acceptWebSocket(server);
      return new Response(null, {status:101, webSocket:client});
    }

    const room = url.pathname.split('/').at(-1);
    if (request.method !== 'POST') return json({error:'지원하지 않는 요청이에요.'},405);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'잘못된 요청이에요.'},415);
    const reader = request.body?.getReader();
    if (!reader) return json({error:'잘못된 요청이에요.'},400);
    const decoder = new TextDecoder();
    let payload = '';
    let size = 0;
    for (;;) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return json({error:'메시지가 너무 길어요.'},413);
      }
      payload += decoder.decode(value,{stream:true});
    }
    let data;
    try { data = JSON.parse(payload + decoder.decode()); }
    catch { return json({error:'잘못된 요청이에요.'},400); }
    const client = data?.client;
    const nickname = typeof data?.nickname === 'string' ? data.nickname.trim() : '';
    const body = typeof data?.body === 'string' ? data.body.trim() : '';
    if (typeof client !== 'string' || !idPattern.test(client) || !nickname || nickname.length > 24 || !body || body.length > 1000) {
      return json({error:'닉네임과 메시지를 확인해 주세요.'},400);
    }
    await this.env.DB.prepare('INSERT INTO messages (room, client, nickname, body, sent_at) VALUES (?, ?, ?, ?, ?)').bind(room, client, nickname, body, Date.now()).run();
    for (const socket of this.state.getWebSockets()) {
      try { socket.send('update'); } catch { /* The client may have disconnected. */ }
    }
    return json({ok:true},201);
  }

  webSocketClose(socket, code) {
    socket.close(code === 1005 || code === 1006 ? 1000 : code);
  }

  webSocketMessage(socket) {
    socket.close(1008, 'This connection only sends updates');
  }
}
