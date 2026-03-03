import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ✅ Mocks MUST be declared before importing Page
jest.mock("../app/components/PantryPanel", () => ({
  PantryPanel: ({ isOpen }) => <div data-testid="pantry">{String(isOpen)}</div>,
}));

jest.mock("../app/components/RecipeBrowser", () => ({
  RecipeBrowser: () => <div data-testid="browser">browser</div>,
}));

jest.mock("../app/components/RecipeCart", () => ({
  RecipeCart: ({ isOpen }) => <div data-testid="cart">{String(isOpen)}</div>,
}));

import Page from "../app/page";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("pantry toggles open/closed", async () => {
  const user = userEvent.setup();
  render(<Page />);

  // wait for mocked panels to render
  expect(await screen.findByTestId("pantry")).toHaveTextContent("true");

  // Your toggle buttons are icon-only, so they have no accessible name.
  // Based on DOM shown in your error output:
  // - first button is pantry toggle
  // - second button is cart toggle
  const [pantryToggleBtn] = screen.getAllByRole("button");

  await user.click(pantryToggleBtn);
  expect(screen.getByTestId("pantry")).toHaveTextContent("false");

  await user.click(pantryToggleBtn);
  expect(screen.getByTestId("pantry")).toHaveTextContent("true");
});

test("cart toggles open/closed", async () => {
  const user = userEvent.setup();
  render(<Page />);

  expect(await screen.findByTestId("cart")).toHaveTextContent("true");

  const buttons = screen.getAllByRole("button");
  const cartToggleBtn = buttons[1]; // second icon button is cart toggle

  await user.click(cartToggleBtn);
  expect(screen.getByTestId("cart")).toHaveTextContent("false");

  await user.click(cartToggleBtn);
  expect(screen.getByTestId("cart")).toHaveTextContent("true");
});