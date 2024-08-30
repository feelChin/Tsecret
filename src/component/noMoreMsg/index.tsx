"use client";

import { useTranslations } from "next-intl";
import style from "./index.module.scss";

function Index() {
	const t = useTranslations("no");

	return (
		<div className={style.noMoreMsg}>
			<p>{t("没有更多数据了")}</p>
		</div>
	);
}

export default Index;
