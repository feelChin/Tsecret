"use client";

import Head from "@component/head";
import NoMsg from "@component/noMsg";
import { useTranslations } from "next-intl";
import RenderItem, { i_searchParam } from "@component/renderItem";
import { useState } from "react";
import useLoading from "@hook/useLoading";
import style from "./page.module.scss";

interface i_var {
	[key: string]: string;
}

function Index() {
	const t = useTranslations("search");

	const { loading, setLoading } = useLoading();

	const [param, setParam] = useState<i_searchParam>({
		search: "",
		searchType: 0,
		sort: 0,
	});
	const [visable, setVisable] = useState<boolean>(false);

	const var_sort: i_var = {
		0: t("最新"),
		1: t("热门"),
	};

	const var_searchType: i_var = {
		0: t("不限"),
		1: t("文章详情"),
		2: t("用户名"),
	};

	return (
		<>
			<Head
				isBack={false}
				centerType="search"
				centerCall={(val) => {
					setParam({
						...param,
						search: val,
					});
					setLoading(false);
				}}
				other={
					<i
						onClick={() => {
							setVisable(true);
						}}
						className={"iconfont wb-shezhi"}
					></i>
				}
			/>
			<div className={`${style.clientPopup} ${visable ? style.active : ""}`}>
				<div
					className={style.clientPopupBg}
					onClick={() => {
						setVisable(false);
					}}
				></div>
				<div className={style.clientPopupWrapper}>
					<p>{t("排序")}</p>
					<div className={style.list}>
						{Object.keys(var_sort).map((item) => {
							return (
								<div
									className={`${style.item} ${
										param.sort === Number(item) ? style.active : ""
									}`}
									key={item}
									onClick={() => {
										setParam({
											...param,
											sort: Number(item),
										});
									}}
								>
									{var_sort[item]}
								</div>
							);
						})}
					</div>
					<p>{t("内容")}</p>
					<div className={style.list}>
						{Object.keys(var_searchType).map((item) => {
							return (
								<div
									className={`${style.item} ${
										param.searchType === Number(item) ? style.active : ""
									}`}
									key={item}
									onClick={() => {
										setParam({
											...param,
											searchType: Number(item),
										});
									}}
								>
									{var_searchType[item]}
								</div>
							);
						})}
					</div>
				</div>
			</div>
			{param.search ? (
				<>
					{loading && (
						<div className="pageWrapper">
							<RenderItem param={param} />
						</div>
					)}
				</>
			) : (
				<NoMsg />
			)}
		</>
	);
}

export default Index;
