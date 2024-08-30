"use client";

import { inter_userInfo } from "@util/store";
import Http from "@util/fetch";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Message from "@component/message";
import { useEffect, useState } from "react";
import style from "./page.module.scss";

interface i_user extends inter_userInfo {
	the_friend: string;
}

interface i_friendApply {
	list: i_user[];
	data?: i_user[];
	total: number;
}

function Index() {
	const t = useTranslations("message");
	const locale = useLocale();

	const [friendApply, setFriendApply] = useState<i_friendApply>({
		list: [],
		total: 0,
	});

	async function queryFriendList() {
		try {
			const { data = [], total } = (await Http(
				`/[locale]/api/user/friend_action`,
				{
					method: "get",
				}
			)) as i_friendApply;

			setFriendApply({
				list: data,
				total,
			});
		} catch (err) {
			Message.error(err);
		}
	}

	useEffect(() => {
		queryFriendList();
	}, []);

	return (
		<>
			{Boolean(friendApply.total) && (
				<div className={style.newFrient}>
					<Link className={style.link} href={`/${locale}/friend/apply`}></Link>
					{friendApply.total === 1 ? (
						<>
							{friendApply.list.map((item, index) => {
								return (
									<div className={style.onlyList} key={index}>
										<Link href={`/${locale}/user/${item.the_friend}`}>
											<figure>
												<Image
													width={60}
													height={60}
													src={item.avatar as string}
													alt=""
												/>
											</figure>
										</Link>
										<h5>{item.username}</h5>
									</div>
								);
							})}
						</>
					) : (
						<>
							{friendApply.list.map((item, index) => {
								return (
									<div className={style.manyList} key={index}>
										<figure>
											<Image
												width={60}
												height={60}
												src={item.avatar as string}
												alt=""
											/>
										</figure>
									</div>
								);
							})}
							<p>等{friendApply.total}人</p>
						</>
					)}
					<p>{t("申请添加好友")}</p>
					<div
						onClick={(e) => {
							e.preventDefault();

							setFriendApply({
								...friendApply,
								total: 0,
							});
						}}
						className={style.arrow}
					></div>
				</div>
			)}
		</>
	);
}

export default Index;
