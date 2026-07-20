import {
  ARVI_CHAT_HISTORY_KEY,
  ARVI_CHAT_HISTORY_TTL_MS,
  clearArviChatHistory,
  loadArviChatHistory,
  saveArviChatHistory,
} from './arvi-chat-history';

function memoryStorage(initial?: Record<string, string>) {
  const map = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    _map: map,
  };
}

describe('arvi-chat-history', () => {
  const sample = [
    { id: '1', role: 'user' as const, content: 'hi' },
    { id: '2', role: 'assistant' as const, content: 'hello' },
  ];

  it('saves and loads within TTL', () => {
    const storage = memoryStorage();
    const now = 1_000_000;
    saveArviChatHistory(sample, now, storage);
    expect(loadArviChatHistory(now + 60_000, storage)).toEqual(sample);
  });

  it('clears when TTL exceeded', () => {
    const storage = memoryStorage();
    const now = 1_000_000;
    saveArviChatHistory(sample, now, storage);
    expect(
      loadArviChatHistory(now + ARVI_CHAT_HISTORY_TTL_MS + 1, storage),
    ).toEqual([]);
    expect(storage.getItem(ARVI_CHAT_HISTORY_KEY)).toBeNull();
  });

  it('drops legacy bare-array payloads', () => {
    const storage = memoryStorage({
      [ARVI_CHAT_HISTORY_KEY]: JSON.stringify(sample),
    });
    expect(loadArviChatHistory(Date.now(), storage)).toEqual([]);
    expect(storage.getItem(ARVI_CHAT_HISTORY_KEY)).toBeNull();
  });

  it('clearArviChatHistory removes the key', () => {
    const storage = memoryStorage();
    saveArviChatHistory(sample, Date.now(), storage);
    clearArviChatHistory(storage);
    expect(storage.getItem(ARVI_CHAT_HISTORY_KEY)).toBeNull();
  });

  it('caps at max messages', () => {
    const storage = memoryStorage();
    const many = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `m${i}`,
    }));
    saveArviChatHistory(many, Date.now(), storage);
    const loaded = loadArviChatHistory(Date.now(), storage);
    expect(loaded).toHaveLength(20);
    expect(loaded[0]?.id).toBe('5');
  });
});
