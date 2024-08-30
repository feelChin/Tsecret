import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { RootProvider } from "@util/store";
import NextTopLoader from "nextjs-toploader";
import { unstable_setRequestLocale } from "next-intl/server";
import UserInfo from "@component/userInfo";
import "../../../public/iconfont/iconfont.css";
import "@style/index.scss";

export const metadata: Metadata = {
	title: "首页",
	keywords: "feelChin",
	description: "feelChin",
};

export function generateStaticParams() {
	const locales = ["cn", "tw"];

	return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
	children,
	params: { locale },
}: Readonly<{
	children: React.ReactNode;
	params: { locale: string };
}>) {
	const messages = await getMessages();

	const cookieStore = cookies();
	const { value } = (cookieStore.get("theme") || {}) as { value: string };

	let theme = "light";

	try {
		theme = JSON.parse(value);
	} catch {}

	unstable_setRequestLocale(locale);

	return (
		<html lang={locale} data-theme={theme}>
			<body>
				<RootProvider>
					<NextIntlClientProvider messages={messages}>
						<UserInfo />
						<NextTopLoader
							color="#4C9EEB"
							height={2}
							template='<div class="bar" role="bar"><div class="peg"></div></div>'
						/>
						<div className={"app"}>{children}</div>
					</NextIntlClientProvider>
				</RootProvider>
			</body>
		</html>
	);
}
