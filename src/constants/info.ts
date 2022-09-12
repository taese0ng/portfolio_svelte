import type { Content } from "@interfaces/info";

const iconUrl = "./images/icons";

export const profileImg = `${iconUrl}/profileImg.jpeg`;
export const contents: Content[] = [
	{
		id: "calendar",
		text: "1996",
		icon: `${iconUrl}/calendar.png`,
		link: null,
	},
	{
		id: "github",
		text: "github",
		icon: `${iconUrl}/github.png`,
		link: "https://github.com/taese0ng",
	},
	{
		id: "email",
		text: "email",
		icon: `${iconUrl}/email.png`,
		link: "mailto:taese0ng@naver.com",
	},
	{
		id: "velog",
		text: "velog",
		icon: `${iconUrl}/velog.png`,
		link: "https://velog.io/@taese0ng",
	},
	{
		id: "instagram",
		text: "instagram",
		icon: `${iconUrl}/instagram.png`,
		link: "https://www.instagram.com/taese0_0ng/",
	},
	{
		id: "notion",
		text: "notion",
		icon: `${iconUrl}/notion.png`,
		link: "https://fern-key-96d.notion.site/0b01f2b4e3884508b588b09ec2ed3554",
	},
];
