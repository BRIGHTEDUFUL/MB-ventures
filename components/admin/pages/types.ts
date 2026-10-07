export interface PageValues {
  title: string;
  slug: string;
  body: string;
  isPublished: boolean;
  showInFooter: boolean;
  sortOrder: number;
}

export type PageErrors = Partial<Record<keyof PageValues, string>>;

export const DEFAULT_PAGE_VALUES: PageValues = {
  title: "",
  slug: "",
  body: "",
  isPublished: false,
  showInFooter: false,
  sortOrder: 0,
};

export const INPUT_CLASS =
  "w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

export const TEXTAREA_CLASS =
  "w-full p-3 rounded-md border border-line-strong bg-surface text-xs font-sans text-ink leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

export const FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
