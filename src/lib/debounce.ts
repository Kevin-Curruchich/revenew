/**
 * Debounces an async function. Every call made while waiting resolves with
 * the result of the LAST call, and a response that arrives after a newer
 * call started is ignored: suggestion lists never show stale results.
 */
export const debounceLatest = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  ms: number,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let waiting: Array<{ resolve: (value: R) => void; reject: (error: unknown) => void }> = [];

  return (...args: A): Promise<R> =>
    new Promise<R>((resolve, reject) => {
      waiting.push({ resolve, reject });
      clearTimeout(timer);
      const current = ++generation;
      timer = setTimeout(() => {
        fn(...args).then(
          (value) => {
            if (current !== generation) return;
            const batch = waiting;
            waiting = [];
            batch.forEach((caller) => caller.resolve(value));
          },
          (error) => {
            if (current !== generation) return;
            const batch = waiting;
            waiting = [];
            batch.forEach((caller) => caller.reject(error));
          },
        );
      }, ms);
    });
};
