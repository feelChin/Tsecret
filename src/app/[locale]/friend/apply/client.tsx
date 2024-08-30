"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import ScrollPage, { i_scroll } from "@component/scrollPage";
import Http from "@util/fetch";
import Button from "@component/button";
import Message from "@component/message";
import Link from "next/link";
import useLoading from "@hook/useLoading";
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
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/friend_action`,
				{
					method: "get",
				},
				param
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

	async function handleFriend(friend_id: string, type: number) {
		try {
			const { msg } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/friend_action`,
				{
					method: "put",
				},
				{
					friend_id,
					type,
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
							<div key={item.the_friend} className={style.friendApply}>
								<Link href={`/${locale}/user/${item.the_friend}`}>
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
									<Button
										name={t("通过")}
										click={() => {
											handleFriend(item.the_friend, 1);
										}}
									/>
									<Button
										name={t("拒绝")}
										click={() => {
											handleFriend(item.the_friend, 0);
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
