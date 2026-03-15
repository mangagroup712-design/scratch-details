
function toggleMenu() {
    document.getElementById('menu-btn').classList.toggle('open');
    document.getElementById('nav-menu').classList.toggle('open');
}

const page = location.pathname.split('/').pop();
if (page === 'Users.html' || page === '') document.getElementById('nav-users').classList.add('active');
if (page === 'ServerHealth.html') document.getElementById('nav-serverhealth').classList.add('active');

document.addEventListener('click', (e) => {
    if (!e.target.closest('#header') && !e.target.closest('#nav-menu')) {
        document.getElementById('menu-btn').classList.remove('open');
        document.getElementById('nav-menu').classList.remove('open');
    }
});

document.getElementById('health-info').innerHTML = `<p class="loading">Loading...</p>`;

fetch('https://api.codetabs.com/v1/proxy/?quest=https://api.scratch.mit.edu/health')
    .then(r => r.json())
    .then(data => {
        const fetchedAt = new Date().toLocaleString();
        const ts       = new Date(data.timestamp).toLocaleString();

        const totalSec = data.uptime;
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = Math.floor(totalSec % 60);
        const uptime = `${d}d ${h}h ${m}m ${s}s`;

        const cacheOk = data.cache.connected && data.cache.ready;

        const load0Color = data.load[0] > 2.0 ? 'val-bad' : data.load[0] > 1.0 ? 'val-warn' : 'val-good';
        const load1Color = data.load[1] > 2.0 ? 'val-bad' : data.load[1] > 1.0 ? 'val-warn' : 'val-good';
        const load2Color = data.load[2] > 2.0 ? 'val-bad' : data.load[2] > 1.0 ? 'val-warn' : 'val-good';

        let issues = [];
        if (!data.cache.connected) issues.push('Cache disconnected');
        if (!data.cache.ready)     issues.push('Cache not ready');
        if (data.load[0] > 2.0)   issues.push(`High load: ${data.load[0]}`);

        let dbRows = '';
        for (const [dbName, db] of Object.entries(data.sql)) {
            for (const [role, pool] of Object.entries(db)) {
                if (pool.destroyed)           issues.push(`${dbName}/${role}: destroyed`);
                if (pool.pendingAcquires > 0) issues.push(`${dbName}/${role}: pendingAcquires ${pool.pendingAcquires}`);
                if (pool.pendingCreates > 0)  issues.push(`${dbName}/${role}: pendingCreates ${pool.pendingCreates}`);

                const rowOk = !pool.destroyed && pool.pendingAcquires === 0 && pool.pendingCreates === 0;
                const badge = rowOk
                    ? `<span class="badge badge-ok">OK</span>`
                    : `<span class="badge badge-ng">NG</span>`;

                dbRows += `<tr>
                    <td class="db-name">${dbName}</td>
                    <td class="db-role">${role}</td>
                    <td>${badge}</td>
                    <td>${pool.numUsed} / ${pool.max}</td>
                    <td>${pool.numFree}</td>
                    <td>${pool.pendingAcquires}</td>
                    <td>${pool.pendingCreates}</td>
                    <td>${pool.ssl ? '🔒' : '—'}</td>
                    <td>${pool.destroyed ? '<span class="val-bad">yes</span>' : 'no'}</td>
                </tr>`;
            }
        }

        const healthy = issues.length === 0;
        const average = (data.load[0] + data.load[1] + data.load[2]) / 3;
        document.getElementById('health-info').innerHTML = `
            <div class="health-overall ${healthy ? 'overall-ok' : 'overall-ng'}">
                <h2>${healthy ? '✅ Healthy' : '⚠️ Degraded'}</h2>
                ${!healthy ? `<p class="issue-list">${issues.join(' / ')}</p>` : ''}
            </div>

            <div class="health-section">
                <div class="section-title">概要</div>
                <table class="info-table">
                    <tr><td>タイムスタンプ</td><td>${ts}</td></tr>
                    <tr><td>最終取得時刻</td><td>${fetchedAt}</td></tr>
                    <tr><td>稼働時間</td><td>${uptime}</td></tr>
                    <tr><td>Version</td><td class="mono">${data.version.slice(0, 8)}</td></tr>
                </table>
            </div>

            <div class="health-section">
                <div class="section-title">Cache</div>
                <table class="info-table">
                    <tr><td>Connected</td><td>${data.cache.connected ? '<span class="badge badge-ok">OK</span>' : '<span class="badge badge-ng">NG</span>'}</td></tr>
                    <tr><td>Ready</td><td>${data.cache.ready ? '<span class="badge badge-ok">OK</span>' : '<span class="badge badge-ng">NG</span>'}</td></tr>
                </table>
            </div>

            <div class="health-section">
                <div class="section-title">Load Average</div>
                <table class="info-table">
                    <tr><td>1 min</td><td class="${load0Color}">${data.load[0]}</td></tr>
                    <tr><td>5 min</td><td class="${load1Color}">${data.load[1]}</td></tr>
                    <tr><td>15 min</td><td class="${load2Color}">${data.load[2]}</td></tr>
                </table>
            </div>
        `;
    })
    .catch(() => {
        document.getElementById('health-info').innerHTML =
            `<p class="val-bad">❌ Unable to connect to Scratch API.</p>`;
    });