import {
	getLocale,
	getTranslations,
	unstable_setRequestLocale,
} from "next-intl/server";
import Link from "next/link";
import Logo from "@component/logo";
import { inter_locale } from "@type/index";
import Form from "./form";
import style from "./page.module.scss";

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	const t = await getTranslations("login");
	const locale = await getLocale();

	return (
		<div className={style.login}>
			<div className={style.sign}>
				<div className={style.logo}>
					<Logo />
				</div>
				<h5>{t("登录到Tsecret")}</h5>
				<div className={style.wrapper}>
					<Form name={[t("用户名"), t("密码")]} type="login" />
				</div>
			</div>
			<footer>
				<Link href={`/${locale}/login/reset`}>{t("忘记密码？")}</Link>
				<Link href={`/${locale}/login/register`}>{t("立即注册Tsecret")}</Link>
			</footer>
		</div>
	);
}
