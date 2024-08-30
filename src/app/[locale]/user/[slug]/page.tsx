"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import Http from "@util/fetch";
import useScroll from "@hook/useScroll";
import RenderItem, { i_searchParam } from "@component/renderItem";
import store, { inter_userInfo } from "@util/store";
import { useParams, useRouter } from "next/navigation";
import Message from "@component/message";
import Loading from "@component/loading";
import useDebounce from "@hook/useDebounce";
import dayjs from "dayjs";
import useLoading from "@hook/useLoading";
import Link from "next/link";
import style from "./page.module.scss";

interface i_navList {
	[key: string]: string;
}

function Index() {
	const t = useTranslations("about");
	const t1 = useTranslations("me");
	const t2 = useTranslations("user");
	const locale = useLocale();

	const { loading, setLoading } = useLoading();

	const { userInfo, reloadUserInfo } = store();

	const { slug } = useParams();
	const router = useRouter();

	const scrollRef = useRef<HTMLDivElement | null>(null);

	const [navType, setNavType] = useState<number>(0);
	const [user, setUser] = useState<inter_userInfo>({});
	const [param, setParam] = useState<i_searchParam>({
		user_id: slug as string,
	});
	const [isFollow, setIsFollow] = useState<number>(0);
	const [isFriend, setIsFriend] = useState<number>(0);

	const debounceHandleFollow = useDebounce(handleFollow);
	const point = useScroll(scrollRef);

	const navList: i_navList = {
		0: t2("发布列表"),
		1: t2("喜欢的文章"),
	};

	async function queryUserInfo() {
		try {
			const { data } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/detail?user_id=${slug}`,
				{
					method: "get",
				}
			)) as { data: inter_userInfo };

			setUser(data);
		} catch (err) {
			Message.error(err);
		}
	}

	async function queryFollow() {
		try {
			if (!userInfo.token) return;

			const { status } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/follow?follow_id=${slug}`,
				{
					method: "get",
				}
			)) as { status: number };

			setIsFollow(status);
		} catch (err) {
			Message.error(err);
		}
	}

	async function handleFollow() {
		try {
			const { msg } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/follow`,
				{
					method: "post",
				},
				{
					follow_id: slug,
				}
			)) as { msg: string };

			Message.success(msg);

			reloadUserInfo();
			queryFollow();
		} catch (err) {
			Message.error(err);
		}
	}

	async function queryFriend() {
		try {
			if (!userInfo.token) return;

			const { status } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/friend`,
				{
					method: "get",
				},
				{
					friend_id: slug,
				}
			)) as { status: number };

			setIsFriend(status);
		} catch (err) {
			Message.error(err);
		}
	}

	async function handleSendFriend() {
		try {
			const { msg } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/friend`,
				{
					method: "post",
				},
				{
					friend_id: slug,
				}
			)) as { msg: string };

			Message.success(msg);
		} catch (err) {
			Message.error(err);
		}
	}

	useEffect(() => {
		queryUserInfo();
	}, []);

	useEffect(() => {
		if (userInfo.id) {
			queryFollow();
			queryFriend();
		}
	}, [userInfo]);

	return (
		<section
			className={`${style.userWrapper} ${point > 100 ? style.active : ""}`}
			ref={scrollRef}
		>
			<div
				className={style.arrow}
				onClick={() => {
					router.back();
				}}
			>
				<i className={"iconfont wb-jiantou"}></i>
			</div>
			{user.avatar ? (
				<>
					<div className={style.banner}>
						<figure>
							{user.banner && (
								<Image src={user.banner} width={750} height={750} alt="" />
							)}
						</figure>
					</div>
					<div className={style.user}>
						{userInfo.id === user.id ? (
							<Link className={style.edit} href={`/${locale}/about`}>
								{t2("编辑")}
							</Link>
						) : (
							<div className={style.flex}>
								<div
									className={`${style.follow} ${isFollow ? style.active : ""}`}
									onClick={() => {
										if (!userInfo.token) {
											router.push(`/${locale}/login`);
											return;
										}
										debounceHandleFollow();
									}}
								>
									{isFollow ? t2("已关注") : t2("关注")}
								</div>
								<div
									className={`${style.follow} ${isFriend ? style.active : ""}`}
									onClick={() => {
										if (!userInfo.token) {
											router.push(`/${locale}/login`);
											return;
										}
										if (!isFriend) handleSendFriend();
									}}
								>
									{!isFriend ? "+ " + t2("好友") : t2("好友")}
								</div>
							</div>
						)}

						<figure>
							{user.avatar && (
								<Image src={user.avatar} width={750} height={750} alt="" />
							)}
							{dayjs(user.vip) > dayjs() && (
								<div className={style.vip}>
									<i className={"iconfont wb-renzhengyonghu"}></i>
								</div>
							)}
						</figure>
						<h5>{user.username}</h5>
						<h6>{user.onlyname}</h6>
						<p className={style.describe}>{user.describe}</p>
						<div className={style.list}>
							<span>
								{user.sex ? (user.sex === 1 ? t("男") : t("女")) : t("秘密")}
							</span>
							<div className={style.dot}>·</div>
							<span>{user.age}</span>
							<div className={style.dot}>·</div>
							<span>
								{dayjs(user.createdAt).format("YYYY. MM. DD ")}
								{t("加入")}
							</span>
						</div>
						<div className={style.list}>
							<p>{user.follows}</p>
							<span>{t1("关注")}</span>
							<div className={style.place}></div>
							<p>{user.fans}</p>
							<span>{t1("粉丝")}</span>
						</div>
					</div>
					<div className={style.nav}>
						{Object.keys(navList).map((item) => {
							return (
								<span
									key={item}
									className={navType === Number(item) ? style.active : ""}
									onClick={() => {
										setNavType(Number(item));
										setLoading(false);

										let obj: i_searchParam = {
											user_id: user.id,
											user_like: true,
										};

										if (!Number(item)) {
											delete obj.user_like;
										}

										setParam(obj);
									}}
								>
									{navList[item]}
								</span>
							);
						})}
					</div>
					{loading && (
						<div style={{ position: "relative", minHeight: 150 }}>
							<RenderItem param={param} />
						</div>
					)}
				</>
			) : (
				<Loading />
			)}
		</section>
	);
}

export default Index;
