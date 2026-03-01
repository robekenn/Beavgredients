"use client";

import { useEffect, useState } from "react";
import { PantryPanel } from "./components/PantryPanel";
import { RecipeBrowser } from "./components/RecipeBrowser";
import { RecipeCart } from "./components/RecipeCart";
import { Button } from "./components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function getRecipes(letter: string = "a") {
  const res = await fetch(`/home?letter=${letter}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recipes");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function App() {
  const [isPantryOpen, setIsPantryOpen] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(true);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getRecipes("a");
        if (!cancelled) setRecipes(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setRecipes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div
      data-testid="page-root"
      className="flex h-screen bg-white overflow-hidden min-w-[1200px]"
    >
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
      <RecipeBrowser initialData={recipes} />

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
        <RecipeCart isOpen={isCartOpen} />
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