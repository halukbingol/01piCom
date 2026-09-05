/**
 * Ambient declarations so TypeScript treats raw content artifacts imported via
 * webpack's `asset/source` as string modules.
 */
declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: string;
  export default content;
}

declare module '*.java' {
  const content: string;
  export default content;
}

declare module '*.js' {
  const content: string;
  export default content;
}
