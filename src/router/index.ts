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
import { Error } from "~/pages";

export default {
	"/": Home,
	"/myInfo": MyInfo,
	"/history": History,
	"/settings": Setting,
	"/award": Awards,
	"/certificate": Certificate,
	"/projects": Projects,
	"/projects/:id": ProjectDetail,
	"/skill": Skills,
	"*": Error,
};
