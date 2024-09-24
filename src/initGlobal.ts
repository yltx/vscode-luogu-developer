let initFinish: () => void = () => {};
//@ts-expect-error
globalThis.luogu = {};
globalThis.luogu.waitinit = new Promise(
  resolve => (initFinish = () => resolve())
);
export default initFinish;
