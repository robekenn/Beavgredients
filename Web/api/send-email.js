// /api/send-email.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Convert TheMealDB meal object -> recipe (ingredients + measures + instructions)
 */
function parseMealToRecipe(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];

    if (ing && String(ing).trim()) {
      const amount = (meas || "").toString().trim();
      ingredients.push(amount ? `${amount} ${String(ing).trim()}` : String(ing).trim());
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    image: meal.strMealThumb,
    instructions: meal.strInstructions || "",
    ingredients,
  };
}

/**
 * Fetch full recipe details by MealDB ID
 */
async function fetchMealById(id) {
  const resp = await axios.get("https://www.themealdb.com/api/json/v1/1/lookup.php?", {
    params: { i: id },
  });

  const meal = resp.data?.meals?.[0];
  if (!meal) return null;

  return parseMealToRecipe(meal);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Build a nice HTML email containing all dinners + recipes
 */
function buildEmailHtml({ title, introMessage, recipes }) {
  const intro = introMessage
    ? `<p style="font-size:14px;line-height:1.55;margin:0 0 14px 0;">${escapeHtml(
        introMessage
      )}</p>`
    : "";

  const cards = recipes
    .map((r, idx) => {
      const heading = r.day
        ? `${escapeHtml(r.day)} — ${escapeHtml(r.name)}`
        : `${idx + 1}. ${escapeHtml(r.name)}`;

      const metaParts = [];
      if (r.category) metaParts.push(`Category: ${escapeHtml(r.category)}`);
      if (r.area) metaParts.push(`Cuisine: ${escapeHtml(r.area)}`);
      const meta = metaParts.join(" • ");

      const ingredientsList =
        r.ingredients && r.ingredients.length
          ? r.ingredients.map((x) => `<li>${escapeHtml(x)}</li>`).join("")
          : "<li>(No ingredients listed)</li>";

      const instructions = escapeHtml(r.instructions).replaceAll("\n", "<br/>");

      return `
        <div style="border:1px solid #eee;border-radius:12px;padding:14px;margin:14px 0;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            ${
              r.image
                ? `<img src="${escapeHtml(r.image)}" alt="${escapeHtml(
                    r.name
                  )}" width="120" style="border-radius:10px;object-fit:cover;" />`
                : ""
            }
            <div style="flex:1;">
              <h2 style="margin:0 0 6px 0;font-size:18px;line-height:1.25;">${heading}</h2>
              ${
                meta
                  ? `<div style="color:#666;font-size:13px;margin-bottom:10px;">${meta}</div>`
                  : ""
              }

              <h3 style="margin:10px 0 6px 0;font-size:14px;">Ingredients</h3>
              <ul style="margin:0 0 10px 18px;padding:0;font-size:13px;line-height:1.5;">
                ${ingredientsList}
              </ul>

              <h3 style="margin:10px 0 6px 0;font-size:14px;">Instructions</h3>
              <div style="font-size:13px;line-height:1.6;color:#222;">
                ${instructions || "(No instructions provided)"}
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:0 auto;padding:18px;">
      <h1 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;">
        ${escapeHtml(title || "Your Dinner Recipes")}
      </h1>
      ${intro}
      ${cards}
      <hr style="border:none;border-top:1px solid #eee;margin:18px 0;" />
      <div style="color:#777;font-size:12px;">
        Sent by BeavGredients
      </div>
    </div>
  `;
}

module.exports = async function handler(req, res) {
  // Vercel/Serverless will pass req.method, req.body (if JSON)
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  try {
    const { to, subject, title, introMessage, meals } = req.body ?? {};

    // meals format: [{ id: "52772", day: "Monday" }, { id: "52874", day: "Tuesday" }]
    if (!to || !subject || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Missing fields. Required: to, subject, meals[]",
      });
    }

    // Validate env vars early so you get a clear error
    const requiredEnv = ["SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
    for (const k of requiredEnv) {
      if (!process.env[k]) {
        return res.status(500).json({
          ok: false,
          error: `Missing env var: ${k}`,
        });
      }
    }

    // Fetch recipes (sequential to be gentle; can be parallel if you want)
    const recipes = [];
    for (const m of meals) {
      const id = m?.id;
      if (!id) continue;

      const recipe = await fetchMealById(id);
      if (recipe) recipes.push({ ...recipe, day: m?.day || "" });
    }

    if (recipes.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Could not load any recipes from the provided meal IDs.",
      });
    }

    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = buildEmailHtml({
      title: title || "Meal Plan + Recipes",
      introMessage,
      recipes,
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // ex: "BeavGredients <yourgmail@gmail.com>"
      to,
      subject,
      text: "Your dinner recipes are included in this email (HTML view recommended).",
      html,
    });

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
      recipesSent: recipes.map((r) => ({ id: r.id, name: r.name })),
    });
  } catch (err) {
    console.error("send-email error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};