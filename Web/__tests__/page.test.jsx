import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "../app/page";

jest.mock("../app/components/PantryPanel", () => ({
  PantryPanel: ({ isOpen }) => <div data-testid="pantry">{String(isOpen)}</div>,
}));

jest.mock("../app/components/RecipeBrowser", () => ({
  RecipeBrowser: () => <div data-testid="browser">browser</div>,
}));

jest.mock("../app/components/RecipeCart", () => ({
  RecipeCart: ({ isOpen }) => <div data-testid="cart">{String(isOpen)}</div>,
}));

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

  // wait for UI to render after fetch resolves
  expect(await screen.findByTestId("pantry")).toHaveTextContent("true");

  await user.click(screen.getByRole("button", { name: /close pantry/i }));
  expect(screen.getByTestId("pantry")).toHaveTextContent("false");

  await user.click(screen.getByRole("button", { name: /open pantry/i }));
  expect(screen.getByTestId("pantry")).toHaveTextContent("true");
});

test("cart toggles open/closed", async () => {
  const user = userEvent.setup();
  render(<Page />);

  expect(await screen.findByTestId("cart")).toHaveTextContent("true");

  await user.click(screen.getByRole("button", { name: /close cart/i }));
  expect(screen.getByTestId("cart")).toHaveTextContent("false");

  await user.click(screen.getByRole("button", { name: /open cart/i }));
  expect(screen.getByTestId("cart")).toHaveTextContent("true");
});
