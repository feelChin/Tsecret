"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import ScrollPage, { i_scroll } from "@component/scrollPage";
import Http from "@util/fetch";
import useLoading from "@hook/useLoading";
import Button from "@component/button";
import Message from "@component/message";
import Link from "next/link";
import style from "./page.module.scss";

interface i_pageList extends i_scroll {}

function Index() {
	const t = useTranslations("friend");
	const locale = useLocale();
	const { loading, setLoading } = useLoading();

	const [pagelist, setPageList] = useState<i_pageList>({
		data: [],
		total: 0,
		loading: false,
	});

	async function queryFriendList(param = {} as any) {
		try {
			const { data, total } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/friend`,
				{
					method: "get",
				},
				{
					...param,
					detail: 1,
					page_size: 10000,
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

	async function deteleFriend(friend_id: string) {
		try {
			const { msg } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/friend_action`,
				{
					method: "delete",
				},
				{
					friend_id,
				}
			)) as { msg: string };

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
		<div className="pageWrapper">
			{loading && (
				<ScrollPage
					{...pagelist}
					request={(v) => {
						queryFriendList(v);
					}}
				>
					{pagelist.data.map((item) => {
						return (
							<div key={item.home_id} className={style.friendApply}>
								<Link href={`/${locale}/user/${item.user_id}`}>
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
								</div>
								<div className={style.menu}>
									<Link
										href={`/${locale}/chat/${item.home_id}?username=${item.username}&avatar=${item.avatar}&user_id=${item.user_id}`}
									>
										<Button name={t("发私信")} click={() => {}} />
									</Link>
									<Button
										name={t("删除好友")}
										click={() => {
											deteleFriend(item.user_id);
										}}
									/>
								</div>
							</div>
						);
					})}
				</ScrollPage>
			)}
		</div>
	);
}

export default Index;
