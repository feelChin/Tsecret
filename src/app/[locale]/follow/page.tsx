import { inter_locale } from "@type/index";
import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import Client from "./client";

export const metadata: Metadata = {
	title: "编辑文章",
	keywords: "feelChin",
	description: "feelChin",
};

export default async function Index({ params, searchParams }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	return (
		<section className="page">
			<Client state_type={Number(searchParams.type || 0)} />
		</section>
	);
}
