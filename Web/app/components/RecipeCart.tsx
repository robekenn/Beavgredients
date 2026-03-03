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

export function RecipeCart({ isOpen, selectedRecipes, pantryItems, onRemove }: RecipeCartProps) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const missingIngredients = useMemo(() => {
    const selectedPantryNames = pantryItems; 
    const missing: string[] = [];

    selectedRecipes.forEach((recipe: any) => {
      for (let i = 1; i <= 20; i++) {
        const ing = recipe[`strIngredient${i}`];
        if (ing && typeof ing === 'string' && ing.trim() !== "") {
          const cleanRecipeIng = ing.toLowerCase().trim();
          const isFoundInPantry = selectedPantryNames.some(pantryName => 
            cleanRecipeIng === pantryName || 
            cleanRecipeIng.includes(pantryName) || 
            pantryName.includes(cleanRecipeIng)
          );
          if (!isFoundInPantry) missing.push(ing); 
        }
      }
    });
    return Array.from(new Set(missing));
  }, [selectedRecipes, pantryItems]);

  const emailBody = useMemo(() => {
    const recipeLines = selectedRecipes.map(r => `- ${r.name || r.strMeal}`).join("\n");
    const ingredientLines = missingIngredients.map(i => `- ${i}`).join("\n");
    return `Your BeavGredients Cooking Plan\n\nSelected Recipes:\n${recipeLines}\n\nMissing Ingredients (Shopping List):\n${ingredientLines}\n`;
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
        body: JSON.stringify({ to, subject: "Your BeavGredients Shopping List", message: emailBody }),
      });
      if (!res.ok) throw new Error("Failed to send email");
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
                  <div key={recipe.id || recipe.idMeal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    {/* Added truncate to prevent the name from pushing the button out */}
                    <span className="text-sm font-medium truncate pr-2">
                      {recipe.name || recipe.strMeal}
                    </span>
                    {/* RESTORED: The remove button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full shrink-0 flex items-center justify-center"
                      onClick={() => onRemove(recipe.id || recipe.idMeal)}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-6 border-t pb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shopping List</h3>
                {missingIngredients.length > 0 && (
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {missingIngredients.length} TO BUY
                  </span>
                )}
              </div>
              
              <ul className="space-y-2">
                {missingIngredients.length > 0 ? (
                  missingIngredients.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                      {item}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    {selectedRecipes.length > 0 ? "Everything is in your pantry!" : "Add a recipe to see the list."}
                  </p>
                )}
              </ul>
            </section>
          </div>
        </ScrollArea>
      </div>

      <div className="p-6 border-t bg-gray-50 space-y-3 shrink-0">
        {status && (
          <p className={`text-xs font-medium text-center p-2 rounded ${status.includes('Failed') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
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