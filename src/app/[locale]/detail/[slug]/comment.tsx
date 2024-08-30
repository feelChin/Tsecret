"use client";

import Image from "next/image";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import Http from "@util/fetch";
import store from "@util/store";
import Message from "@component/message";
import style from "./page.module.scss";

function Index({
	id,
	p_id,
	close,
}: {
	id: string;
	p_id: string | null;
	close: (v?: boolean) => void;
}) {
	const t = useTranslations("home");

	const inputRef = useRef<HTMLInputElement | null>(null);

	const {
		userInfo: { avatar },
	} = store();

	async function sendComment() {
		try {
			await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article/comment`,
				{
					method: "post",
				},
				{
					article_id: id,
					parent_id: p_id,
					content: inputRef.current?.value,
				}
			);

			close(true);

			Message.success(t("评论成功"));
		} catch (err) {
			Message.error(err);
		}
	}

	return (
		<div className={style.commentWrapper}>
			<div
				className={style.commentWrapperBg}
				onClick={() => {
					close();
				}}
			></div>
			<div className={style.content}>
				<figure>
					{avatar && <Image src={avatar} width={50} height={50} alt="" />}
				</figure>
				<input
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							if (inputRef.current?.value) sendComment();
						}
					}}
					ref={inputRef}
					type="text"
					placeholder={t("请输入评论")}
				/>
			</div>
		</div>
	);
}

export default Index;
