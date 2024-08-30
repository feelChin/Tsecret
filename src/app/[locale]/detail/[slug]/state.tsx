"use client";

import { useLocale, useTranslations } from "next-intl";
import store from "@util/store";
import { useEffect, useState } from "react";
import Http from "@util/fetch";
import { useRouter } from "next/navigation";
import useDebounce from "@hook/useDebounce";
import Message from "@component/message";
import style from "./page.module.scss";

interface i_param {
	article_id: string;
}

interface i_state {
	like: number;
	share: number;
	comment: number;
	isLike: boolean;
}

function Index({
	id,
	goComment,
}: {
	id: string;
	goComment: (id: string, parent_id?: string | null) => void;
}) {
	const locale = useLocale();
	const t = useTranslations("home");
	const router = useRouter();

	const { userInfo } = store();

	const [state, setState] = useState<i_state>({
		like: 0,
		share: 0,
		comment: 0,
		isLike: false,
	});

	const debouncehandleLike: (v: i_param) => void = useDebounce(handleLike);

	async function queryArticel() {
		try {
			const { data } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/list`,
				{
					method: "get",
				},
				{
					id,
				}
			)) as { data: i_state };

			setState(data);
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
		try {
			await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/like`,
				{
					method: "post",
				},
				params
			);

			setState({
				...state,
				like: state.isLike ? state.like - 1 : state.like + 1,
				isLike: !state.isLike,
			});
		} catch (err) {
			Message.error(err);
		}
	}

	useEffect(() => {
		queryArticel();
	}, []);

	const { comment, share, isLike, like } = state;

	return (
		<div className={style.iconList}>
			<div
				className={style.icon}
				onClick={() => {
					if (!userInfo.id) {
						router.push(`/${locale}/login`);
						return;
					}
					goComment(id);
				}}
			>
				<i className="iconfont wb-fayan"></i>
				<span>{comment}</span>
			</div>
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
						article_id: id,
					});
				}}
			>
				<i className={`iconfont wb-aixin ${isLike ? style.active : ""}`}></i>
				<span>{like}</span>
			</div>
			<div
				className={style.icon}
				onClick={() => {
					if (!userInfo.id) {
						router.push(`/${locale}/login`);
						return;
					}
					handleShare(id);
				}}
			>
				<i className="iconfont wb-zhuanfa"></i>
			</div>
		</div>
	);
}

export default Index;
