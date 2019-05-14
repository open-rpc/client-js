const Fetch = (url: string, options: any): Promise<any> => {
  const resultPromise = {
    text: () => {
      return Promise.resolve(options.body);
    },
  };
  return Promise.resolve(resultPromise);
};

export default Fetch;
