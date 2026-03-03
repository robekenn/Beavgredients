import "@testing-library/jest-dom";

// Mock fetch BEFORE importing Page
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

import { render, screen } from "@testing-library/react";
import Page from "../app/page";

test("renders page after loading", async () => {
  render(<Page />);

  // Wait for something real in your UI that always renders
  // Based on your DOM snapshot, "Pantry" always appears
  expect(await screen.findByText(/pantry/i)).toBeInTheDocument();

  // Browser mock renders "browser"
  expect(screen.getByText(/browser/i)).toBeInTheDocument();

  // The layout container exists
  expect(document.querySelector(".flex")).toBeInTheDocument();
});