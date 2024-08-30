import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales: string[] = ["cn", "tw"];

export default getRequestConfig(async ({ locale }) => {
	if (!locales.includes(locale as string)) notFound();

	return {
		messages: (await import(`../content/${locale}.json`)).default,
	};
});
