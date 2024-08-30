"use client";

import Avatar from "./avatar";
import Center from "./center";
import { ReactNode } from "react";
import style from "./index.module.scss";

interface i_props {
	isBack?: boolean | undefined;
	isBackCall?: () => void;
	other?: ReactNode;
	centerType?: "default" | "search" | "custom";
	centerName?: string;
	centerCall?: (v: string) => void;
}

function Index(props: i_props) {
	return (
		<div className={style.head}>
			<Avatar {...props} />
			<Center {...props} />
			{props.other}
		</div>
	);
}

export default Index;
