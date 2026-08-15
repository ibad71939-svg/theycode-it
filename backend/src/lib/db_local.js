// Async wrapper around the lightweight JSON-file data layer used for local development.
// This mirrors the production schema so it can be swapped with a real DB adapter.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', '..', 'data.json');

const EMPTY = {
  users: [], students: [], instructors: [], categories: [], courses: [],
  batches: [], enrollments: [], payments: [], attendance: [], assignments: [],
  submissions: [], grades: [], certificates: [], announcements: [], leads: [],
};

function load() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function id() {
  return crypto.randomBytes(12).toString('hex');
}

const db = {
  id,
  async reset() {
    save(EMPTY);
  },
  async all(collection) {
    return load()[collection];
  },
  async find(collection, predicate) {
    return load()[collection].find(predicate);
  },
  async filter(collection, predicate) {
    return load()[collection].filter(predicate);
  },
  async insert(collection, record) {
    const data = load();
    const row = { id: id(), createdAt: new Date().toISOString(), ...record };
    data[collection].push(row);
    save(data);
    return row;
  },
  async update(collection, recordId, patch) {
    const data = load();
    const idx = data[collection].findIndex((r) => r.id === recordId);
    if (idx === -1) return null;
    data[collection][idx] = { ...data[collection][idx], ...patch };
    save(data);
    return data[collection][idx];
  },
  async remove(collection, recordId) {
    const data = load();
    data[collection] = data[collection].filter((r) => r.id !== recordId);
    save(data);
  },
};

module.exports = db;
