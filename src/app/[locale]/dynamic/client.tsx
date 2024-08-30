"use client";

import Head from "@component/head";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Http from "@util/fetch";
import useLoading from "@hook/useLoading";
import ScrollPage, { i_scroll } from "@component/scrollPage";
import Message from "@component/message";
import { useState } from "react";
import style from "./page.module.scss";

interface i_navList {
	[key: string]: string;
}

interface i_pageList extends i_scroll {
	data: any[];
}

const init_page = {
	data: [],
	total: 0,
	loading: false,
};

function Index() {
	const t = useTranslations("dynamic");
	const local = useLocale();
	const { loading, setLoading } = useLoading();

	const [navType, setNavType] = useState<number>(0);
	const [pagelist, setPageList] = useState<i_pageList>(init_page);

	const navList: i_navList = {
		0: t("新发布"),
		1: t("关于我"),
	};

	async function queryArticleList(v = {}, type = 0) {
		try {
			const { data, total } = (await Http(
				type
					? `${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/dynamic/me`
					: `${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/dynamic`,
				{
					method: "get",
				},
				{
					...v,
				}
			)) as i_pageList;

			setPageList((prev) => {
				return {
					data: [...prev.data, ...data],
					total,
					loading: true,
				};
			});
		} catch (err) {
			Message.error(err);
		}
	}

	return (
		<>
			<Head isBack={false} centerType="custom" centerName={t("动态")} />
			<div className={style.nav}>
				{Object.keys(navList).map((item) => {
					return (
						<span
							key={item}
							className={navType === Number(item) ? style.active : ""}
							onClick={() => {
								setNavType(Number(item));
								setPageList(init_page);
								setLoading(false);
							}}
						>
							{navList[item]}
						</span>
					);
				})}
			</div>
			<div className={style.wrapperList}>
				{loading && (
					<ScrollPage
						{...pagelist}
						request={(v) => {
							queryArticleList(v, navType);
						}}
					>
						{navType ? (
							<div className={style.melist}>
								{pagelist.data.map(
									(
										{
											_id,
											avatar,
											article_id,
											text,
											user_id,
											type,
											username,
											onlyname,
											isVip,
										},
										index
									) => {
										return (
											<div
												className={style.item}
												key={index}
												onClick={() => {
													localStorage.setItem("dynamic_" + _id, "1");
												}}
											>
												<Link
													className={style.link}
													href={`/${local}/detail/${article_id}`}
												></Link>
												<figure>
													<Link href={`/${local}/user/${user_id}`}>
														{
															<Image
																src={avatar}
																width={55}
																height={55}
																alt=""
															/>
														}
													</Link>
													{isVip && (
														<div className={style.dot}>
															<i className="iconfont wb-renzhengyonghu"></i>
														</div>
													)}
												</figure>
												<div className={style.user}>
													<h5>{username}</h5>
													<span>{onlyname}</span>
												</div>
												<div className={style.text}>
													<p>
														<small>
															{type === 1
																? t("点赞了")
																: type === 2
																? t("分享了")
																: t("回复我")}
														</small>
														{text}
													</p>
												</div>
											</div>
										);
									}
								)}
							</div>
						) : (
							<div className={style.list}>
								{pagelist.data.map(
									(
										{ _id, avatar, article_id, text, user_id, username, isVip },
										index
									) => {
										return (
											<div
												className={style.item}
												key={index}
												onClick={() => {
													localStorage.setItem("dynamic_" + _id, "1");
												}}
											>
												<i
													className={`iconfont wb-sharpicons_star ${
														style.icon
													} ${
														localStorage.getItem("dynamic_" + _id)
															? style.active
															: ""
													}`}
												></i>
												<div className={style.text}>
													<div className={style.user}>
														<figure>
															<Link href={`/${local}/user/${user_id}`}>
																{
																	<Image
																		src={avatar}
																		width={55}
																		height={55}
																		alt=""
																	/>
																}
															</Link>
															{isVip && (
																<div className={style.dot}>
																	<i className="iconfont wb-renzhengyonghu"></i>
																</div>
															)}
														</figure>
														<h5>{username}</h5>
													</div>
													<p>
														<small>{t("发布了")}</small>
														{text}
														<Link href={`/${local}/detail/${article_id}`}>
															{t("点我跳转")}
														</Link>
													</p>
												</div>
											</div>
										);
									}
								)}
							</div>
						)}
					</ScrollPage>
				)}
			</div>
		</>
	);
}

export default Index;
