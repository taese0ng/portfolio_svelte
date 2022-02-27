import type { DockItemType } from "@interfaces/dock";
import { Info, Price } from "@components/Modals";

export const itemList: Array<DockItemType> = [
	{
		id: "myInfo",
		title: "내 정보",
		isOpen: false,
		icon: "/images/myInfo.png",
		component: Info,
		zIndex: 0,
	},
	{
		id: "price",
		title: "수상경력",
		isOpen: false,
		icon: "/images/price.png",
		component: Price,
		zIndex: 0,
		width: 800,
		height: 500,
	},
	{
		id: "finder",
		title: "2",
		isOpen: false,
		icon: "/images/finder.png",
		component: Info,
		zIndex: 0,
	},
];
