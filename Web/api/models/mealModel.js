const axios = require('axios');
const supabase = require('../supabase');

class MealModel {
  static async filterByPantry(userId, filterType) {
    const categories = ['Vegetarian', 'Vegan', 'Breakfast', 'Dessert'];
    
    // --- 1. CATEGORY LOGIC ---
    if (categories.includes(filterType)) {
      try {
        const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${filterType}`);
        const meals = res.data.meals || [];
        return meals.map(m => ({
          id: m.idMeal,
          name: m.strMeal,
          image: m.strMealThumb,
          totalIngredients: 0,
          displayedIngredients: [],
          hiddenCount: 0
        }));
      } catch (err) {
        console.error("MealDB Category Error:", err);
        return [];
      }
    }

    // --- 2. PANTRY LOGIC ---
    const { data: dbIngredients, error } = await supabase
      .from('ingredients') // Matches your table name
      .select('name')
      .eq('user_id', userId);

    if (error || !dbIngredients || dbIngredients.length === 0) return [];

    // "peanut_butter" -> "peanut butter"
    const pantryNames = dbIngredients.map(i => i.name.toLowerCase().replace(/_/g, ' ').trim());

    // Seeding logic to avoid "sugar/water/salt"
    const common = ['sugar', 'egg', 'eggs', 'salt', 'water', 'flour', 'milk'];
    const rare = pantryNames.filter(ing => !common.includes(ing));
    const seed = rare.length > 0 ? rare[0] : pantryNames[0];
    const apiTerm = seed.replace(/\s+/g, '_');

    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${apiTerm}`);
      const candidates = response.data.meals || [];
      const results = [];

      for (const meal of candidates.slice(0, 40)) {
        const detailRes = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const fullMeal = detailRes.data.meals[0];
        if (!fullMeal) continue;

        const recipeIngredients = this.extractIngredients(fullMeal);
        const missing = recipeIngredients.filter(rIng => 
          !pantryNames.some(pName => rIng.includes(pName) || pName.includes(rIng))
        );

        const formatted = {
          id: fullMeal.idMeal,
          name: fullMeal.strMeal,
          image: fullMeal.strMealThumb,
          totalIngredients: recipeIngredients.length,
          displayedIngredients: recipeIngredients.slice(0, 3),
          hiddenCount: Math.max(0, recipeIngredients.length - 3)
        };

        if (filterType === 'matching' && missing.length === 0) results.push(formatted);
        else if (filterType === 'plus-one' && missing.length === 1) results.push(formatted);
      }
      return results;
    } catch (err) {
      console.error("MealDB Pantry Error:", err);
      return [];
    }
  }

  static extractIngredients(meal) {
    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const val = meal[`strIngredient${i}`];
      if (val && val.trim() !== "") ings.push(val.toLowerCase().trim());
    }
    return ings;
  }
}

module.exports = MealModel;