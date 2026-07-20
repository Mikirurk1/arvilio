/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}
