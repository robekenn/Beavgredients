"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const TEST_USER_ID = "cc83483f-40ee-47f1-87eb-62c962c279bc";
type AnyRecipe = any;

export function RecipeBrowser({ initialData }: { initialData: AnyRecipe[] }) {
  const [recipes, setRecipes] = useState<AnyRecipe[]>(initialData || []);
  const [activeLetter, setActiveLetter] = useState("a");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const alphabet = useMemo(() => "abcdefghijklmnopqrstuvwxyz".split(""), []);

  // Keep state in sync if initialData changes (e.g. page fetch completes)
  useEffect(() => {
    setRecipes(initialData || []);
  }, [initialData]);

  const normalized = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const list = recipes.map((r: AnyRecipe, index: number) => {
      const name = r?.name || r?.strMeal || "Unknown Recipe";
      const image = r?.image || r?.strMealThumb || null;

      const displayedIngredients: string[] =
        Array.isArray(r?.displayedIngredients) ? r.displayedIngredients : [];
      const hiddenCount: number = Number.isFinite(r?.hiddenCount) ? r.hiddenCount : 0;

      return {
        key: r?.id ?? r?.idMeal ?? `recipe-${index}`,
        raw: r,
        name,
        image,
        displayedIngredients,
        hiddenCount,
      };
    });

    if (!q) return list;
    return list.filter((x) => x.name.toLowerCase().includes(q));
  }, [recipes, searchText]);

  async function fetchNewLetter(letter: string) {
    setActiveLetter(letter);
    setIsFilterOpen(false);

    try {
      const res = await fetch(`/home?letter=${letter}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};  
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch new letter:", err);
      setRecipes([]);
    }
  }

  // ✅ FIX: call SAME ORIGIN so preview → preview and prod → prod (no CORS)
  async function handleFilterSelect(filterName: string) {
  setIsFilterOpen(false);
  setIsLoading(true);

  try {
    const res = await fetch(`/api/meals/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: filterName, userId: TEST_USER_ID }),
    });

    const text = await res.text(); // <-- read raw body safely
    if (!res.ok) {
      console.error("Filter API error:", res.status, text);
      throw new Error(`Filter API failed (${res.status})`);
    }

    if (!text) {
      console.error("Filter API returned empty body");
      setRecipes([]);
      return;
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Filter API returned non-JSON:", text);
      setRecipes([]);
      return;
    }

    const mealArray = data?.meals ? data.meals : Array.isArray(data) ? data : [];
    setRecipes(mealArray);
  } catch (err) {
    console.error("Filtering failed:", err);
    setRecipes([]);
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold mb-4">Beavgredients</h1>

        {/* Search + Filter */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Find recipes..."
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsFilterOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isFilterOpen}
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>

            {isFilterOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-20 overflow-hidden"
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors"
                  onClick={() => handleFilterSelect("matching")}
                >
                  My Ingredients
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  onClick={() => handleFilterSelect("plus-one")}
                >
                  Missing 1 Ingredient
                </button>

                <div className="h-px bg-gray-100 my-1" />

                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                  Meal Type
                </div>

                {["Vegetarian", "Vegan", "Breakfast", "Dessert"].map((label) => (
                  <button
                    key={label}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => handleFilterSelect(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alphabet pagination */}
        <div className="flex flex-wrap gap-1.5 mt-4 max-w-full">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              variant={activeLetter === letter ? "default" : "outline"}
              size="sm"
              className={`uppercase w-8 h-8 p-0 text-xs shrink-0 ${
                activeLetter === letter ? "bg-green-500 hover:bg-green-700" : ""
              }`}
              onClick={() => fetchNewLetter(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
            <p className="animate-pulse">Searching your pantry...</p>
          </div>
        ) : normalized.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {normalized.map((r) => (
              <div
                key={r.key}
                className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">{r.name}</h3>
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 shrink-0"
                      aria-label={`Add ${r.name}`}
                    >
                      <span className="text-white text-lg">+</span>
                    </Button>
                  </div>

                  {(r.displayedIngredients.length > 0 || r.hiddenCount > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.displayedIngredients.map((ingredient: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 text-[10px]"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                      {r.hiddenCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-500 text-[10px]"
                        >
                          +{r.hiddenCount}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-lg font-medium">No recipes found</p>
            <p className="text-sm">Try a different letter or add more pantry items.</p>
          </div>
        )}
      </div>
    </div>
  );
}