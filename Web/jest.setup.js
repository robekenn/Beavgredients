require("@testing-library/jest-dom");

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]), // return empty recipe list
  })
);
