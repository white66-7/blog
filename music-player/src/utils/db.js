const dbname = 'CyberAudioDB', dbver = 2, song = 'songs', dir = 'dirs';
function openDB() {
    return new Promise((resolve, reject) => {
        const r = indexedDB.open(dbname, dbver);
        r.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(song)) {
                db.createObjectStore(song, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(dir)) {
                db.createObjectStore(dir, { keyPath: 'id' });
            }
        };
        r.onsuccess = e => resolve(e.target.result);
        r.onerror = e => reject(e.target.error);
    }
    )
}
async function savesong(s) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const t = db.transaction(song, 'readwrite');
        t.objectStore(song).put({
            id: s.id,
            signature: s.signature,
            name: s.name,
            artist: s.artist,
            originalFileName: s.originalFileName,
            directoryId: s.directoryId,
            file: s.file
        })
        t.oncomplete = resolve;
        t.onerror = e => reject(e.target.error);
    }
    )
}
async function loadSongs() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const r = db.transaction(song, 'readonly').objectStore(song).getAll();
        r.onsuccess = e => {
            const out = e.target.result.map(item => ({
                id: item.id,
                signature: item.signature || '',
                name: item.name,
                artist: item.artist,
                originalFileName: item.originalFileName,
                directoryId: item.directoryId,
                file: item.file
            }));
            resolve(out);
        };
        r.onerror = e => reject(e.target.error);
    })
}
async function updateSongDir(id, dirId) {
    const db = await openDB();
    return new Promise((res, rej) => {
        const t = db.transaction(song, 'readwrite'), st = t.objectStore(song);
        const g = st.get(id);
        g.onsuccess = () => {
            const d = g.result;
            if (d) {
                d.directoryId = dirId;
                st.put(d);
            }
            res();
        };
        g.onerror = e => rej(e.target.error);
    });
}
async function delSong(id) {
    const db = await openDB();
    return new Promise((res, rej) => {
        const t = db.transaction(song, 'readwrite');
        t.objectStore(song).delete(id);
        t.oncomplete = res;
        t.onerror = e => rej(e.target.error);
    });
}
async function saveDirs(dirs) {
    const db = await openDB();
    return new Promise((res, rej) => {
        const t = db.transaction(dir, 'readwrite');
        const st = t.objectStore(dir);
        st.clear();
        dirs.forEach(d => {
            st.put(d);
        });
        t.oncomplete = res;
        t.onerror = e => rej(e.target.error);
    });
}
async function loadDirs() {
    const db = await openDB();
    return new Promise((res, rej) => {
        const t = db.transaction(dir, 'readonly');
        const st = t.objectStore(dir);
        const req = st.getAll();
        req.onsuccess = e => res(e.target.result);
        req.onerror = e => rej(e.target.error);
    });
}