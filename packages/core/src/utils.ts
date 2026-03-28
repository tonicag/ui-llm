import type { EntryId } from './types';

let counter = 0;

export function generateId(): EntryId {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  const id = `llm_${timestamp}${random}${(counter++).toString(36)}`;
  return id as EntryId;
}
