import fetch from "isomorphic-fetch"; //tslint:disable-line

const Fetch = (url: string, options: RequestInit): Promise<any> => {
  if (options.body!.toString().includes("non-error-class")) {
    return Promise.reject({
      status: 400,
      statusText: "wrong",
      text: () => {
        return Promise.resolve("something went wrong");
      },
    });
  }
  if (options.body!.toString().includes("error")) {
    return Promise.reject(new Error("something went wrong"));
  }
  const resultPromise = {
    text: () => {
      return Promise.resolve(options.body);
    },
  };
  return Promise.resolve(resultPromise);
};

export default Fetch;
