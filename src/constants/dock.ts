import type { DockItemType } from "@interfaces/dock";
import { Info, Award, Settings, Finder, Skill } from "@components/Modals";

const iconUrl = "/images/icons";

export const itemList: Array<DockItemType> = [
	{
		id: "myInfo",
		title: "내 정보",
		isOpen: false,
		icon: `${iconUrl}/myInfo.png`,
		component: Info,
		zIndex: 0,
	},
	{
		id: "price",
		title: "수상경력",
		isOpen: false,
		icon: `${iconUrl}/price.png`,
		component: Award,
		zIndex: 0,
		width: 800,
		height: 500,
	},
	{
		id: "skill",
		title: "기술스택",
		isOpen: false,
		icon: `${iconUrl}/skill.png`,
		component: Skill,
		zIndex: 0,
		width: 800,
		height: 500,
	},
	{
		id: "finder",
		title: "Finder",
		isOpen: false,
		icon: `${iconUrl}/finder.png`,
		component: Finder,
		zIndex: 0,
		isAbsoluteHeader: true,
		width: 800,
		height: 500,
	},
	{
		id: "settings",
		title: "환경설정",
		isOpen: false,
		icon: `${iconUrl}/settings.png`,
		component: Settings,
		zIndex: 0,
	},
];
