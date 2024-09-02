import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { inter_locale } from "@type/index";
import Head from "@component/head";
import Client from "./client";

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	const t = await getTranslations("me");

	return (
		<section className="page pageNav">
			<Head centerType="custom" centerName={t("设置与隐私")} />
			<Client />
		</section>
	);
}
