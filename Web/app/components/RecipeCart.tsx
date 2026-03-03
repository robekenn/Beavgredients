"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface SelectedRecipe {
  id: number;
  name: string;
}

export function RecipeCart({ isOpen }: { isOpen: boolean }) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectedRecipes: SelectedRecipe[] = [
    { id: 1, name: "Lola Mi's Halo Halo" },
    { id: 2, name: "Lola Mi's Halo Halo" },
  ];

  const missingIngredients = ["Milk", "Mango", "Cereal", "Marshmallows"];

  const emailBody = useMemo(() => {
    const recipeLines = selectedRecipes.map(r => `- ${r.name}`).join("\n");
    const ingredientLines = missingIngredients.map(i => `- ${i}`).join("\n");
    return `Your BeavGredients Cooking Plan\n\nSelected Recipes:\n${recipeLines}\n\nMissing Ingredients:\n${ingredientLines}\n`;
  }, [selectedRecipes, missingIngredients]);

  async function handleStartCooking() {
    setStatus(null);

    // TODO: replace this with the signed-in user's email later
    const to = window.prompt("What email should I send your shopping list to?");
    if (!to) return;

    setIsSending(true);
    try {
      const res = await fetch("https://beavgredient.onrender.com/api/send-email.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "someone@gmail.com",
          subject: "This Week’s Dinners",
          title: "Meal Plan (Recipes Included)",
          introMessage: "Here are the dinners + full recipes.",
          meals: [
            { id: "52772", day: "Monday" },
            { id: "52874", day: "Tuesday" },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send email");
      }

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
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Recipe Kart</h2>
      </div>

      {/* Selected Recipes */}
      <div className="p-6 border-b">
        <h3 className="font-medium mb-4">Selected Recipes</h3>
        <div className="space-y-2">
          {selectedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm">{recipe.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full"
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
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

      {/* Missing Ingredients */}
      <div className="flex-1 p-6 border-b">
        <h3 className="font-medium mb-4">Missing Ingredients</h3>
        <ScrollArea className="h-40">
          <ul className="space-y-2">
            {missingIngredients.map((ingredient, idx) => (
              <li key={idx} className="text-sm flex items-start">
                <span className="mr-2">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      {/* Send Email Button */}
      <div className="p-6 space-y-2">
        <Button
          className="w-full bg-black hover:bg-gray-800 text-white"
          onClick={handleStartCooking}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Start Cooking"}
        </Button>

        {status && <p className="text-sm">{status}</p>}
      </div>
    </div>
  );
}