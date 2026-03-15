import type { AxeResults, RunOptions, Spec } from "axe-core";

declare module "jest-axe" {
  export function axe(html: Element | Document, options?: RunOptions): Promise<AxeResults>;

  export function configureAxe(spec?: Spec): (html: Element | Document, options?: RunOptions) => Promise<AxeResults>;

  export const toHaveNoViolations: jest.ExpectExtendMap;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}
