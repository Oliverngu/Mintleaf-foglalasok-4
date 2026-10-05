// Local, session-only adapter. This module never initializes Firebase or uses a network.
export class Timestamp {
  constructor(public seconds: number, public nanoseconds = 0) {}
  static fromDate(date: Date) { return Timestamp.fromMillis(date.getTime()); }
  static fromMillis(ms: number) { return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6); }
  static now() { return Timestamp.fromDate(new Date()); }
  toDate() { return new Date(this.toMillis()); }
  toMillis() { return this.seconds * 1000 + this.nanoseconds / 1e6; }
  valueOf() { return this.toMillis(); }
  isEqual(other: Timestamp) { return this.toMillis() === other.toMillis(); }
}
export const serverTimestamp = () => Timestamp.now();
type Reference = { path: string; kind: string; constraints?: any[] };
const records = new Map<string, any>();
const listeners = new Set<() => void>();
export function seed(path: string, data: any) { records.set(path, data); }
const reference = (kind: string, parent: any, parts: string[]): Reference => ({ kind, path: [parent?.path, ...parts].filter(Boolean).join('/') });
export const collection = (parent: any, ...parts: string[]) => reference('collection', parent, parts);
export const doc = (parent: any, ...parts: string[]) => reference('doc', parent, parts.length ? parts : [crypto.randomUUID()]);
export const collectionGroup = (_db: any, path: string) => ({ kind: 'group', path });
export const query = (ref: Reference, ...constraints: any[]) => ({ ...ref, constraints });
export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, direction = 'asc') => ({ type: 'order', field, direction });
export const limit = (count: number) => ({ type: 'limit', count });
export const limitToLast = (count: number) => ({ type: 'last', count });
export const documentId = () => '__name__';
export const arrayUnion = (...values: any[]) => ({ __union: values });
const snapshotDoc = (path: string) => ({ id: path.split('/').pop()!, ref: { path, kind: 'doc' }, exists: () => records.has(path), data: () => records.get(path) });
function snapshot(ref: Reference): any {
  if (ref.kind === 'doc') return snapshotDoc(ref.path);
  let docs = [...records.keys()].filter(path => ref.kind === 'group' ? path.split('/').at(-2) === ref.path : path.startsWith(ref.path + '/') && path.split('/').length === ref.path.split('/').length + 1).map(snapshotDoc);
  const value = (d: any, field: string) => field === '__name__' ? d.id : field.split('.').reduce((v, k) => v?.[k], d.data());
  for (const c of ref.constraints || []) {
    if (c.type === 'where') docs = docs.filter(d => { const v = value(d, c.field), w = c.value; switch(c.op) { case '==': return v === w; case '!=': return v !== w; case 'in': return w.includes(v); case 'array-contains': return v?.includes(w); case 'array-contains-any': return v?.some((x: any) => w.includes(x)); case '>=': return v >= w; case '<=': return v <= w; case '>': return v > w; case '<': return v < w; default: throw Error('Unsupported local query: ' + c.op); } });
    if (c.type === 'order') docs.sort((a,b) => { const x = value(a,c.field), y = value(b,c.field); return (x < y ? -1 : x > y ? 1 : 0) * (c.direction === 'desc' ? -1 : 1); });
    if (c.type === 'limit') docs = docs.slice(0,c.count);
    if (c.type === 'last') docs = docs.slice(-c.count);
  }
  return { docs, size: docs.length, empty: !docs.length, forEach: (fn: any) => docs.forEach(fn) };
}
export const getDoc = async (ref: Reference) => snapshot(ref);
export const getDocs = getDoc;
export function onSnapshot(ref: Reference, next: any, error?: any) {
  let active = true;
  const emit = () => { if (active) { try { next(snapshot(ref)); } catch(e) { if(error) error(e); else throw e; } } };
  listeners.add(emit); queueMicrotask(emit);
  return () => { active = false; listeners.delete(emit); };
}
const notify = () => listeners.forEach(fn => queueMicrotask(fn));
export async function setDoc(ref: Reference, data: any, options?: any) {
  const result = options?.merge ? { ...records.get(ref.path) } : {};
  for (const [key, val] of Object.entries(data)) {
    const keys = key.split('.'); let target: any = result;
    for (const part of keys.slice(0,-1)) target = target[part] = { ...target[part] };
    const last = keys.at(-1)!;
    target[last] = (val as any)?.__union ? [...new Set([...(target[last] || []), ...(val as any).__union])] : val;
  }
  records.set(ref.path, result); notify();
}
export const updateDoc = (ref: Reference, data: any) => setDoc(ref, data, { merge: true });
export async function deleteDoc(ref: Reference) { records.delete(ref.path); notify(); }
export async function addDoc(ref: Reference, data: any) { const child = doc(ref); await setDoc(child, data); return child; }
export function writeBatch(_db: any) {
  const operations: (() => Promise<any>)[] = [];
  const batch = { set: (...args: Parameters<typeof setDoc>) => { operations.push(() => setDoc(...args)); return batch; }, update: (ref: Reference, data: any) => { operations.push(() => updateDoc(ref, data)); return batch; }, delete: (ref: Reference) => { operations.push(() => deleteDoc(ref)); return batch; }, commit: async () => { for(const op of operations) await op(); } };
  return batch;
}
export const runTransaction = async (db: any, fn: any) => { const batch = writeBatch(db); const result = await fn({ ...batch, get: getDoc }); await batch.commit(); return result; };
