
import NodeCache from "node-cache";

// how can i make it so that the function that is passed keeps its type?
type CacheFunction<A extends any[], R> = (...args: A) => Promise<R>;

export default <A extends any[], R>(func: CacheFunction<A, R>) => {
  const cache = new NodeCache({ stdTTL: 60 * 60 });
  return async (...args: A): Promise<R> => {
    const key = JSON.stringify(args);
    const cachedData = cache.get<R>(key);
    if (cachedData) {
      return await cachedData;
    } else {
      const data = func(...args);
      cache.set(key, data);
      return await data;
    }
  };
};
