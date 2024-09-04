"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import Http from "@util/fetch";
import useStateCallBack from "@hook/useStateCallBack";
import store from "@util/store";
import { useParams } from "next/navigation";
import Message from "@component/message";
import getParam from "@util/getParam";
import useDebounce from "@hook/useDebounce";
import Head from "@component/head";
import { removeDuplication } from "@util/base";
import { renderTimeFormat } from "@util/renderTime";
import dayjs from "dayjs";
import Link from "next/link";
import style from "./page.module.scss";

interface i_userInfo {
	username: string;
	avatar: string;
}

interface i_user {
	[key: string]: i_userInfo;
}

interface i_item {
	createdAt: string;
	status: number;
	text: string;
	type: string;
	user_id: string;
	_id: string;
}

interface i_list {
	data: i_item[];
	total: number;
	_ids: string[];
}

interface i_status {
	[key: string]: number;
}

const readList: string[] = [];

function Index() {
	const t = useTranslations("message");
	const locale = useLocale();

	const { userInfo } = store();

	const { slug } = useParams();

	const paramRef = useRef({
		page: 1,
		page_size: 10,
	});

	const timer = useRef<NodeJS.Timeout>();
	const initRef = useRef<Number>(0);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const itemRefs = useRef<HTMLDivElement[]>([]);
	const listenMoreRef = useRef<HTMLDivElement | null>(null);
	const listenMoreOb = useRef<any | null>(null);
	const ob = useRef<any | null>(null);
	const readListProxy = useRef<string[]>([]);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const [message, setMessage] = useState<string>("");
	const [list, setList] = useStateCallBack<i_list>({
		_ids: [],
		data: [],
		total: 10,
	});
	const [user, setUser] = useState<i_user>({});

	const debounceputMessage = useDebounce(putMessage, 300, false);

	async function sendMessage() {
		try {
			await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/message`,
				{
					method: "post",
				},
				{
					type: slug,
					text: message,
				}
			);

			setMessage("");
			getMessage(true);
		} catch (err) {
			Message.error(err);
		}
	}

	async function getMessage(flag: Boolean = false) {
		try {
			const { data, total = 0 } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/message`,
				{
					method: "get",
				},
				{
					type: slug,
					...paramRef.current,
					page: flag ? 1 : paramRef.current.page,
				}
			)) as i_list;

			if (initRef.current === 0) {
				initRef.current = 1;
			}

			let checkChange = true;

			const [lastMessage] = data;

			if (!lastMessage) return;

			if (list._ids.includes(lastMessage._id)) {
				// 判断之前数据是否包含最新的id
				checkChange = false;

				const newStatus: i_status = {};
				data.forEach((item) => {
					if (item.status) {
						newStatus[item._id] = item.status;
					}
				});

				const newStatusArr = Object.keys(newStatus);
				const prevList = [...list.data];

				let is_change = false;

				prevList.forEach((item: i_item) => {
					const id = item._id;

					if (newStatusArr.includes(id) && !item.status) {
						item.status = 1;
						if (!is_change) is_change = true;
					}
				});

				if (is_change) {
					setList({
						...list,
						data: [...prevList],
					});
				}
			} else {
				checkChange = true;
			}

			if (checkChange) {
				const newData: i_item[] = removeDuplication(
					[...list.data, ...data],
					"_id"
				);

				newData.sort((a, b) => {
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				});

				const newIds = newData.map((item) => item._id);

				setList({
					_ids: newIds,
					data: newData,
					total,
				});

				const item = newData[newData.length - 1];

				if (item) {
					const message = {
						type: slug,
						text: item.text,
						user_id: getParam("user_id"),
						username: getParam("username"),
						avatar: getParam("avatar"),
						create_time: item.createdAt,
					};

					localStorage.setItem(
						"lastMessage_" + item.type,
						JSON.stringify(message)
					);
				}
			}
		} catch (err) {
			Message.error(err);
		}
	}

	async function putMessage() {
		try {
			await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/message`,
				{
					method: "put",
				},
				{
					ids: readList,
				}
			);

			readList.length = 0;
		} catch (err) {
			Message.error(err);
		}
	}

	useEffect(() => {
		const { username, avatar, id } = userInfo;

		if (username && avatar && id) {
			const friends = {
				username: getParam("username"),
				avatar: getParam("avatar"),
			};

			setUser({
				[getParam("user_id")]: friends,
				[id]: {
					username,
					avatar,
				},
			});

			getMessage(true);
		}
	}, [userInfo]);

	useEffect(() => {
		if (!Object.keys(user).length) return;

		ob.current = new IntersectionObserver(function (entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const target = entry.target;
					ob.current.unobserve(target);
					const key = target.getAttribute("id");

					if (key) readListProxy.current.push(key);
				}
			});
		});

		scrollRef.current?.querySelectorAll(".listenMsg").forEach((item) => {
			ob.current.observe(item);
		});

		if (initRef.current === 1) {
			initRef.current = -1;
		}

		timer.current = setInterval(() => {
			getMessage(true);
		}, 3000);

		listenMoreOb.current = new IntersectionObserver(function (entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					listenMoreOb.current.disconnect();

					const { page, page_size } = paramRef.current;

					if (page * page_size < list.total) {
						paramRef.current.page += 1;
						getMessage();
					}
				}
			});
		});

		listenMoreOb.current.observe(listenMoreRef.current);

		return () => {
			ob.current.disconnect();
			listenMoreOb.current.disconnect();
			clearInterval(timer.current);
		};
	}, [list]);

	useEffect(() => {
		// 代理已读数组

		const arr: string[] = [];

		readListProxy.current = new Proxy(arr, {
			set: (obj, prop, value) => {
				if (prop !== "length") {
					readList.push(value);
					obj[prop as any] = value;

					debounceputMessage();
				}

				return true;
			},
		});
	}, []);

	return (
		<div className="page">
			<Head centerType="custom" centerName={getParam("username")} />
			<div className={style.messageWrapper} ref={scrollRef}>
				<div className={style.box}>
					<div className={style.more} ref={listenMoreRef}></div>
					{list.data.map(({ user_id, text, createdAt, status, _id }) => {
						return (
							<div
								className={`${style.item} ${
									user_id === userInfo.id
										? `${style.right} `
										: `${!status ? "listenMsg" : ""}`
								}`}
								key={_id}
								id={_id}
							>
								<figure>
									<Link href={`/${locale}/user/${user_id}`}>
										<Image
											src={user[user_id].avatar}
											width={55}
											height={55}
											alt=""
										/>
									</Link>
								</figure>
								<div className={style.text}>{text}</div>
								<div className={style.other}>
									<time>{renderTimeFormat(createdAt)}</time>
									<p>
										{user_id === userInfo.id
											? status
												? t("已读")
												: t("未读")
											: ""}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<div className={style.sayWrapper}>
				<div className={style.content}>
					<input
						onInput={(e) => {
							const target = e.target as HTMLInputElement;

							setMessage(target.value);
						}}
						value={message}
						ref={inputRef}
						type="text"
						placeholder={t("请输入聊天内容")}
					/>
				</div>
				<div
					className={style.menu}
					onClick={() => {
						if (message) sendMessage();
					}}
				>
					<i className="iconfont wb-fabu"></i>
				</div>
			</div>
		</div>
	);
}

export default Index;
