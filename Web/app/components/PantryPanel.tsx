"use client"

import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useState, useEffect } from "react";
import { initialPantryData } from "../data/pantryData";
import type { FoodCategory } from "../data/pantryData";

const TEST_USER_ID = "cc83483f-40ee-47f1-87eb-62c962c279bc";

interface PantryPanelProps {
  isOpen: boolean;
  pantryItems: string[];
  setPantryItems: React.Dispatch<React.SetStateAction<string[]>>;
}

export function PantryPanel({ isOpen, pantryItems, setPantryItems }: PantryPanelProps) {
  const [categories, setCategories] = useState<FoodCategory[]>(initialPantryData);

  // Sync internal UI (bubbles) with the global pantry state
  useEffect(() => {
    setCategories(prev => prev.map(category => ({
      ...category,
      ingredients: category.ingredients.map(ing => ({
        ...ing,
        selected: pantryItems.includes(ing.name.toLowerCase().trim())
      }))
    })));
  }, [pantryItems]);

  const toggleCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories[index].collapsed = !newCategories[index].collapsed;
    setCategories(newCategories);
  };

  const handleIngredientToggle = async (categoryIndex: number, ingredientIndex: number) => {
    const targetIng = categories[categoryIndex].ingredients[ingredientIndex];
    const ingredientName = targetIng.name.toLowerCase().trim();
    const newSelectedStatus = !targetIng.selected;

    // 1. Update Global State Immediately (This makes the shopping list dynamic)
    if (newSelectedStatus) {
      setPantryItems(prev => prev.includes(ingredientName) ? prev : [...prev, ingredientName]);
    } else {
      setPantryItems(prev => prev.filter(item => item !== ingredientName));
    }

    // 2. Sync with backend
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingredients/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          name: targetIng.name,
          isSelected: newSelectedStatus
        }),
      });

      if (!response.ok) console.error("Failed to sync with database");
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-r bg-white h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Pantry</h2>
      </div>


      <div className="flex-1 overflow-y-auto">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="border-b">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{category.type}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleCategory(categoryIndex)}>
                  {category.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {!category.collapsed && (
                <div className="flex flex-wrap gap-2">
                  {category.ingredients.map((ingredient, ingredientIndex) => (
                    <label
                      key={ingredientIndex}
                      // Changed to onClick for better React event consistency
                      onClick={(e) => {
                        e.preventDefault();
                        handleIngredientToggle(categoryIndex, ingredientIndex);
                      }}
                      className={`px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                        ingredient.selected
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={ingredient.selected} className="hidden" />
                        <span className="text-sm">{ingredient.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
