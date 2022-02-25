import type { SvelteComponent } from "svelte";

export interface DockItemType {
	id: number;
	title: string;
	isOpen: boolean;
	icon: string;
	component: typeof SvelteComponent;
	zIndex: number;
	width?: number;
	height?: number;
}
