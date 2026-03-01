// import { render, screen } from "@testing-library/react";
// import Page from "../app/page";

// test("renders page", () => {
//   render(<Page />);
//   expect(screen.getByTestId("page-root")).toBeInTheDocument();
// });
import { render, screen, waitFor } from "@testing-library/react";
import Page from "../app/page";
import '@testing-library/jest-dom'; 

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: 1, name: "Test Recipe", image: "" }]),
  })
) as jest.Mock;

test("renders page after loading", async () => {
  render(<Page />);

  await waitFor(() => {
    expect(screen.getByTestId("page-root")).toBeInTheDocument();
  });

  expect(screen.getByText("Beavgredients")).toBeInTheDocument();
});
