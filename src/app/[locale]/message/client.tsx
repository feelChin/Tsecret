"use client";

import Head from "@component/head";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { inter_param } from "@type/index";
import List from "./list";
import Friend_action from "./friend_action";

function Index() {
	const t = useTranslations("message");
	const locale = useLocale();

	return (
		<>
			<Head
				isBack={false}
				centerType="custom"
				centerName={t("聊天")}
				other={
					<Link href={`/${locale}/friend/list`}>
						<i className="iconfont wb-geren"></i>
					</Link>
				}
			/>
			<div className="pageWrapper">
				<Friend_action />
				<List />
			</div>
		</>
	);
}

export default Index;
