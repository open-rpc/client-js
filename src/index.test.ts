import Client from ".";

describe("client-js", () => {
  it("can be constructed", () => {
    const c = new Client();
    expect(!!c).toEqual(true);
  });

  it("has a request method that returns a promise", () => {
    const c = new Client();
    expect(typeof c.request).toEqual("function");
    expect(typeof c.request("my_method", null).then).toEqual("function");
  });
});
