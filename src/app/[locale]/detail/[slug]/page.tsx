import Head from "@component/head";
import Image from "next/image";
import { unstable_setRequestLocale } from "next-intl/server";
import db from "@util/db";
import ImgList from "@component/imgList";
import UserInfoModel from "@util/db/mongoose/user_info";
import ArticleListModel from "@util/db/mongoose/article_list";
import dayjs from "dayjs";
import Client from "./client";
import style from "./page.module.scss";

interface inter_props {
	params: {
		slug: string;
		locale: string;
	};
}

export async function generateMetadata({ params }: inter_props) {
	return {
		title: params.slug,
	};
}

export async function generateStaticParams() {
	await db();

	const data = await ArticleListModel.find();

	return data.map(({ _id }: { _id: number }) => ({
		slug: String(_id),
	}));
}

export default async function Index({ params }: inter_props) {
	const { slug, locale } = params;

	unstable_setRequestLocale(locale);

	await db();

	const { content, user_id, img_list } = await ArticleListModel.findOne({
		_id: slug,
	});

	const { onlyname, username, avatar, createdAt } = await UserInfoModel.findOne(
		{
			_id: user_id,
		}
	);

	console.log({ content, user_id, img_list });

	console.log({
		onlyname,
		username,
		avatar,
		createdAt,
	});

	return (
		<section className="page">
			<Head centerType={"custom"} centerName={"Tsecret"} />
			<div className={`pageWrapper ${style.detail}`}>
				<div className={style.userWrapper}>
					<figure className={style.avatar}>
						<Image width={100} height={100} src={avatar as string} alt="" />
					</figure>
					<div className={style.font}>
						<h5>{username}</h5>
						<p>{onlyname}</p>
					</div>
				</div>
				<div className={style.text}>
					{content}
					<ImgList imgList={img_list} />
				</div>
				<div className={style.other}>
					{dayjs(createdAt).format("YYYY/MM/DD · HH:mm")}
				</div>
				<Client id={slug} />
			</div>
		</section>
	);
}
