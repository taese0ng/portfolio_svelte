export interface Project {
	id: string;
	startAt: Date; // 프로젝트 시작 날짜
	endAt: Date; // 프로젝트 끝낸 날짜
	title: string; // 프로젝트명
	subTitle: string;
	positions: string[]; // 프로젝트에서 맡은 역할
	skills: string[]; //프로젝트 기술스택
	explanations: string[]; // 프로젝트 설명
	githubUrl?: string; // 깃헙 주소
	url?: string; // 오픈되어있는 경우 주소
	icon: string; // 프로젝트 아이콘
	imgs: string[]; // 프로젝트 이미지들
}
