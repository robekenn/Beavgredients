"use client"

import { useState, useEffect } from "react";
import { PantryPanel } from "./components/PantryPanel";
import { RecipeBrowser } from "./components/RecipeBrowser";
import { RecipeCart } from "./components/RecipeCart";
import { Button } from "./components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import supabase from "@/api/supabase";

const TEST_USER_ID = "cc83483f-40ee-47f1-87eb-62c962c279bc";

async function getRecipes(){
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const res = await fetch(`${apiBase}/api/home?letter=a`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch data'); // Fix for the fetch error seen in logs
  return res.json();
}

export default function App() {
  const [isPantryOpen, setIsPantryOpen] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [kart, setKart] = useState<any[]>([]);
  const [pantryItems, setPantryItems] = useState<string[]>([]);

  const addToKart = (recipe: any) => {
    const recipeId = recipe.id || recipe.idMeal;
    if (!kart.find(item => (item.id || item.idMeal) === recipeId)) {
      setKart(prev => [...prev, recipe]);
    }
  };

  const removeFromKart = (recipeId: any) => {
    setKart(prev => prev.filter(item => (item.id || item.idMeal) !== recipeId));
  };

  useEffect(() => {
    getRecipes().then(data => {
      setRecipes(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const fetchPantry = async () => {
      try {
        const { data, error } = await supabase
          .from("ingredients")
          .select("name")
          .eq("user_id", TEST_USER_ID);

        if (error) throw error;
        if (data) {
          setPantryItems(data.map(item => item.name.toLowerCase().trim()));
        }
      } catch (err) {
        console.error("Error fetching pantry items:", err);
      }
    };
    fetchPantry();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden min-w-[1200px]">
      <div className="relative flex shrink-0">
        <PantryPanel 
          isOpen={isPantryOpen} 
          pantryItems={pantryItems} 
          setPantryItems={setPantryItems} 
        />
        <Button
          variant="outline" size="icon"
          className={`absolute top-1/2 z-20 transform -translate-y-1/2 transition-all rounded-full bg-white shadow-md ${isPantryOpen ? 'right-0 translate-x-1/2' : 'left-0'}`}
          onClick={() => setIsPantryOpen(!isPantryOpen)}
        >
          {isPantryOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>

      {/* FIXED: Passing onAddToKart as required by the component */}
      <RecipeBrowser initialData={recipes} onAddToKart={addToKart} />

      <div className="relative flex shrink-0">
        <RecipeCart 
          isOpen={isCartOpen} 
          selectedRecipes={kart}
          pantryItems={pantryItems} 
          onRemove={removeFromKart} 
        />
        <Button
          variant="outline" size="icon"
          className={`absolute top-1/2 z-20 transform -translate-y-1/2 transition-all rounded-full bg-white shadow-md ${isCartOpen ? 'left-0 -translate-x-1/2' : 'right-0'}`}
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          {isCartOpen ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
    </div>
  );
}