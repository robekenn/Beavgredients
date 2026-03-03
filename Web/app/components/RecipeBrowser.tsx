"use client"

import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";

const TEST_USER_ID = "cc83483f-40ee-47f1-87eb-62c962c279bc";

// 1. ADDED: onAddToKart to the Interface
interface RecipeBrowserProps {
  initialData: any[];
  onAddToKart: (recipe: any) => void;
}

// 2. UPDATED: Component now accepts onAddToKart
export function RecipeBrowser({ initialData, onAddToKart }: RecipeBrowserProps) {
  const [recipes, setRecipes] = useState(initialData || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeLetter, setActiveLetter] = useState("a")
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewLetter = async (letter: string) => {
    setActiveLetter(letter);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const res = await fetch(`${apiBase}/api/home?letter=${letter}`);
      const data = await res.json();
      setRecipes(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch new letter:", err);
    }
  };

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  const handleFilterSelect = async (filterName: string) => {
    setIsFilterOpen(false);
    setIsLoading(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try { 
      const res = await fetch(`${apiBase}/api/meals/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: filterName, userId: TEST_USER_ID }),
      });

      const data = await res.json();
      const mealArray = data.meals ? data.meals : (Array.isArray(data) ? data : []);
      setRecipes(mealArray);
    } catch (err) {
      console.error("Filtering failed:", err);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold mb-4">Beavgredients</h1>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Find..." className="pl-10" />
          </div>

          <div className="relative">
            <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter className="h-4 w-4" />
              Filter
            </Button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 overflow-hidden">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Pantry Filters</div>
                  <button onClick={() => handleFilterSelect('matching')} className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors">My Ingredients</button>
                  <button onClick={() => handleFilterSelect('plus-one')} className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors">Missing 1 Ingredient</button>
                  <div className="h-px bg-gray-100 my-1" />
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Meal Type</div>
                  {['Vegetarian', 'Vegan', 'Breakfast', 'Dessert'].map((label) => (
                    <button key={label} onClick={() => handleFilterSelect(label)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">{label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <p className="animate-pulse">Searching your pantry...</p>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {recipes.map((recipe, index) => {
              const recipeName = recipe.name || recipe.strMeal || "Unknown Recipe";
              const recipeImage = recipe.image || recipe.strMealThumb;

              return (
                <div
                  key={recipe.id || recipe.idMeal || `recipe-${index}`}
                  className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img src={recipeImage} alt={recipeName} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm line-clamp-1">{recipeName}</h3>
                      
                      {/* 3. FIXED: Added onClick to the Add Button */}
                      <Button 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 shrink-0"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents clicking the whole card
                            onAddToKart(recipe);
                        }}
                      >
                        <span className="text-white text-lg">+</span>
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {recipe.displayedIngredients?.map((ingredient: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 text-[10px]">{ingredient}</Badge>
                      ))}
                      {recipe.hiddenCount > 0 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px]">+{recipe.hiddenCount}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-lg font-medium">No recipes found</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-white">
        <div className="flex flex-wrap gap-1.5 max-w-full">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              variant={activeLetter === letter ? "default" : "outline"}
              size="sm"
              className={`uppercase w-8 h-8 p-0 text-xs shrink-0 ${activeLetter === letter ? "bg-green-500 hover:bg-green-700" : ""}`}
              onClick={() => fetchNewLetter(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
