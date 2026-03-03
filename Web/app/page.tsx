"use client";

import { useEffect, useState } from "react";
import { PantryPanel } from "./components/PantryPanel";
import { RecipeBrowser } from "./components/RecipeBrowser";
import { RecipeCart } from "./components/RecipeCart";
import { Button } from "./components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function getRecipes() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${apiBase}/api/home?letter=a`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function App() {
  const [isPantryOpen, setIsPantryOpen] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ shared state between PantryPanel + RecipeCart
  const [pantryItems, setPantryItems] = useState<string[]>([]);

  // ✅ cart state for RecipeCart
  const [selectedRecipes, setSelectedRecipes] = useState<any[]>([]);

const addToKart = async (recipe: any) => {
  const id = String(recipe?.id ?? recipe?.idMeal ?? "");
  if (!id) return;

  // Prevent duplicate adds if already selected
  if (selectedRecipes.some((r) => String(r?.id ?? r?.idMeal ?? "") === id)) return;

  // Prevent double-click spam while request is in-flight
  if (addingIds.has(id)) return;

  setAddingIds((prev) => {
    const next = new Set(prev);
    next.add(id);
    return next;
  });

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const res = await fetch(`${apiBase}/api/meals/${id}`, {
      cache: "no-store",
    });

    // If fetch fails, fall back to partial object
    let fullMeal = recipe;

    if (res.ok) {
      const data = await res.json();

      // data is a full MealDB object from your backend
      fullMeal = data ?? recipe;

      // Optional: keep your simplified fields too
      // (so the cart list uses name/image consistently)
      if (!fullMeal.name && fullMeal.strMeal) fullMeal.name = fullMeal.strMeal;
      if (!fullMeal.image && fullMeal.strMealThumb) fullMeal.image = fullMeal.strMealThumb;
      if (!fullMeal.id && fullMeal.idMeal) fullMeal.id = fullMeal.idMeal;
    } else {
      console.warn("[addToKart] details fetch failed:", res.status);
    }

    // Add exactly once (re-check inside setState to avoid race conditions)
    setSelectedRecipes((prev) => {
      if (prev.some((r) => String(r?.id ?? r?.idMeal ?? "") === id)) return prev;
      return [...prev, fullMeal];
    });
  } catch (err) {
    console.error("[addToKart] error fetching details:", err);

    // Fallback: still add the partial recipe if it isn't already there
    setSelectedRecipes((prev) => {
      if (prev.some((r) => String(r?.id ?? r?.idMeal ?? "") === id)) return prev;
      return [...prev, recipe];
    });
  } finally {
    setAddingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }
};

const removeFromKart = (id: any) => {
  console.log("[page] removeFromKart called with id:", id);

  setSelectedRecipes((prev) => {
    const next = prev.filter((r) => (r?.id ?? r?.idMeal) !== id);
    console.log("[page] before remove:", prev.length, "after remove:", next.length);
    return next;
  });
};

  useEffect(() => {
    getRecipes()
      .then((data) => {
        setRecipes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div data-testid="page-root" className="flex h-screen bg-white overflow-hidden min-w-[1200px]">
      {/* Pantry Toggle */}
      {!isPantryOpen && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
          <Button
            aria-label="Open pantry"
            variant="outline"
            size="icon"
            className="rounded-r-lg rounded-l-none shadow-md"
            onClick={() => setIsPantryOpen(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Left Panel - Pantry */}
      <div className="relative">
        <PantryPanel
          isOpen={isPantryOpen}
          pantryItems={pantryItems}
          setPantryItems={setPantryItems}
        />

        {isPantryOpen && (
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10">
            <Button
              aria-label="Close pantry"
              variant="outline"
              size="icon"
              className="rounded-full shadow-md bg-white"
              onClick={() => setIsPantryOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Middle Panel - Recipe Browser */}
      <RecipeBrowser initialData={recipes} onAddToKart={addToKart} />

      {/* Right Panel - Recipe Cart */}
      <div className="relative">
        {isCartOpen && (
          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Button
              aria-label="Close cart"
              variant="outline"
              size="icon"
              className="rounded-full shadow-md bg-white"
              onClick={() => setIsCartOpen(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <RecipeCart
          isOpen={isCartOpen}
          selectedRecipes={selectedRecipes}
          pantryItems={pantryItems}
          onRemove={removeFromKart}
        />
      </div>

      {/* Cart Toggle */}
      {!isCartOpen && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
          <Button
            aria-label="Open cart"
            variant="outline"
            size="icon"
            className="rounded-l-lg rounded-r-none shadow-md"
            onClick={() => setIsCartOpen(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}