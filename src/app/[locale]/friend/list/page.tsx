import { inter_locale } from "@type/index";
import type { Metadata } from "next";
import Head from "@component/head";
import { getTranslations } from "next-intl/server";
import { unstable_setRequestLocale } from "next-intl/server";
import Client from "./client";

export const metadata: Metadata = {
	title: "编辑文章",
	keywords: "feelChin",
	description: "feelChin",
};

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	const t = await getTranslations("friend");

	return (
		<section className="page">
			<Head centerType="custom" centerName={t("好友列表")} />
			<Client />
		</section>
	);
}
