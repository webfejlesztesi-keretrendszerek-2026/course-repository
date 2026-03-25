import { Unit } from './units';

export interface ShoppingItem {
  name: string;
  amount?: number;
  unit?: Unit | string;
  checked: boolean;
}

export interface Section {
  id: string;
  title: string;
  items: ShoppingItem[];
}

export default Section;
