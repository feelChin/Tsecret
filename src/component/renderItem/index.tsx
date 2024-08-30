"use client";

import Image from "next/image";
import Link from "next/link";
import ImgList from "@component/imgList";
import { renderTimeFormat } from "@util/renderTime";
import { useTranslations, useLocale } from "next-intl";
import store from "@util/store";
import MySwiper, { i_imgListprops } from "@component/mySwiper";
import { useEffect, useState } from "react";
import useDebounce from "@hook/useDebounce";
import Http from "@util/fetch";
import ScrollPage, { i_scroll } from "@component/scrollPage";
import Message from "@component/message";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import style from "./index.module.scss";

interface i_user {
	user_id: string;
	username: string;
	onlyname: string;
	avatar: string;
	vip: string;
	fans: number;
}

interface i_item extends i_user {
	content: string;
	img_list: string[];
	like: number;
	comment: number;
	share: number;
	_id: string;
	createdAt: string;
	isLike: boolean;
}

interface i_param {
	article_id: string;
}

interface i_pageList extends i_scroll {
	data: i_item[];
}

export interface i_searchParam {
	search?: string;
	searchType?: number;
	sort?: number;
	user_id?: string;
	user_like?: boolean;
}

const init_config = { imgList: [], activeKey: 0, visable: false };

function Index({ param = {} }: { param?: i_searchParam }) {
	const t = useTranslations("home");
	const locale = useLocale();

	const router = useRouter();

	const { userInfo } = store();

	const [pagelist, setPageList] = useState<i_pageList>({
		data: [],
		total: 0,
		loading: false,
	});
	const [config, setConfig] = useState<i_imgListprops>(init_config);
	const [likeList, setLikeList] = useState<string[]>([]);

	const debouncehandleLike: (v: i_param) => void = useDebounce(handleLike);

	useEffect(() => {
		if (param.searchType === 2) return;

		if (!!pagelist.data.length) {
			const arr: string[] = [];
			pagelist.data.forEach(({ isLike, _id }) => {
				if (isLike) arr.push(_id);
			});
			setLikeList(arr);
		}
	}, [pagelist]);

	async function queryArticleList(v = {}) {
		try {
			const { data, total } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/list`,
				{
					method: "get",
				},
				{
					...v,
					...param,
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

	async function handleShare(id: string) {
		try {
			await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/share`,
				{
					method: "post",
				},
				{ article_id: id }
			);

			await navigator.clipboard.writeText(
				`${process.env.NEXT_PUBLIC_BASE_URL}${locale}/detail/${id}`
			);

			Message.success(t("分享链接复制成功"));
		} catch (err) {
			Message.error(err);
		}
	}

	async function handleLike(params: i_param) {
		const { article_id } = params;

		try {
			await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/like`,
				{
					method: "post",
				},
				params
			);

			if (likeList.includes(article_id)) {
				const key = likeList.findIndex((item) => item === article_id);
				const newList = [...likeList];
				newList.splice(key, 1);

				setLikeList(newList);
			} else {
				setLikeList([...likeList, article_id]);
			}
		} catch (err) {
			Message.error(err);
		}
	}

	return (
		<>
			<MySwiper
				{...config}
				cancel={() => {
					setConfig(init_config);
				}}
			/>
			<ScrollPage
				{...pagelist}
				request={(v) => {
					queryArticleList(v);
				}}
			>
				<>
					{param.searchType === 2 ? (
						<div className={style.userList}>
							{pagelist.data.map(
								({ avatar, _id, username, onlyname, vip, fans }: i_item) => {
									return (
										<div className={style.item} key={_id}>
											<Link
												className={style.link}
												href={`/${locale}/user/${_id}`}
											></Link>
											<figure>
												{<Image src={avatar} width={55} height={55} alt="" />}
												{dayjs(vip) > dayjs() && (
													<div className={style.vip}>
														<i className={"iconfont wb-renzhengyonghu"}></i>
													</div>
												)}
											</figure>
											<div className={style.text}>
												<div className={style.title}>
													<h5>{username}</h5>
													<span>{onlyname}</span>
												</div>
												<div className={style.fans}>
													<i className={"iconfont wb-fensi"}></i>
													<span>{fans}</span>
												</div>
												<i className={`${style.arrow} iconfont wb-jiantou`}></i>
											</div>
										</div>
									);
								}
							)}
						</div>
					) : (
						<div className={style.list}>
							{pagelist.data.map(
								({
									avatar,
									content,
									like,
									comment,
									share,
									user_id,
									_id,
									img_list,
									username,
									onlyname,
									createdAt,
									isLike,
									vip,
								}: i_item) => {
									return (
										<div className={style.item} key={_id}>
											<figure>
												<Link href={`/${locale}/user/${user_id}`}>
													{<Image src={avatar} width={55} height={55} alt="" />}
												</Link>
											</figure>
											<div className={style.text}>
												<div className={style.title}>
													<h5>{username}</h5>
													{dayjs(vip) > dayjs() && (
														<i className={"iconfont wb-renzhengyonghu"}></i>
													)}
													<span>{onlyname}</span>
													<span style={{ margin: "0 .2rem" }}>·</span>
													<span>{renderTimeFormat(createdAt)}</span>
												</div>
												<Link
													href={`/${locale}/detail/${_id}`}
													className={style.content}
												>
													{content}
												</Link>
												<ImgList imgList={img_list} />
												<div className={style.iconList}>
													<Link
														href={`/${locale}/detail/${_id}`}
														className={style.icon}
													>
														<i className="iconfont wb-fayan"></i>
														<span>{comment}</span>
													</Link>
													<div className={style.icon}>
														<i className="iconfont wb-zhuanfa1"></i>
														<span>{share}</span>
													</div>
													<div
														className={style.icon}
														onClick={() => {
															if (!userInfo.id) {
																router.push(`/${locale}/login`);
																return;
															}
															debouncehandleLike({
																article_id: _id,
															});
														}}
													>
														<i
															className={`iconfont wb-aixin ${
																likeList.includes(_id) ? style.active : ""
															}`}
														></i>
														<span>
															{isLike && likeList.includes(_id)
																? like
																: likeList.includes(_id)
																? like + 1
																: isLike
																? like - 1
																: like}
														</span>
													</div>
													<div
														className={style.icon}
														onClick={() => {
															if (!userInfo.id) {
																router.push(`/${locale}/login`);
																return;
															}
															handleShare(_id);
														}}
													>
														<i className="iconfont wb-zhuanfa"></i>
													</div>
												</div>
											</div>
										</div>
									);
								}
							)}
						</div>
					)}
				</>
			</ScrollPage>
		</>
	);
}

export default Index;
