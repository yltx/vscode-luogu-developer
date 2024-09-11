declare module '*.lazy.css' {
  const dat: { use(): typeof dat; unuse(): void };
  export default dat;
}
declare module '*.svg' {
  const path: string;
  export default path;
}
