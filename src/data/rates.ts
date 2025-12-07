export type Unit = 'EA' | 'LF' | 'SF';

export type CategoryKey = 'general' | 'minimums' | 'cabinets' | 'additional';

interface RateEntry {
  name: string;
  unit: Unit;
  rate: number;
}

type RatesData = Record<CategoryKey, Record<Unit, RateEntry[]>>;

export const ratesData: RatesData = {
  general: {
    EA: [
      { name: 'Doors (Per Side)', unit: 'EA', rate: 18.75 },
      { name: 'Prep Stain Doors for Paint (Per Side)', unit: 'EA', rate: 28.12 },
      { name: 'Wood/Brick Fireplace Mantle', unit: 'EA', rate: 262.5 },
      { name: 'Built-In Shelves', unit: 'EA', rate: 37.5 },
      { name: 'Skylights', unit: 'EA', rate: 37.5 },
      { name: 'Window Casing', unit: 'EA', rate: 37.5 },
      { name: 'Furniture (Per Room)', unit: 'EA', rate: 37.5 },
      { name: 'Excessive Furniture (Per Room)', unit: 'EA', rate: 56.25 },
      { name: 'Stair Risers', unit: 'EA', rate: 18.75 },
      { name: 'Stair Treads', unit: 'EA', rate: 18.75 },
      { name: 'Spindles', unit: 'EA', rate: 7.5 },
      { name: 'Excessive Prep: Full Day', unit: 'EA', rate: 750 },
      { name: 'Excessive Prep: Half Day', unit: 'EA', rate: 375 },
      { name: 'Excessive Prep: Quarter Day', unit: 'EA', rate: 187.5 },
      { name: 'Spray Interior Doors (Per Side)', unit: 'EA', rate: 75 },
      { name: 'Paint Stained Casing', unit: 'EA', rate: 150 },
      { name: 'Paint (Gallon)', unit: 'EA', rate: 75 },
      { name: 'Paint (Quart)', unit: 'EA', rate: 0 },
    ],
    LF: [
      { name: 'Stained Trim', unit: 'LF', rate: 2.62 },
      { name: 'Crown Molding', unit: 'LF', rate: 1.87 },
      { name: 'Prep/Paint Stained Crown', unit: 'LF', rate: 3 },
      { name: 'Wallpaper Border Removal', unit: 'LF', rate: 3.75 },
      { name: 'Install Crown Molding', unit: 'LF', rate: 3.75 },
      { name: 'Install Baseboard (Paint Project Only)', unit: 'LF', rate: 1.5 },
      { name: 'Banister (Cap + Base Only)', unit: 'LF', rate: 18.75 },
      { name: 'Baseboard/Casing Touch-up', unit: 'LF', rate: 2 },
    ],
    SF: [
      { name: 'Paint Walls, Ceiling, Trim (Standard)', unit: 'SF', rate: 2.25 },
      { name: 'Wallpaper Removal', unit: 'SF', rate: 2.25 },
      { name: 'High Ceiling/Walls', unit: 'SF', rate: 3.26 },
      { name: 'Wood Paneling Add-On', unit: 'SF', rate: 1.12 },
      { name: 'Block/Brick Wall Add-On', unit: 'SF', rate: 0.49 },
      { name: 'Color Change Add-On', unit: 'SF', rate: 1.12 },
      { name: 'Paint Ceiling', unit: 'SF', rate: 0.8 },
    ],
  },
  minimums: {
    EA: [
      { name: 'Bath #1 Minimum', unit: 'EA', rate: 450 },
      { name: 'Bath #2 Minimum + Wall Prep', unit: 'EA', rate: 600 },
      { name: 'Bath #3 Minimum + Wall Prep + Wallpaper Removal', unit: 'EA', rate: 720 },
      { name: 'Paint Minimum (Under 400 SF)', unit: 'EA', rate: 720 },
      { name: 'Wallpaper Removal Minimum (Under 400 SF)', unit: 'EA', rate: 720 },
    ],
    LF: [],
    SF: [],
  },
  cabinets: {
    EA: [
      { name: 'Doors', unit: 'EA', rate: 80 },
      { name: 'Drawers', unit: 'EA', rate: 30 },
      { name: 'Island Surround', unit: 'EA', rate: 220 },
      { name: 'Replace Knobs/Pulls', unit: 'EA', rate: 15 },
      { name: 'Paint Inside Box', unit: 'EA', rate: 30 },
    ],
    LF: [
      { name: 'Toe Kick', unit: 'LF', rate: 3 },
    ],
    SF: [],
  },
  additional: {
    EA: [
      { name: 'Paint (Gallon)', unit: 'EA', rate: 75 },
      { name: 'Paint (Quart)', unit: 'EA', rate: 75 },
    ],
    LF: [],
    SF: [],
  },
};

export interface LineItemPreset {
  id: string;
  label: string;
  unit: Unit;
  rate: number;
  category: CategoryKey;
}

const categories: CategoryKey[] = ['general', 'minimums', 'cabinets', 'additional'];
const units: Unit[] = ['EA', 'LF', 'SF'];

export const LINE_ITEM_PRESETS: LineItemPreset[] = categories.flatMap((category) => {
  const group = ratesData[category];
  return units.flatMap((unit) => (group[unit] || []).map((item) => ({
    id: `${category}:${unit}:${item.name}`,
    label: item.name,
    unit: item.unit,
    rate: item.rate,
    category,
  })));
});
