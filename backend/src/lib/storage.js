const { supabase } = require('./supabaseClient');

// All payment-receipt storage access goes through this module, using the
// service-role client — the bucket is PRIVATE (not public) and no client
// ever talks to Supabase Storage directly. This means: no storage RLS
// policies are needed for this to work correctly, and a screenshot can only
// ever become viewable through a short-lived signed URL that this backend
// generates after checking the requester actually owns the payment (student)
// or is staff (admin) — see routes/student.js and routes/admin.js.
const BUCKET = 'payment-receipts';
const SIGNED_URL_TTL_SECONDS = 300; // 5 minutes — regenerated fresh each time the receipt is viewed

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

function assertConfigured() {
  if (!supabase) throw new Error('Supabase is not configured on the server');
}

function validateReceiptFile(file) {
  if (!file) throw new Error('No file was uploaded');
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error('Only PNG, JPG, WEBP, or PDF files are accepted for payment receipts');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File is too large — payment receipts must be under 5MB');
  }
}

function extensionFor(mimetype) {
  return { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' }[mimetype] || 'bin';
}

async function uploadReceipt(paymentId, file, previousPath) {
  assertConfigured();
  validateReceiptFile(file);

  const path = `${paymentId}/${Date.now()}.${extensionFor(file.mimetype)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new Error(`Could not upload receipt: ${error.message}`);

  // Clean up the old file (if replacing an existing receipt) — best effort,
  // don't fail the request if this doesn't succeed.
  if (previousPath) {
    await supabase.storage.from(BUCKET).remove([previousPath]).catch(() => {});
  }

  return path;
}

async function getSignedReceiptUrl(path) {
  assertConfigured();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) throw new Error(`Could not generate a link for this receipt: ${error.message}`);
  return data.signedUrl;
}

module.exports = { uploadReceipt, getSignedReceiptUrl, BUCKET, ALLOWED_MIME_TYPES, MAX_FILE_BYTES };
