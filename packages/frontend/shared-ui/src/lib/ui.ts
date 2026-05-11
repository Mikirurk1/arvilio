export type UiCardSpec = {
  title: string;
  subtitle?: string;
};

export function createCardSpec(title: string, subtitle?: string): UiCardSpec {
  return { title, subtitle };
}
