import type { BgImg } from "@interfaces/bgSetting";

const bgUrl = "./images/backgrounds";
const thumbUrl = "./images/thumbnails/backgrounds";

export const bgImgs: Array<BgImg> = [
	{
		src: `${bgUrl}/background_redChroma.png`,
		thumb: `${thumbUrl}/thumb_redChroma.webp`,
		title: "RedChroma",
	},
	{
		src: `${bgUrl}/background_monterey.png`,
		thumb: `${thumbUrl}/thumb_monterey.webp`,
		title: "Monterey(Graphic)",
	},
	{
		src: `${bgUrl}/background_bigsur.png`,
		thumb: `${thumbUrl}/thumb_bigsur.webp`,
		title: "Bigsur(Graphic)",
	},
	{
		src: `${bgUrl}/background_mojave.png`,
		thumb: `${thumbUrl}/thumb_mojave.webp`,
		title: "Mojave",
	},
	{
		src: `${bgUrl}/background_catalina.png`,
		thumb: `${thumbUrl}/thumb_catalina.webp`,
		title: "Catalina",
	},
	{
		src: `${bgUrl}/background_sierra.png`,
		thumb: `${thumbUrl}/thumb_sierra.webp`,
		title: "Sierra",
	},
	{
		src: `${bgUrl}/background_yosemite.png`,
		thumb: `${thumbUrl}/thumb_yosemite.webp`,
		title: "Yosemite",
	},
	{
		src: `${bgUrl}/background_lion.png`,
		thumb: `${thumbUrl}/thumb_lion.webp`,
		title: "Lion",
	},
	{
		src: `${bgUrl}/background_leopard.png`,
		thumb: `${thumbUrl}/thumb_leopard.webp`,
		title: "Leopard",
	},
];

export const mobileImgs: Array<BgImg> = [
	{
		src: `${bgUrl}/background_ios16.png`,
		thumb: `${thumbUrl}/thumb_ios16.webp`,
		title: "ios16",
	},
	{
		src: `${bgUrl}/background_ios15.png`,
		thumb: `${thumbUrl}/thumb_ios15.webp`,
		title: "ios15",
	},
	{
		src: `${bgUrl}/background_ios14.png`,
		thumb: `${thumbUrl}/thumb_ios14.webp`,
		title: "ios14",
	},
];
