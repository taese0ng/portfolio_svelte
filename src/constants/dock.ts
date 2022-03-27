import type { DockItemType } from "@interfaces/dock";
import {
	Info,
	Award,
	Certificate,
	Settings,
	Finder,
	Skill,
} from "@components/Modals";

const iconUrl = "./images/icons";

export const itemIDs = {
	myInfo: "myInfo",
	award: "award",
	certificate: "certificate",
	skill: "skill",
	finder: "finder",
	settings: "settings",
};

export const itemList: Array<DockItemType> = [
	{
		id: itemIDs.myInfo,
		title: "내 정보",
		isOpen: false,
		icon: `${iconUrl}/myInfo.png`,
		component: Info,
		zIndex: 0,
		nowOpen: false,
	},
	{
		id: itemIDs.award,
		title: "수상경력",
		isOpen: false,
		icon: `${iconUrl}/award.png`,
		component: Award,
		zIndex: 0,
		width: 800,
		height: 500,
		nowOpen: false,
	},
	{
		id: itemIDs.certificate,
		title: "자격증",
		isOpen: false,
		icon: `${iconUrl}/certificate.png`,
		component: Certificate,
		zIndex: 0,
		width: 600,
		height: 400,
		nowOpen: false,
	},
	{
		id: itemIDs.skill,
		title: "기술스택",
		isOpen: false,
		icon: `${iconUrl}/skill.png`,
		component: Skill,
		zIndex: 0,
		width: 800,
		height: 500,
		nowOpen: false,
	},
	{
		id: itemIDs.finder,
		title: "Finder",
		isOpen: false,
		icon: `${iconUrl}/finder.png`,
		component: Finder,
		zIndex: 0,
		isAbsoluteHeader: true,
		width: 800,
		height: 500,
		nowOpen: false,
	},
	{
		id: itemIDs.settings,
		title: "환경설정",
		isOpen: false,
		icon: `${iconUrl}/settings.png`,
		component: Settings,
		zIndex: 0,
		nowOpen: false,
	},
];
