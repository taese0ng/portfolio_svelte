import type { SvelteComponent } from "svelte";

export interface DockItemType {
	id: string;
	title: string;
	isOpen: boolean;
	icon: string;
	component: typeof SvelteComponent;
	zIndex: number;
	width?: number;
	height?: number;
	isAbsoluteHeader?: boolean;
	nowOpen: boolean;
	resizeable?: boolean;
}
