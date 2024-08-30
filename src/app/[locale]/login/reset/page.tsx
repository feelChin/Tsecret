import {
	getLocale,
	getTranslations,
	unstable_setRequestLocale,
} from "next-intl/server";
import Link from "next/link";
import Logo from "@component/logo";
import { inter_locale } from "@type/index";
import style from "../page.module.scss";

export default async function Index({ params }: inter_locale) {
	unstable_setRequestLocale(params.locale);

	const t = await getTranslations("login");
	const locale = await getLocale();

	return (
		<div className={style.login}>
			<div className={style.reset}>
				<div className={style.logo}>
					<Logo />
				</div>
				<h5>{t("忘记密码？")}</h5>
				<p>{t("抱歉，未提供重置密码服务")}</p>
				<footer>
					<Link href={`/${locale}/login`}>{t("返回登录")}</Link>
				</footer>
			</div>
		</div>
	);
}
