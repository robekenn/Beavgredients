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
      { name: "Milk", selected: false },
      { name: "White Rice", selected: false },
      { name: "Sugar", selected: false },
      {name: "Peanut Butter", selected: false},
    ],
  },
  {
    type: "Dairy",
    collapsed: false,
    ingredients: [
      { name: "Butter", selected: false },
      { name: "Cheese", selected: false },
      { name: "Yogurt", selected: false },
      { name: "Cream", selected: false },
    ],
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
    ],
  },
];
