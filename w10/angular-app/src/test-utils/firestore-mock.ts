export function getFirestore() { return {}; }
export function collection() { return {}; }
export function query() { return {}; }
export function orderBy() { return {}; }
export function where() { return {}; }
export async function getDocs() { return { docs: [] }; }
export async function addDoc() { return {}; }
export function serverTimestamp() { return new Date().toISOString(); }
export function doc() { return {}; }
export async function getDoc() { return { exists: () => false, data: () => null }; }
export async function updateDoc() { }
export async function deleteDoc() { }
export function onSnapshot(_q:any, _next?:any) { return () => {}; }
export default { getFirestore, collection, query, orderBy, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, onSnapshot };
