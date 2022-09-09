import type { Certificate } from "@interfaces/cerificates";

const certificateUrl = "./images/certificates";
const thumbUrl = "./images/thumbnails/certificates";

export const certificateList: Array<Certificate> = [
	{
		id: "OPIC Japanese",
		title: "OPIC Japanese",
		src: `${certificateUrl}/OPIC_Japanese.png`,
		thumb: `${thumbUrl}/thumb_OPIC_Japanese.webp`,
		class: "IH",
	},
];
