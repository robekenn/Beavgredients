export interface Ingredient {
  name: string;
  selected: boolean;
}

export interface FoodCategory {
  type: string;
  ingredients: Ingredient[];
  collapsed: boolean;
}

export const initialPantryData: FoodCategory[] = [
  {
    type: "Essentials",
    collapsed: false,
    ingredients: [
      { name: "Egg", selected: false },
      { name: "Salt", selected: false },
      { name: "Black Pepper", selected: false },
      { name: "White Rice", selected: false },
      { name: "Sugar", selected: false },
      { name: "Peanut Butter", selected: false},
      { name: "Flour", selected: false },
      { name: "Bread", selected: false },
      { name: "Pasta", selected: false },
      { name: "Honey", selected: false },
      { name: "Chicken Stock", selected: false },
      { name: "Beef Stock", selected: false },
      { name: "Vegetable Stock", selected: false },
      { name: "Oats", selected: false },
      { name: "Water", selected: false },
    ],
  },
    { type: "Baking", 
    collapsed: false, 
    ingredients: [
      { name: "Baking Powder", selected: false },
      { name: "Baking Soda", selected: false },
      { name: "Vanilla Extract", selected: false },
      { name: "Cocoa Powder", selected: false },
      { name: "Yeast", selected: false },
      { name: "Cornstarch", selected: false },
      { name: "Peanuts", selected: false },
      { name: "Almonds", selected: false },
      { name: "Walnuts", selected: false },
      { name: "Pecans", selected: false },
      { name: "Hazelnuts", selected: false },
      { name: "Cashews", selected: false },
      { name: "Molasses", selected: false },
      { name: "Maple Syrup", selected: false },
    ] 
  },
    { type: "Canned & Legumes", 
    collapsed: false, 
    ingredients: [
      { name: "Canned Beans", selected: false },
      { name: "Canned Tuna", selected: false },
      { name: "Canned Corn", selected: false },
      { name: "Canned Tomatoes", selected: false },
      { name: "Lentils", selected: false },
      { name: "Chickpeas", selected: false },
      { name: "Black Beans", selected: false },
      { name: "Kidney Beans", selected: false },
      { name: "Pinto Beans", selected: false },
      { name: "Tomato Paste", selected: false },
      { name: "Coconut Milk", selected: false },
    ] 
  },
  {
    type: "Dairy",
    collapsed: false,
    ingredients: [
      { name: "Butter", selected: false },
      { name: "Cheese", selected: false },
      { name: "Yogurt", selected: false },
      { name: "Cream", selected: false },
      { name: "Milk", selected: false },
      { name: "Sour Cream", selected: false },
    ],
  },
    { type: "Fruits", 
    collapsed: false, 
    ingredients: [
      { name: "Apple", selected: false },
      { name: "Banana", selected: false },
      { name: "Orange", selected: false },
      { name: "Lemon", selected: false },
      { name: "Strawberry", selected: false },
      { name: "Blueberry", selected: false },
      { name: "Grapes", selected: false },
      { name: "Lime", selected: false },
      { name: "Watermelon", selected: false },
      { name: "Pineapple", selected: false },
      { name: "Mango", selected: false },
      { name: "Peach", selected: false },
      { name: "Raspberry", selected: false },
      { name: "Coconut", selected: false },
    ] 
  },
    {
    type: "Meats",
    collapsed: false,
    ingredients: [
      { name: "Chicken", selected: false },
      { name: "Beef", selected: false },
      { name: "Pork", selected: false },
      { name: "Salmon", selected: false },
      { name: "Lamb", selected: false },
    ],
  },
    { type: "Sauces & Condiments", 
    collapsed: false, 
    ingredients: [
    { name: "Ketchup", selected: false },
    { name: "Mustard", selected: false },
    { name: "Mayonnaise", selected: false },
    { name: "Hot Sauce", selected: false },
    { name: "Barbeque Sauce", selected: false },
    { name: "Ranch Dressing", selected: false },
    { name: "Italian Dressing", selected: false },
    { name: "Thousand Island Dressing", selected: false },
    { name: "Sriracha", selected: false },
    { name: "Teriyaki Sauce", selected: false },
    { name: "Worcestershire Sauce", selected: false },
    { name: "Fish Sauce", selected: false },
    ]
  },
    {
    type: "Seasonings, Spices, Oils",
    collapsed: false,
    ingredients: [
      { name: "Olive Oil", selected: false },
      { name: "Soy Sauce", selected: false },
      { name: "Vinegar", selected: false },
      { name: "Cumin", selected: false },
      { name: "Paprika", selected: false },
      { name: "Chili Powder", selected: false },
      { name: "Oregano", selected: false },
      { name: "Basil", selected: false },
      { name: "Cinnamon", selected: false },
      { name: "Nutmeg", selected: false },
      { name: "Ginger", selected: false },
      { name: "Garlic Powder", selected: false },
      { name: "Onion Powder", selected: false },
      { name: "Seasame Oil", selected: false },
    ]
  },
  {
    type: "Vegetables",
    collapsed: false,
    ingredients: [
      { name: "Tomato", selected: false },
      { name: "Onion", selected: false },
      { name: "Garlic", selected: false },
      { name: "Carrot", selected: false },
      { name: "Broccoli", selected: false },
      { name: "Spinach", selected: false },
      { name: "Bell Pepper", selected: false },
      { name: "Mushroom", selected: false },
      { name: "Cucumber", selected: false },
      { name: "Zucchini", selected: false },
      { name: "Potato", selected: false },
      { name: "Sweet Potato", selected: false },
    ],
  }
];
