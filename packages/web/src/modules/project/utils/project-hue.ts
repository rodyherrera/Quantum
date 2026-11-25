const HUES = ['#6b75e2', '#e0773a', '#3f9f72', '#c2436e', '#2f8fbf', '#9a62d6'];

/* A stable colour per project, so its dot looks the same in the sidebar and in every list. */
export const projectHue = (id: number): string => HUES[Math.abs(id) % HUES.length] ?? HUES[0];
