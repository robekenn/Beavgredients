"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealId: string | null;
}

interface RecipeDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  ingredients: Array<{
    name: string;
    measure: string;
  }>;
}

export function RecipeDetailModal({ isOpen, onClose, mealId }: RecipeDetailModalProps) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mealId) {
      setRecipe(null);
      setError(null);
      return;
    }

    const fetchRecipeDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch directly from TheMealDB API
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch recipe details');
        }

        const data = await res.json();
        
        // TheMealDB returns { meals: [...] }
        if (!data.meals || data.meals.length === 0) {
          throw new Error('Recipe not found');
        }

        const meal = data.meals[0];
        
        // Parse ingredients from the flat structure
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          
          if (ingredient && ingredient.trim()) {
            ingredients.push({
              name: ingredient.trim(),
              measure: measure ? measure.trim() : ''
            });
          }
        }

        setRecipe({
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strCategory: meal.strCategory || '',
          strArea: meal.strArea || '',
          strInstructions: meal.strInstructions || '',
          strMealThumb: meal.strMealThumb || '',
          strTags: meal.strTags || '',
          ingredients
        });
      } catch (err) {
        console.error("Failed to fetch recipe details:", err);
        setError("Failed to load recipe details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [isOpen, mealId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Loading recipe...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        ) : recipe ? (
          <div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold pr-8">{recipe.strMeal}</DialogTitle>
            </DialogHeader>

            <div className="mt-4">
              {/* Recipe Image */}
              <div className="w-full h-64 overflow-hidden rounded-lg bg-gray-100 mb-6">
                <img 
                  src={recipe.strMealThumb} 
                  alt={recipe.strMeal} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {recipe.strCategory}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {recipe.strArea}
                </Badge>
                {recipe.strTags && recipe.strTags.split(',').map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>

              {/* Ingredients Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                <div className="grid grid-cols-2 gap-2">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-2 p-2 rounded bg-gray-50"
                    >
                      <span className="text-green-600 font-medium">•</span>
                      <div className="flex-1">
                        <span className="font-medium">{ingredient.name}</span>
                        {ingredient.measure && (
                          <span className="text-gray-600 ml-2">- {ingredient.measure}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Section */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                <div className="prose max-w-none">
                  {recipe.strInstructions.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p key={idx} className="mb-3 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
