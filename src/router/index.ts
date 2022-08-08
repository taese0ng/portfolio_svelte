import { Home, MyInfo, History, Setting } from "~/pages/Mobile";
import { itemIDs } from "@constants/dock";

export default [
	{ path: "/", component: Home },
	{ path: `/${itemIDs.myInfo}`, component: MyInfo },
	{ path: `/${itemIDs.history}`, component: History },
	{ path: `/${itemIDs.settings}`, component: Setting },
];
