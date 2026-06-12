/**
 * POST /api/admin
 *
 * Single password-gated endpoint behind the /admin/submissions dashboard.
 * Body: { password, action, ...args }
 *
 *   action: 'list'    → returns all submissions, newest first
 *   action: 'update'  → { id, status?, internalNotes? } patches a row
 *   action: 'delete'  → { id } removes a row + its uploaded files from Storage
 *
 * Auth: the password is compared server-side against ADMIN_PASSWORD. It never
 * lives in the client bundle — the dashboard prompts for it and sends it with
 * each request. The Supabase service-role key stays server-side only.
 *
 * Required env vars:
 *   ADMIN_PASSWORD
 *   PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'event-uploads';
const VALID_STATUS = new Set(['new', 'reviewing', 'approved', 'published', 'rejected']);

function unauthorized(res) {
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
}

// Extract the storage object name from a public file URL
function objectNameFromUrl(url) {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  try { return decodeURIComponent(url.slice(i + marker.length)); }
  catch { return url.slice(i + marker.length); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { password, action } = req.body || {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    console.error('[admin] ADMIN_PASSWORD not configured');
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }
  if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
    return unauthorized(res);
  }

  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, error: 'Supabase not configured' });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // ── LIST ──────────────────────────────────────────────
    if (action === 'list') {
      const { data, error } = await supabase
        .from('event_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ ok: true, submissions: data ?? [] });
    }

    // ── UPDATE (status and/or internal notes) ─────────────
    if (action === 'update') {
      const { id, status, internalNotes } = req.body;
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const patch = {};
      if (status !== undefined) {
        if (!VALID_STATUS.has(status)) return res.status(400).json({ ok: false, error: 'Invalid status' });
        patch.status = status;
      }
      if (internalNotes !== undefined) patch.internal_notes = String(internalNotes).slice(0, 5000);
      if (Object.keys(patch).length === 0) return res.status(400).json({ ok: false, error: 'Nothing to update' });

      const { error } = await supabase.from('event_submissions').update(patch).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    // ── DELETE (row + its files) ──────────────────────────
    if (action === 'delete') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

      // Fetch the row to find its files first
      const { data: rowData } = await supabase
        .from('event_submissions')
        .select('file_urls')
        .eq('id', id)
        .single();

      const fileUrls = rowData?.file_urls ?? [];
      const objectNames = fileUrls.map(objectNameFromUrl).filter(Boolean);
      if (objectNames.length) {
        // best-effort — don't fail the delete if storage cleanup hiccups
        try { await supabase.storage.from(BUCKET).remove(objectNames); }
        catch (e) { console.warn('[admin] file cleanup failed:', e?.message || e); }
      }

      const { error } = await supabase.from('event_submissions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    console.error('[admin] error:', err?.message || err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
