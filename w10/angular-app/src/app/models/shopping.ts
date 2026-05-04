
/**
 * Compatibility layer: original shopping models used by UI components.
 * These are kept for components that expect `Section`/`ShoppingItem` shapes.
 */
export interface ShoppingItem {
	name: string;
	amount?: number;
	unit?: string;
	checked: boolean;
}

export interface Section {
	id: string;
	title: string;
	items: ShoppingItem[];
}



