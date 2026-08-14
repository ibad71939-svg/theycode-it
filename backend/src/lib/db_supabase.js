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
  const { data, error } = await supabase.from(collection).select('*');
  if (error) throw new Error(`[supabase] ${collection}: ${error.message}`);
  return (data || []).map(toCamelCaseObject);
}

async function find(collection, predicate) {
  const rows = await all(collection);
  return rows.find(predicate);
}

async function filter(collection, predicate) {
  const rows = await all(collection);
  return rows.filter(predicate);
}

async function insert(collection, record) {
  assertClient();
  const row = { id: record.id || id(), createdAt: record.createdAt || new Date().toISOString(), ...record };
  const { data, error } = await supabase.from(collection).insert(toSnakeCaseObject(row)).select().single();
  if (error) throw new Error(`[supabase] insert ${collection}: ${error.message}`);
  return toCamelCaseObject(data);
}

async function update(collection, recordId, patch) {
  assertClient();
  const { data, error } = await supabase
    .from(collection)
    .update(toSnakeCaseObject(patch))
    .eq('id', recordId)
    .select()
    .single();
  if (error) throw new Error(`[supabase] update ${collection}: ${error.message}`);
  return toCamelCaseObject(data);
}

async function remove(collection, recordId) {
  assertClient();
  const { error } = await supabase.from(collection).delete().eq('id', recordId);
  if (error) throw new Error(`[supabase] delete ${collection}: ${error.message}`);
}

module.exports = { id, reset: async () => {}, all, find, filter, insert, update, remove };
