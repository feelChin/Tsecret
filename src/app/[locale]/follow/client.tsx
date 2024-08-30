"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import ScrollPage, { i_scroll } from "@component/scrollPage";
import Http from "@util/fetch";
import store from "@util/store";
import useLoading from "@hook/useLoading";
import Button from "@component/button";
import Message from "@component/message";
import Head from "@component/head";
import Link from "next/link";
import dayjs from "dayjs";
import style from "./page.module.scss";

function Index({ state_type }: { state_type: number }) {
	const t = useTranslations("follow");
	const locale = useLocale();

	const { reloadUserInfo } = store();

	const { loading, setLoading } = useLoading();

	const [pagelist, setPageList] = useState<i_scroll>({
		data: [],
		total: 0,
		loading: false,
	});

	async function queryFollowList(param = {} as any) {
		try {
			const { data, total } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/follow/list`,
				{
					method: "get",
				},
				{
					...param,
					type: state_type,
				}
			)) as i_scroll;

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

	async function deteleFollow(id: string) {
		try {
			const { msg } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/follow`,
				{
					method: "post",
				},
				{
					follow_id: id,
				}
			)) as { msg: string };

			reloadUserInfo();

			setLoading(false);
			setPageList({
				data: [],
				total: 0,
				loading: false,
			});

			Message.success(msg);
		} catch (err) {
			Message.error(err);
		}
	}

	return (
		<>
			<Head
				centerType="custom"
				centerName={state_type ? t("粉丝列表") : t("关注列表")}
			/>
			<div className="pageWrapper">
				{loading && (
					<ScrollPage
						{...pagelist}
						request={(v) => {
							queryFollowList(v);
						}}
					>
						{pagelist.data.map((item) => {
							return (
								<div className={style.followList} key={item._id}>
									<Link href={`/${locale}/user/${item.uid}`}>
										<figure>
											<Image
												width={55}
												height={55}
												src={item.avatar as string}
												alt=""
											/>
										</figure>
									</Link>
									<div className={style.text}>
										<h5>{item.username}</h5>
										<h6>{item.onlyname}</h6>
										<time>
											{dayjs(item.createdAt).format("YY.MM.DD HH.mm")}
										</time>
									</div>
									{!state_type ? (
										<div className={style.menu}>
											<Button
												name={t("取消关注")}
												click={() => {
													deteleFollow(item.uid);
												}}
											/>
										</div>
									) : (
										""
									)}
								</div>
							);
						})}
					</ScrollPage>
				)}
			</div>
		</>
	);
}

export default Index;
