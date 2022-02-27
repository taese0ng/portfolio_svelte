import type { DockItemType } from "@interfaces/dock";
import { Info, Price } from "@components/Modals";

export const itemList: Array<DockItemType> = [
	{
		id: 0,
		title: "내 정보",
		isOpen: false,
		icon: "/images/myInfo.png",
		component: Info,
		zIndex: 0,
	},
	{
		id: 1,
		title: "수상경력",
		isOpen: false,
		icon: "/images/price.png",
		component: Price,
		zIndex: 0,
		width: 800,
		height: 500,
	},
	{
		id: 2,
		title: "2",
		isOpen: false,
		icon: "/images/finder.png",
		component: Info,
		zIndex: 0,
	},
	{ id: 3, title: "3", isOpen: false, icon: "", component: Info, zIndex: 0 },
	{ id: 4, title: "4", isOpen: false, icon: "", component: Info, zIndex: 0 },
	{ id: 5, title: "5", isOpen: false, icon: "", component: Info, zIndex: 0 },
	{ id: 6, title: "6", isOpen: false, icon: "", component: Info, zIndex: 0 },
];
