"use client";

import Link from "next/link";
import Image from "next/image";
import store from "@util/store";
import { getCookieData, setCookieData } from "@util/cookie";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import style from "./index.module.scss";

interface i_props {
	show: boolean;
	cancel: () => void;
}

function Index({ show, cancel }: i_props) {
	const t = useTranslations("me");
	const locale = useLocale();

	const { userInfo, theme, changeTheme } = store();

	const { avatar, username, onlyname, follows, fans } = userInfo;

	const [visable, setVisable] = useState<boolean>(false);

	useEffect(() => {
		setVisable(show);

		const page = document.querySelector(".pageNav") as HTMLElement;
		if (show) {
			page.classList.add("active");
		} else {
			page.classList.remove("active");
		}
	}, [show]);

	return (
		<section className={`${style.mySetting} ${visable ? style.active : ""}`}>
			<div className={style.mySettingBg} onClick={cancel}></div>
			<div className={style.user}>
				<figure>
					{avatar ? (
						<Image width={60} height={60} src={avatar} alt="" />
					) : (
						<div className={style.place}></div>
					)}
				</figure>
				<h5>{username || t("未登录")}</h5>
				<span>{onlyname || `@${t("未登录")}`}</span>
				<div className={style.userlist}>
					<Link href={`/${locale}/follow`}>
						{follows || 0}
						<span>{t("关注")}</span>
					</Link>
					<Link href={`/${locale}/follow?type=1`}>
						{fans || 0}
						<span>{t("粉丝")}</span>
					</Link>
				</div>
			</div>
			<div className={style.list}>
				<Link className={style.item} href={`/${locale}/about`}>
					<i className="iconfont wb-geren"></i>
					<p>{t("简介")}</p>
				</Link>
				<Link className={style.item} href={`/${locale}/message`}>
					<i className="iconfont wb-liebiao"></i>
					<p>{t("列表")}</p>
				</Link>
			</div>
			<div className={style.otherList}>
				<Link className={style.item} href={`/${locale}/setting`}>
					<p>{t("设置与隐私")}</p>
				</Link>
			</div>
			<div
				className={style.theme}
				onClick={() => {
					const myTheme = theme === "light" ? "dark" : "light";

					changeTheme(myTheme);
					setCookieData("theme", myTheme);
				}}
			>
				<i
					className={`iconfont ${
						theme === "light" ? "wb-yangguang" : "wb-a-yueliangwanshang"
					}`}
				></i>
			</div>
		</section>
	);
}

export default Index;
