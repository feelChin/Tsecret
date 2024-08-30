"use client";

import { useState } from "react";
import Image from "next/image";
import Message from "@component/message";
import { renderTimeFormat } from "@util/renderTime";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import store from "@util/store";
import ScrollPage, { i_scroll } from "@component/scrollPage";
import Http from "@util/fetch";
import Link from "next/link";
import Fold from "./fold";
import style from "./page.module.scss";

interface i_pageList extends i_scroll {}

interface i_props {
	p_id?: string | undefined;
	id: string;
	goComment: (id: string, parent_id?: string | null) => void;
}

function Index(props: i_props) {
	const locale = useLocale();
	const t = useTranslations("home");
	const router = useRouter();

	const { userInfo } = store();

	const { p_id, id, goComment } = props;

	const [pagelist, setPageList] = useState<i_pageList>({
		data: [],
		total: 0,
		loading: false,
	});

	async function queryCommentList(param = {} as any) {
		if (!p_id) delete param.p_id;

		try {
			const { data, total } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/comment`,
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

	return (
		<div className={style.commentList}>
			<ScrollPage
				{...pagelist}
				request={(v) => {
					queryCommentList({
						id,
						p_id,
						...v,
					});
				}}
			>
				{pagelist.data.map(
					({
						avatar,
						username,
						onlyname,
						user_id,
						content,
						_id,
						count = 0,
						createdAt,
					}) => {
						return (
							<div
								key={_id}
								className={`${style.item} ${p_id ? style.little : ""}`}
							>
								<Link href={`${user_id}`}>
									<figure>
										<Image src={avatar} width={50} height={50} alt="" />
									</figure>
								</Link>
								<div className={style.font}>
									<div className={style.text}>
										<p>{username}</p>
										<span>{onlyname}</span>
										<div className={style.dot}>·</div>
										<span>{renderTimeFormat(createdAt)}</span>
									</div>
									<div className={style.content}>
										<p>{content}</p>
										{!p_id && (
											<div className={style.iconItem}>
												{count > 0 && (
													<Fold {...props} p_id={_id}>
														<div className={style.icon}>
															<i className="iconfont wb-fayan"></i>
															<span>{count}</span>
														</div>
													</Fold>
												)}
												<div
													className={style.icon}
													onClick={() => {
														if (!userInfo.id) {
															router.push(`/${locale}/login`);
															return;
														}

														goComment(id, _id);
													}}
												>
													<span>{t("回复")}</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						);
					}
				)}
			</ScrollPage>
		</div>
	);
}

export default Index;
