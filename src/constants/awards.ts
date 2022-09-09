import type { Award } from "@interfaces/awards";

const awardUrl = "./images/awards";
const thumbUrl = "./images/thumbnails/awards";

export const awardList: Array<Award> = [
	{
		id: "BM2019",
		title: "BM 공모전",
		class: "대상",
		src: `${awardUrl}/BM.png`,
		thumb: `${thumbUrl}/thumb_BM.webp`,
	},
	{
		id: "thesis2019",
		title: "대학생 논문 경진대회",
		class: "은상",
		src: `${awardUrl}/Paper.png`,
		thumb: `${thumbUrl}/thumb_Paper.webp`,
	},
	{
		id: "thesis2020",
		title: "대학생 논문 경진대회",
		class: "동상",
		src: `${awardUrl}/Paper2.png`,
		thumb: `${thumbUrl}/thumb_Paper2.webp`,
	},
];
