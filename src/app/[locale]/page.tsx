import { getLocale, getTranslations } from "next-intl/server";
import { unstable_setRequestLocale } from "next-intl/server";
import Nav from "@component/nav";
import Client from "./client";
import { inter_locale } from "@type/index";
import EditMenu from "@component/editMenu";

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	const t = await getTranslations("home");
	const locale = await getLocale();

	return (
		<section className="page pageNav">
			<Nav />
			<Client />
			<EditMenu />
		</section>
	);
}
