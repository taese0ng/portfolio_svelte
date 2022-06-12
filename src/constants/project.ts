import type { Project } from "@interfaces/project";

const projectsUrl = "./images/projects";
const coronaCatchUrl = `${projectsUrl}/coronaCatch`;
const KUMOCraftUrl = `${projectsUrl}/KUMOCraft`;
const MAPMOUrl = `${projectsUrl}/MAPMO`;
const semtleProjectUrl = `${projectsUrl}/semtleProject`;

export const projectList: Array<Project> = [
	{
		id: "MAPMO",
		startAt: new Date(2019, 7),
		endAt: new Date(2019, 8),
		title: "MAPMO",
		subTitle: "지도에 메모를 더하다. MAPMO",
		position: "Product Designer & Project Manager",
		skills: ["Java", "Geofencing", "Real-time DB", "SQLite"],
		githubUrl: "https://github.com/taese0ng/MapmoProject",
		url: "https://play.google.com/store/apps/details?id=kr.kumoh.mapmo",
		icon: `${MAPMOUrl}/icon.png`,
		imgs: [
			`${MAPMOUrl}/1.png`,
			`${MAPMOUrl}/2.png`,
			`${MAPMOUrl}/3.png`,
			`${MAPMOUrl}/4.png`,
			`${MAPMOUrl}/5.png`,
			`${MAPMOUrl}/6.png`,
			`${MAPMOUrl}/7.png`,
			`${MAPMOUrl}/8.png`,
			`${MAPMOUrl}/9.png`,
			`${MAPMOUrl}/10.png`,
			`${MAPMOUrl}/11.png`,
		],
		explanations: [
			"지도에 메모를 하여 근처에 접근하면 메모의 내용을 알림.",
			"geofencing기술과 realtime database를 활용.",
			"메모와 사용자위치간의 실시간 거리 측정 및 알림 기능을 개발.",
		],
	},
	{
		id: "CoronaCatch",
		startAt: new Date(2020, 1),
		endAt: new Date(2020, 2),
		title: "CoronaCatch",
		subTitle: "잡아라 코로나! CoronaCatch",
		position: "Frontend Engineer",
		skills: [
			"Vue.JS",
			"Vuetify",
			"MySQL",
			"Node Express",
			"NaverCloudFlatform",
		],
		githubUrl: "https://github.com/taese0ng/CoronaCatch",
		icon: `${coronaCatchUrl}/icon.png`,
		imgs: [
			`${coronaCatchUrl}/1.png`,
			`${coronaCatchUrl}/2.png`,
			`${coronaCatchUrl}/3.png`,
			`${coronaCatchUrl}/4.png`,
			`${coronaCatchUrl}/5.png`,
			`${coronaCatchUrl}/6.png`,
		],
		explanations: [
			"잡아라 코로나 Corona Catch",
			"코로나 감염 통계 / 마스크 현황 지도 제공",
			"Vue.JS를 이용한 프론트엔드 개발",
			"마스크맵 구축",
			"ssh 인증 및 네이버 클라우드 플랫폼 사용",
			"2020/02 ~ 2020/08 마스크API 종료로인한 서비스 종료",
		],
	},
	{
		id: "KUMOCraft",
		startAt: new Date(2020, 6),
		endAt: new Date(2020, 7),
		title: "KUMOCraft",
		subTitle: "금오공대 마인크래프터 모여라",
		position: "Frontend Engineer",
		skills: ["React.JS", "BootStrap", "Node Express"],
		githubUrl: "https://github.com/taese0ng/minecraft_semtle",
		icon: `${KUMOCraftUrl}/icon.png`,
		imgs: [
			`${KUMOCraftUrl}/1.png`,
			`${KUMOCraftUrl}/2.png`,
			`${KUMOCraftUrl}/3.png`,
			`${KUMOCraftUrl}/4.png`,
			`${KUMOCraftUrl}/5.png`,
		],
		explanations: [
			"PWA 적용 웹앱 구현완료",
			"BootStrap 적용",
			"2020/10/1 부로 폐쇄",
		],
	},

	{
		id: "SemtleProject",
		startAt: new Date(2020, 6),
		endAt: new Date(2020, 8),
		title: "SemtleProject",
		subTitle: "셈틀꾼 공식 홈페이지",
		position: "Frontend Engineer & Product Designer & Project Manager",
		skills: ["Vue.JS", "Vuetify", "MongoDB", "Node express"],
		githubUrl: "https://github.com/semtlekkun/semtleProject-front",
		icon: `${semtleProjectUrl}/icon.png`,
		imgs: [
			`${semtleProjectUrl}/1.png`,
			`${semtleProjectUrl}/2.png`,
			`${semtleProjectUrl}/3.png`,
			`${semtleProjectUrl}/4.png`,
			`${semtleProjectUrl}/5.png`,
			`${semtleProjectUrl}/6.png`,
		],
		explanations: [
			"셈틀꾼 회원 전용 프로젝트 공고, 게시, 질문 사이트",
			"관리자 페이지를 통한 인원관리 구현",
		],
	},
];
