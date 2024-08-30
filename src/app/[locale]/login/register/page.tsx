import {
	getLocale,
	getTranslations,
	unstable_setRequestLocale,
} from "next-intl/server";
import Link from "next/link";
import Form from "../form";
import Logo from "@component/logo";
import { inter_locale } from "@type/index";
import style from "../page.module.scss";

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	const t = await getTranslations("login");
	const locale = await getLocale();

	return (
		<div className={style.login}>
			<div className={style.register}>
				<div className={style.logo}>
					<Logo />
				</div>
				<h5>{t("注册Tsecret")}</h5>
				<div className={style.wrapper}>
					<Form name={[t("用户名"), t("密码")]} type="register" />
				</div>
				<footer>
					<Link href={`/${locale}/login`}>{t("返回登录")}</Link>
				</footer>
			</div>
		</div>
	);
}
