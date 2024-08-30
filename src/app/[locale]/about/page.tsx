import { inter_locale } from "@type/index";
import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import Client from "./client";

export const metadata: Metadata = {
	title: "个人信息",
	keywords: "feelChin",
	description: "feelChin",
};

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	return <Client />;
}
