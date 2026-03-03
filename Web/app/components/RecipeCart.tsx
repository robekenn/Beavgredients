"use client";

import { useMemo, useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface RecipeCartProps {
  isOpen: boolean;
  selectedRecipes: any[];
  pantryItems: string[];
  onRemove: (id: any) => void;
}

function normalizeName(s: string) {
  return (s || "").toLowerCase().trim();
}

function isIngredientInPantry(ingredient: string, pantryItems: string[]) {
  const ing = normalizeName(ingredient);
  if (!ing) return true;

  return pantryItems.some((p) => {
    const pn = normalizeName(p);
    if (!pn) return false;
    // forgiving match
    return ing === pn || ing.includes(pn) || pn.includes(ing);
  });
}

function getInstructions(recipe: any) {
  // your backend uses `recipe: meal.strInstructions`, but you also sometimes have strInstructions
  return recipe?.recipe || recipe?.strInstructions || "";
}

function getRecipeName(recipe: any) {
  return recipe?.name || recipe?.strMeal || "Untitled Recipe";
}

function getRecipeId(recipe: any) {
  return recipe?.id || recipe?.idMeal;
}

function getMissingForRecipe(recipe: any, pantryItems: string[]) {
  const missing: { ingredient: string; measure: string }[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingRaw = recipe?.[`strIngredient${i}`];
    const measRaw = recipe?.[`strMeasure${i}`];

    const ing = typeof ingRaw === "string" ? ingRaw.trim() : "";
    const meas = typeof measRaw === "string" ? measRaw.trim() : "";

    if (!ing) continue;

    if (!isIngredientInPantry(ing, pantryItems)) {
      missing.push({ ingredient: ing, measure: meas });
    }
  }

  // de-dupe within this recipe by ingredient name
  const seen = new Set<string>();
  return missing.filter((m) => {
    const key = normalizeName(m.ingredient);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function RecipeCart({
  isOpen,
  selectedRecipes,
  pantryItems,
  onRemove,
}: RecipeCartProps) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Per-recipe missing ingredients (with measures)
  const missingByRecipe = useMemo(() => {
    return selectedRecipes.map((r) => {
      const missing = getMissingForRecipe(r, pantryItems);
      return {
        id: getRecipeId(r),
        name: getRecipeName(r),
        instructions: getInstructions(r),
        missing,
      };
    });
  }, [selectedRecipes, pantryItems]);

  // Combined missing list (for UI badge + overall shopping list)
  const missingIngredients = useMemo(() => {
    const all: string[] = [];

    missingByRecipe.forEach((r) => {
      r.missing.forEach((m) => {
        // keep measure + ingredient together if it exists
        const line = `${m.measure ? `${m.measure} ` : ""}${m.ingredient}`.trim();
        if (line) all.push(line);
      });
    });

    // de-dupe (case-insensitive)
    const seen = new Set<string>();
    return all.filter((x) => {
      const key = normalizeName(x);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [missingByRecipe]);

  // TEXT email body
  const emailText = useMemo(() => {
    const header = `Your BeavGredients Cooking Plan\n\n`;

    const recipesSection = selectedRecipes.length
      ? selectedRecipes
          .map((r) => `- ${getRecipeName(r)}`)
          .join("\n")
      : "- (none)";

    const combinedShopping =
      missingIngredients.length > 0
        ? missingIngredients.map((i) => `- ${i}`).join("\n")
        : "- Nothing! You already have everything.";

    const perRecipeDetails = missingByRecipe
      .map((r) => {
        const missingLines =
          r.missing.length > 0
            ? r.missing
                .map((m) => `- ${m.measure ? `${m.measure} ` : ""}${m.ingredient}`.trim())
                .join("\n")
            : "- Nothing missing for this recipe.";

        const instructions = r.instructions?.trim()
          ? r.instructions.trim()
          : "(No instructions provided by the API.)";

        return (
          `\n==============================\n` +
          `${r.name}\n` +
          `==============================\n\n` +
          `Missing ingredients:\n${missingLines}\n\n` +
          `How to make it:\n${instructions}\n`
        );
      })
      .join("\n");

    return (
      header +
      `Selected Recipes:\n${recipesSection}\n\n` +
      `Combined Shopping List:\n${combinedShopping}\n` +
      perRecipeDetails
    );
  }, [selectedRecipes, missingIngredients, missingByRecipe]);

  // HTML email body (nicer formatting)
  const emailHtml = useMemo(() => {
    const esc = (s: any) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const recipeLis = selectedRecipes
      .map((r) => `<li><strong>${esc(getRecipeName(r))}</strong></li>`)
      .join("");

    const combinedLis =
      missingIngredients.length > 0
        ? missingIngredients.map((x) => `<li>${esc(x)}</li>`).join("")
        : `<li>Nothing! You already have everything.</li>`;

    const perRecipeBlocks = missingByRecipe
      .map((r) => {
        const missLis =
          r.missing.length > 0
            ? r.missing
                .map((m) => {
                  const line = `${m.measure ? `${m.measure} ` : ""}${m.ingredient}`.trim();
                  return `<li>${esc(line)}</li>`;
                })
                .join("")
            : `<li>Nothing missing for this recipe.</li>`;

        const instructions = r.instructions?.trim()
          ? esc(r.instructions.trim()).replace(/\n/g, "<br/>")
          : "<em>No instructions provided by the API.</em>";

        return `
          <hr style="margin:16px 0;"/>
          <h2 style="margin:0 0 8px 0;">${esc(r.name)}</h2>
          <h3 style="margin:12px 0 6px 0;">Missing ingredients</h3>
          <ul>${missLis}</ul>
          <h3 style="margin:12px 0 6px 0;">How to make it</h3>
          <div style="line-height:1.4">${instructions}</div>
        `;
      })
      .join("");

    return `
      <div style="font-family:Arial,sans-serif; font-size:14px; color:#111;">
        <h1 style="margin:0 0 10px 0;">Your BeavGredients Cooking Plan</h1>

        <h3 style="margin:14px 0 6px 0;">Selected Recipes</h3>
        <ul>${recipeLis || "<li>(none)</li>"}</ul>

        <h3 style="margin:14px 0 6px 0;">Combined Shopping List</h3>
        <ul>${combinedLis}</ul>

        ${perRecipeBlocks}
      </div>
    `;
  }, [selectedRecipes, missingIngredients, missingByRecipe]);

  async function handleStartCooking() {
    setStatus(null);
    const to = window.prompt("What email should I send your cooking plan to?");
    if (!to) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject: "Your BeavGredients Cooking Plan",
          message: emailText,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const maybe = await res.json().catch(() => null);
        throw new Error(maybe?.error || "Failed to send email");
      }

      setStatus("Email sent! Check your inbox.");
      setTimeout(() => setStatus(null), 5000);
    } catch (err: any) {
      setStatus(`Failed to send: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l bg-white h-screen flex flex-col shadow-xl overflow-hidden">
      <div className="p-6 border-b shrink-0 bg-white z-10">
        <h2 className="text-xl font-bold">Recipe Kart</h2>
      </div>

      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">
                Selected ({selectedRecipes.length})
              </h3>
              <div className="space-y-2">
                {selectedRecipes.map((recipe) => (
                  <div
                    key={getRecipeId(recipe)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                  >
                    <span className="text-sm font-medium truncate pr-2">
                      {getRecipeName(recipe)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full shrink-0 flex items-center justify-center"
                      onClick={() => onRemove(getRecipeId(recipe))}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-6 border-t pb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Shopping List
                </h3>
                {missingIngredients.length > 0 && (
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {missingIngredients.length} TO BUY
                  </span>
                )}
              </div>

              <ul className="space-y-2">
                {missingIngredients.length > 0 ? (
                  missingIngredients.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-700 capitalize"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                      {item}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    {selectedRecipes.length > 0
                      ? "Everything is in your pantry!"
                      : "Add a recipe to see the list."}
                  </p>
                )}
              </ul>
            </section>
          </div>
        </ScrollArea>
      </div>

      <div className="p-6 border-t bg-gray-50 space-y-3 shrink-0">
        {status && (
          <p
            className={`text-xs font-medium text-center p-2 rounded ${
              status.includes("Failed")
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {status}
          </p>
        )}
        <Button
          className="w-full bg-black hover:bg-gray-800 text-white font-bold h-12 flex gap-2"
          disabled={selectedRecipes.length === 0 || isSending}
          onClick={handleStartCooking}
        >
          <ShoppingBag className="h-4 w-4" />
          {isSending ? "Sending..." : "Start Cooking"}
        </Button>
      </div>
    </div>
  );
}