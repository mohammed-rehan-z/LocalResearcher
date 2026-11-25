/**
 * IndexedDB storage layer for LocalResearcher.
 * Provides unbounded offline storage for papers, vector chunks, and chat history
 * without the 5MB quota limitations of localStorage.
 */

const DB_NAME = "LocalResearcherDB";
const DB_VERSION = 1;
const STORE_PAPERS = "papers";
const STORE_CHATS = "chats";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PAPERS)) {
        db.createObjectStore(STORE_PAPERS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CHATS)) {
        db.createObjectStore(STORE_CHATS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn("IndexedDB open error:", request.error);
      resolve(null);
    };
  });
}

/**
 * Save all papers to IndexedDB. Falls back to localStorage if IndexedDB is unavailable.
 */
export async function savePapersToStorage(papers) {
  if (typeof window === "undefined") return;

  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_PAPERS, "readwrite");
      const store = tx.objectStore(STORE_PAPERS);
      // Clear old entries and re-insert current set
      await new Promise((res, rej) => {
        const clearReq = store.clear();
        clearReq.onsuccess = () => res();
        clearReq.onerror = () => rej(clearReq.error);
      });

      for (const paper of papers) {
        store.put(paper);
      }

      await new Promise((res) => {
        tx.oncomplete = () => res();
        tx.onerror = () => res();
      });
      return;
    } catch (err) {
      console.warn("IndexedDB save failed, falling back to localStorage:", err);
    }
  }

  // Fallback to localStorage (stripping vector embeddings if too large)
  try {
    let payload = JSON.stringify(papers);
    if (payload.length > 4 * 1024 * 1024) {
      const trimmed = papers.map(p => ({
        ...p,
        chunks: (p.chunks || []).map(({ embedding, ...rest }) => rest)
      }));
      payload = JSON.stringify(trimmed);
    }
    localStorage.setItem("LocalResearcher_uploaded_papers", payload);
  } catch (_) {}
}

/**
 * Load all papers from IndexedDB, migrating from localStorage if needed.
 */
export async function loadPapersFromStorage() {
  if (typeof window === "undefined") return [];

  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_PAPERS, "readonly");
      const store = tx.objectStore(STORE_PAPERS);
      const papers = await new Promise((res) => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => res([]);
      });

      if (papers.length > 0) {
        return papers;
      }
    } catch (err) {
      console.warn("IndexedDB read error:", err);
    }
  }

  // Fallback / migration check from localStorage
  try {
    const raw = localStorage.getItem("LocalResearcher_uploaded_papers");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Asynchronously migrate to IndexedDB
        savePapersToStorage(parsed).catch(() => {});
        return parsed;
      }
    }
  } catch (_) {}

  return [];
}

/**
 * Save chat histories.
 */
export async function saveChatHistoriesToStorage(histories) {
  if (typeof window === "undefined") return;

  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_CHATS, "readwrite");
      const store = tx.objectStore(STORE_CHATS);
      store.put({ id: "main_chat_histories", data: histories });
      return;
    } catch (_) {}
  }

  try {
    localStorage.setItem("LocalResearcher_chat_histories", JSON.stringify(histories));
  } catch (_) {}
}

/**
 * Load chat histories.
 */
export async function loadChatHistoriesFromStorage() {
  if (typeof window === "undefined") return {};

  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_CHATS, "readonly");
      const store = tx.objectStore(STORE_CHATS);
      const record = await new Promise((res) => {
        const req = store.get("main_chat_histories");
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
      if (record && record.data) {
        return record.data;
      }
    } catch (_) {}
  }

  try {
    const raw = localStorage.getItem("LocalResearcher_chat_histories");
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  return {};
}

