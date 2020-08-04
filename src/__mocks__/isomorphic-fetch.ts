import * as req from "./requestData";

const Fetch = jest.fn((url: string, options: any): Promise<any> => {
  if (url.match(/crash/)) {
    throw new Error("Random Segfault that crashes fetch");
  }
  const resultPromise = {
    text: () => {
      return Promise.resolve(req.generateMockResponseData(url, options.body));
    },
  };
  return Promise.resolve(resultPromise);
});

export default Fetch;
