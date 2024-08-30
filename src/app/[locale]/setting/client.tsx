"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Http from "@util/fetch";
import Message from "@component/message";
import style from "./page.module.scss";

interface i_locale_list {
	[key: string]: string;
}

function Index() {
	const locale = useLocale();
	const t = useTranslations("me");

	const locale_list: i_locale_list = {
		cn: "繁体中文",
		tw: "简体中文",
	};

	const router = useRouter();

	function signout() {
		router.push(`/${locale}/login`);
	}

	async function deleteUser() {
		try {
			await Http(`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/info`, {
				method: "delete",
			});

			router.push(`/${locale}/login`);
		} catch (err) {
			Message.error(err);
		}
	}

	function changeLang() {
		router.push(`/${locale === "cn" ? "tw" : "cn"}`);
	}

	return (
		<>
			<h5 className={style.item} onClick={signout}>
				{t("退出登录")}
			</h5>
			<h5 className={style.item} onClick={deleteUser}>
				{t("注销账号")}
			</h5>
			<h5 className={style.item} onClick={changeLang}>
				{t("切换语言")}
				<p>{locale_list[locale]}</p>
			</h5>
		</>
	);
}

export default Index;
