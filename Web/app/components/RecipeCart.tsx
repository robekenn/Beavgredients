"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface RecipeCartProps {
  isOpen: boolean;
  selectedRecipes: any[];
  pantryItems: string[];
  onRemove: (id: any) => void;
}

function extractIngredientNames(recipe: any): string[] {
  // MealDB style: strIngredient1..20
  const mealDb: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe?.[`strIngredient${i}`];
    if (typeof ing === "string" && ing.trim()) mealDb.push(ing.trim());
  }
  if (mealDb.length) return mealDb;

  // Array style: ingredients: string[]
  if (Array.isArray(recipe?.ingredients)) {
    return recipe.ingredients
      .filter((x: any) => typeof x === "string" && x.trim())
      .map((s: string) => s.trim());
  }

  // Your UI chips: displayedIngredients: string[]
  if (Array.isArray(recipe?.displayedIngredients)) {
    return recipe.displayedIngredients
      .filter((x: any) => typeof x === "string" && x.trim())
      .map((s: string) => s.trim());
  }

  return [];
}

export function RecipeCart({
  isOpen,
  selectedRecipes,
  pantryItems,
  onRemove,
}: RecipeCartProps) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const missingIngredients = useMemo(() => {
    const pantry = (pantryItems || []).map((p) => String(p).toLowerCase().trim());
    const missing: string[] = [];

    (selectedRecipes || []).forEach((recipe: any) => {
      const ingredients = extractIngredientNames(recipe);

      ingredients.forEach((ing) => {
        const cleanIng = ing.toLowerCase().trim();

        const found = pantry.some(
          (p) => cleanIng === p || cleanIng.includes(p) || p.includes(cleanIng)
        );

        if (!found) missing.push(ing);
      });
    });

    return Array.from(new Set(missing));
  }, [selectedRecipes, pantryItems]);

  const emailBody = useMemo(() => {
    const recipeLines = (selectedRecipes || [])
      .map((r) => `- ${r?.name || r?.strMeal || "Unknown"}`)
      .join("\n");

    const ingredientLines = missingIngredients.map((i) => `- ${i}`).join("\n");

    return `Your BeavGredients Cooking Plan\n\nSelected Recipes:\n${recipeLines}\n\nMissing Ingredients:\n${ingredientLines}\n`;
  }, [selectedRecipes, missingIngredients]);

  async function handleStartCooking() {
    setStatus(null);

    const to = window.prompt("What email should I send your shopping list to?");
    if (!to) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject: "Your BeavGredients Shopping List",
          message: emailBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send email");

      setStatus("Email sent! Check your inbox.");
    } catch (err: any) {
      setStatus(`Failed to send: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l bg-white h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Recipe Kart</h2>
      </div>

      <div className="p-6 border-b">
        <h3 className="font-medium mb-4">Selected Recipes</h3>

        {selectedRecipes.length === 0 ? (
          <p className="text-sm text-gray-500">No recipes selected yet.</p>
        ) : (
          <div className="space-y-2">
            {selectedRecipes.map((recipe, idx) => {
              const id = recipe?.id ?? recipe?.idMeal ?? idx;
              const name = recipe?.name || recipe?.strMeal || "Unknown";

              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm truncate pr-2">{name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full"
                    onClick={() => onRemove(recipe?.id ?? recipe?.idMeal)}
                    aria-label={`Remove ${name}`}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 border-b">
        <h3 className="font-medium mb-4">Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Recipes:</span>
            <span className="font-medium">{selectedRecipes.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Missing Ingredients:</span>
            <span className="font-medium">{missingIngredients.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 border-b">
        <h3 className="font-medium mb-4">Missing Ingredients</h3>
        <ScrollArea className="h-40">
          {missingIngredients.length === 0 ? (
            <p className="text-sm text-gray-500">
              {selectedRecipes.length > 0
                ? "You have everything in your pantry!"
                : "Add a recipe to see what you're missing."}
            </p>
          ) : (
            <ul className="space-y-2">
              {missingIngredients.map((ingredient, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="mr-2">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>

      <div className="p-6 space-y-2">
        <Button
          className="w-full bg-black hover:bg-gray-800 text-white"
          onClick={handleStartCooking}
          disabled={isSending || selectedRecipes.length === 0}
        >
          {isSending ? "Sending..." : "Start Cooking"}
        </Button>

        {status && <p className="text-sm">{status}</p>}
      </div>
    </div>
  );
}