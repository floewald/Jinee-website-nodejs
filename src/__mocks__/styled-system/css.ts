// Mock for @/styled-system/css — returns concatenated prop values as a class name
// so that unit tests can verify components render without needing the real Panda runtime.
export const css = () => "panda-mock";
export const cx = (...args: string[]) => args.filter(Boolean).join(" ");
export const cva = () => () => "panda-mock";
export const sva = () => () => ({});
