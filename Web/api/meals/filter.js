// api/meals/filter.js

module.exports = async function handler(req, res) {
  // CORS (safe for preview + prod)
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  try {
    const { type, userId } = req.body || {};

    if (!type || !userId) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    /**
     * TODO: Replace this with your real filtering logic.
     * For now we return a stable JSON response so your frontend never crashes.
     *
     * Expected shapes supported by your frontend:
     * - { meals: [...] }
     * - or directly [...]
     */
    return res.status(200).json({
      meals: [], // return list of meals here
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};