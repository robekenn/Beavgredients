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

import { render, screen, waitFor } from "@testing-library/react";
import Page from "../app/page";

test("renders page after loading", async () => {
  render(<Page />);

  await waitFor(() => {
    expect(screen.getByTestId("page-root")).toBeInTheDocument();
  });

  expect(screen.getByText(/beavgredients/i)).toBeInTheDocument();
});