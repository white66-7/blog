function parseName(fn) {
    var n = fn.replace(/\.(mp3|aac|flac|wav|ogg)$/i, '');
    if (n.includes(' - ')) {
        const p = n.split(' - ');
        return { artist: p[0].trim(), title: p.slice(1).join(' - ').trim() };
    }
    return { artist: '未知艺术家', title: n.trim() };
}
function esc(s) {
    return s ? s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;') : '';
}
function fmt(t) {
    if (isNaN(t)) return '00:00';
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}