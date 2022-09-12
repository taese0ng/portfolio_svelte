import { writable } from "svelte/store";

const bgUrl = "./images/backgrounds";
const thumbUrl = "./images/thumbnails/backgrounds";

export const bgImg = writable({
	src: `${bgUrl}/background_monterey.png`,
	thumb: `${thumbUrl}/thumb_monterey.webp`,
	title: "Monterey(Graphic)",
});

export const mobileBgImg = writable({
	src: `${bgUrl}/background_ios16.png`,
	thumb: `${thumbUrl}/thumb_ios16.webp`,
	title: "ios16",
});

export const isMobile = writable(false);
