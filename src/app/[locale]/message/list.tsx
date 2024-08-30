"use client";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Http from "@util/fetch";
import Image from "next/image";
import Loading from "@component/loading";
import Message from "@component/message";
import Link from "next/link";
import style from "./page.module.scss";

interface i_user {
	avatar: string;
	username: string;
	count: number;
	text: string;
	user_id: string;
	type: string;
	create_time: string;
}

interface i_obj {
	[key: string]: boolean;
}

function Index() {
	const t = useTranslations("friend");
	const locale = useLocale();

	const [loading, setLoading] = useState<boolean>(false);
	const [messageList, setMessageList] = useState<i_user[]>([]);

	async function queryFriendList() {
		try {
			const { data } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/message`,
				{
					method: "get",
				},
				{
					unread: true,
				}
			)) as { data: i_user[] };

			const localStorageArr: i_user[] = [];
			for (let key in localStorage) {
				if (key.indexOf("lastMessage_") > -1) {
					localStorageArr.push(JSON.parse(localStorage.getItem(key) as string));
				}
			}

			localStorageArr.sort((a, b) => {
				return (
					new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
				);
			});

			let obj: i_obj = {};
			let result: i_user[] = [];

			[...data, ...localStorageArr].forEach((item) => {
				if (!obj[item.type]) {
					obj[item.type] = true;
					result.push(item);
				}
			});

			setLoading(true);
			setMessageList(result);
		} catch (err) {
			Message.error(err);
		}
	}

	useEffect(() => {
		queryFriendList();
	}, []);

	return (
		<div className={style.messageList}>
			{loading ? (
				<>
					{Boolean(messageList.length) ? (
						<>
							{messageList.map(
								({ text, avatar, username, user_id, count, type }, index) => {
									return (
										<section className={style.item} key={index}>
											<Link
												className={style.link}
												href={`/${locale}/chat/${type}?username=${username}&avatar=${avatar}&user_id=${user_id}`}
											></Link>
											<figure>
												<Link href={`/${locale}/user/${user_id}`}>
													<Image src={avatar} width={55} height={55} alt="" />
												</Link>
											</figure>
											<div className={style.text}>
												<h5>{username}</h5>
												<p>{text}</p>
											</div>
											{count && <div className={style.dot}>{count}</div>}
										</section>
									);
								}
							)}
						</>
					) : (
						<Link href={`/${locale}/friend/list`} className={style.noitem}>
							{t("没有聊天信息，去聊天")}
							<i className="iconfont wb-jiantou"></i>
						</Link>
					)}
				</>
			) : (
				<Loading />
			)}
		</div>
	);
}

export default Index;
