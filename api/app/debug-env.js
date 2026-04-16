export default function handler(req, res) {
  const pass = process.env.ADMIN_PASSWORD;
  res.status(200).json({
    ADMIN_PASSWORD_length: pass ? pass.length : null,
    ADMIN_PASSWORD_chars: pass ? [...pass].map(c => c.charCodeAt(0)) : null,
    EDGE_CONFIG_set: !!process.env.EDGE_CONFIG,
    EDGE_CONFIG_ID_set: !!process.env.EDGE_CONFIG_ID,
  });
}
