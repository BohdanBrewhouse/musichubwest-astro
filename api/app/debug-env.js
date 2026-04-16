export default function handler(req, res) {
  // Show all available env var keys (not values for security)
  const allKeys = Object.keys(process.env).filter(k => 
    !k.startsWith('PATH') && !k.startsWith('NODE') && !k.startsWith('npm_')
  ).sort();
  res.status(200).json({
    keys: allKeys,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || null,
    MONDAY_API_TOKEN_set: !!process.env.MONDAY_API_TOKEN,
  });
}
