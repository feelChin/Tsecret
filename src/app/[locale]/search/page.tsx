import Nav from "@component/nav";
import { unstable_setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { inter_locale } from "@type/index";
import Client from "./client";

export const metadata: Metadata = {
	title: "搜索",
	keywords: "feelChin",
	description: "feelChin",
};

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	return (
		<section className="page pageNav">
			<Client />
			<Nav />
		</section>
	);
}
