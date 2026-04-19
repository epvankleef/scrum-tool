import { customAlphabet } from 'nanoid';

// URL-safe, geen verwarrende characters (0/O/1/l etc. weggelaten)
const nano = customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ', 12);

export function generateShareToken(): string {
  return nano();
}
