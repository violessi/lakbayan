export function groupBy<T, K extends keyof T>(data: T[], key: K): Record<string, T[]> {
  return data.reduce(
    (acc, item) => {
      const groupKey = item[key] as unknown as string; // Ensure the key is a string
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) throw new Error(msg);
}
