"use client";

import { useTranslations } from "next-intl";
import style from "./index.module.scss";

function Index() {
	const t = useTranslations("no");

	return (
		<div className={style.noMsg}>
			<i className="iconfont wb-nodata"></i>
			<p>{t("暂无数据")}</p>
		</div>
	);
}

export default Index;
