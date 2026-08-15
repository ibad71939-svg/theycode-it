// Supabase Postgres adapter.
//
// IMPORTANT: Postgres folds unquoted identifiers to lowercase, so a column
// created as `userId` actually exists in the DB as `userid`, and PostgREST
// (Supabase's REST layer) will reject any request using the camelCase key.
// supabase_schema.sql defines all columns in snake_case (e.g. user_id) to
// avoid that trap entirely. This adapter converts every outgoing record to
// snake_case and every incoming row back to camelCase, so the rest of the
// app (routes, frontend) can keep using camelCase everywhere as before.
const { supabase } = require('./supabaseClient');
const crypto = require('crypto');

function id() {
  return crypto.randomBytes(12).toString('hex');
}

function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function toSnakeCaseObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[camelToSnake(k)] = v;
  }
  return out;
}

function toCamelCaseObject(obj) {
  if (!obj) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

function assertClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Check SUPABASE_URL / SUPABASE_KEY in backend/.env');
  }
}

async function all(collection) {
  assertClient();
  // The collection name itself needs the same camelCase -> snake_case
  // conversion as record fields do (Postgres tables here are all
  // snake_case, e.g. `audit_logs`), or a multi-word collection name like
  // 'auditLogs' silently resolves to a table that doesn't exist.
  const table = camelToSnake(collection);
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw new Error(`[supabase] ${table}: ${error.message}`);
  return (data || []).map(toCamelCaseObject);
}

// find/filter accept either:
//   - a JS predicate function (legacy path): fetches the whole table with
//     `all()` and filters in memory. Kept for call sites with multi-field
//     or non-equality conditions that don't map cleanly onto `.match()`.
//   - a plain object of { column: value } equality pairs (preferred): pushed
//     down to Postgres via `.match()` so only matching rows cross the wire.
// Route files were migrated to the object form wherever the predicate was a
// single `field === value` check; a handful of multi-condition/`.includes`
// predicates still use the function form on purpose.
async function find(collection, predicateOrWhere) {
  if (typeof predicateOrWhere === 'function') {
    const rows = await all(collection);
    return rows.find(predicateOrWhere);
  }
  return findWhere(collection, predicateOrWhere);
}

async function filter(collection, predicateOrWhere) {
  if (typeof predicateOrWhere === 'function') {
    const rows = await all(collection);
    return rows.filter(predicateOrWhere);
  }
  return filterWhere(collection, predicateOrWhere);
}

async function findWhere(collection, where) {
  assertClient();
  const table = camelToSnake(collection);
  const { data, error } = await supabase.from(table).select('*').match(toSnakeCaseObject(where)).limit(1);
  if (error) throw new Error(`[supabase] ${table}: ${error.message}`);
  return data && data.length ? toCamelCaseObject(data[0]) : undefined;
}

async function filterWhere(collection, where) {
  assertClient();
  const table = camelToSnake(collection);
  const { data, error } = await supabase.from(table).select('*').match(toSnakeCaseObject(where));
  if (error) throw new Error(`[supabase] ${table}: ${error.message}`);
  return (data || []).map(toCamelCaseObject);
}

async function insert(collection, record) {
  assertClient();
  const table = camelToSnake(collection);
  const row = { id: record.id || id(), createdAt: record.createdAt || new Date().toISOString(), ...record };
  const { data, error } = await supabase.from(table).insert(toSnakeCaseObject(row)).select().single();
  if (error) throw new Error(`[supabase] insert ${table}: ${error.message}`);
  return toCamelCaseObject(data);
}

async function update(collection, recordId, patch) {
  assertClient();
  const table = camelToSnake(collection);
  const { data, error } = await supabase
    .from(table)
    .update(toSnakeCaseObject(patch))
    .eq('id', recordId)
    .select()
    .single();
  if (error) throw new Error(`[supabase] update ${table}: ${error.message}`);
  return toCamelCaseObject(data);
}

async function remove(collection, recordId) {
  assertClient();
  const table = camelToSnake(collection);
  const { error } = await supabase.from(table).delete().eq('id', recordId);
  if (error) throw new Error(`[supabase] delete ${table}: ${error.message}`);
}

module.exports = { id, reset: async () => {}, all, find, filter, findWhere, filterWhere, insert, update, remove };
