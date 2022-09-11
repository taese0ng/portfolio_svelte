import {
	Home,
	MyInfo,
	History,
	Setting,
	Awards,
	Certificate,
	Projects,
	ProjectDetail,
	Skills,
} from "~/pages/Mobile";

export default {
	"/": Home,
	"/myInfo": MyInfo,
	"/history": History,
	"/settings": Setting,
	"/award": Awards,
	"/certificate": Certificate,
	"/project": Projects,
	"/project/:title": ProjectDetail,
	"/skill": Skills,
};
