(() => {
    'use strict';
    const TOKEN = '7819eeae802e40029011af81f293f5d3';
    const { protocol, hostname, pathname } = window.location;
    if (protocol !== 'https:' || hostname !== 'benlscore.github.io' ||
        !(pathname === '/vicboss' || pathname.startsWith('/vicboss/'))) return;
    if (!/^[a-f0-9]{32}$/i.test(TOKEN)) return;
    if (document.getElementById('vicboss-analytics-beacon')) return;

    const script = document.createElement('script');
    script.id = 'vicboss-analytics-beacon';
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.async = true;
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));
    // Analytics is independent of loading, editing and exporting saves.
    document.head.appendChild(script);
})();