const { estimation, optimise } = require("../src/imageOptimiser");

const basePath = "./images";

test("Estimator function test", async () => {
  expect(await estimation(basePath)).toBe(8);
});

describe("optimise function test", () => {
  test("invalid key", async () => {
    const res = await optimise(["INVALID_KEY"], basePath);
    expect(res).toBe("INVALID_API_KEY");
  });
  test("valid key", async () => {
    const res = await optimise(["INVALID_KEY"], basePath);
    expect(res).toBe("INVALID_API_KEY");
  });
});
