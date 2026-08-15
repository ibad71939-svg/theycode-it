// Lightweight audit trail. Every write that matters for accountability
// (status changes on money/enrollment, account provisioning) should call
// `logAction` after the write succeeds. Failures to write an audit entry
// are logged but never block or fail the underlying request — an audit
// trail should be best-effort, not a new way for the app to break.
const db = require('./db');

/**
 * @param {object} params
 * @param {{id:string,email:string,role:string}} params.actor - req.user
 * @param {string} params.action - short verb phrase, e.g. 'enrollment.status_changed'
 * @param {string} params.entityType - e.g. 'enrollment', 'payment', 'instructor'
 * @param {string} params.entityId
 * @param {object} [params.details] - small JSON-serializable diff/context, e.g. { from: 'PENDING', to: 'APPROVED' }
 */
async function logAction({ actor, action, entityType, entityId, details }) {
  try {
    await db.insert('auditLogs', {
      actorId: actor?.id || null,
      actorEmail: actor?.email || null,
      actorRole: actor?.role || null,
      action,
      entityType,
      entityId: entityId != null ? String(entityId) : null,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (e) {
    // Best-effort — don't let a logging failure break the admin action itself.
    console.error('audit log write failed:', e.message);
  }
}

module.exports = { logAction };