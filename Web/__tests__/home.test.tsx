import "@testing-library/jest-dom";

// ✅ Mock fetch BEFORE importing Page
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: "1",
          name: "Test Recipe",
          image: "",
          recipe: "Step 1: Cook.\nStep 2: Eat.",
          strIngredient1: "Salt",
          strMeasure1: "1 tsp",
        },
      ]),
  } as any)
) as jest.Mock;

// ✅ Mock child components BEFORE importing Page (same idea as page.test.jsx)
jest.mock("../app/components/PantryPanel", () => ({
  PantryPanel: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="pantry">{String(isOpen)}</div>
  ),
}));

jest.mock("../app/components/RecipeBrowser", () => ({
  RecipeBrowser: () => <div data-testid="browser">browser</div>,
}));

jest.mock("../app/components/RecipeCart", () => ({
  RecipeCart: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="cart">{String(isOpen)}</div>
  ),
}));

import { render, screen } from "@testing-library/react";
import Page from "../app/page";

test("renders page after loading", async () => {
  render(<Page />);

  // Wait for the mocked panels to appear (means Page mounted successfully)
  expect(await screen.findByTestId("pantry")).toBeInTheDocument();
  expect(screen.getByTestId("browser")).toHaveTextContent("browser");
  expect(screen.getByTestId("cart")).toBeInTheDocument();

  // And verify initial open state (based on your other tests)
  expect(screen.getByTestId("pantry")).toHaveTextContent("true");
  expect(screen.getByTestId("cart")).toHaveTextContent("true");
});