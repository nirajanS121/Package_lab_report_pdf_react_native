export type RecordProps<K extends string, V> = { [key in K]: V };
export function className(...args: (string | RecordProps<string, boolean> | null | undefined | number)[]): string {
  return args
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (typeof arg === "number") return String(arg);
      if (arg === null || arg === undefined) return "";
      return Object.entries(arg)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join(" ");
    })
    .join(" ");
}
