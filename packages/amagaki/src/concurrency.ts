/**
 * Runs an async iterator over `items` with at most `limit` concurrent executions.
 */
export async function eachLimit<T>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<unknown>
): Promise<void> {
  await mapLimit(items, limit, fn);
}

/**
 * Maps an async iterator over `items` with at most `limit` concurrent executions,
 * preserving result order.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const concurrency = Math.max(1, Math.min(limit, items.length || 1));
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await fn(items[current], current);
    }
  };

  await Promise.all(Array.from({length: concurrency}, () => worker()));
  return results;
}
