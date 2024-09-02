import { unstable_setRequestLocale } from "next-intl/server";
import Nav from "@component/nav";
import Client from "./client";
import { inter_locale } from "@type/index";
import EditMenu from "@component/editMenu";

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	return (
		<section className="page pageNav">
			<Nav />
			<Client />
			<EditMenu />
		</section>
	);
}
