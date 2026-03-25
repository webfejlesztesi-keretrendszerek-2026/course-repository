export enum Unit {
  Piece = 'db',
  Gram = 'g',
  Kilogram = 'kg',
  Slice = 'szelet',
  Package = 'csomag',
  Teaspoon = 'tk',
  Tablespoon = 'ek',
  Liter = 'l'
}

export const ALL_UNITS: string[] = [
  Unit.Piece,
  Unit.Gram,
  Unit.Kilogram,
  Unit.Slice,
  Unit.Package,
  Unit.Teaspoon,
  Unit.Tablespoon,
  Unit.Liter,
];

// Units considered directly purchasable in the shopping list UI
export const PURCHASABLE_UNITS: string[] = [
  Unit.Piece,
  Unit.Gram,
  Unit.Kilogram,
  Unit.Liter,
];

export default Unit;
