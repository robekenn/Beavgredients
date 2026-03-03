"use client";

import { useState, useEffect } from "react";
import { PantryPanel } from "./components/PantryPanel";
import { RecipeBrowser } from "./components/RecipeBrowser";
import { RecipeCart } from "./components/RecipeCart";
import { Button } from "./components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function getRecipes() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${apiBase}/api/home?letter=a`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function App() {
  const [isPantryOpen, setIsPantryOpen] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(true);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // simple cart state
  const [kart, setKart] = useState<any[]>([]);

  const addToKart = (recipe: any) => {
    setKart((prev) => {
      // prevent duplicates by id if possible
      const id = recipe?.id ?? recipe?.idMeal;
      if (id != null && prev.some((r) => (r?.id ?? r?.idMeal) === id)) return prev;
      return [...prev, recipe];
    });
  };

  const removeFromKart = (recipe: any) => {
    const id = recipe?.id ?? recipe?.idMeal;
    setKart((prev) => prev.filter((r) => (r?.id ?? r?.idMeal) !== id));
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
        <PantryPanel isOpen={isPantryOpen} />
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

      {/* Middle Panel Recipe Browser */}
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

        {/* If your RecipeCart already manages its own state, remove these props.
            If it supports them, this is the clean wiring: */}
        <RecipeCart isOpen={isCartOpen} kartItems={kart} onRemoveFromKart={removeFromKart} />
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