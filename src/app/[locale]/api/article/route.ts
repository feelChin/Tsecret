import { NextResponse } from "next/server";
import db from "@util/db";
import { jwt_verify } from "@util/db/jwt";
import ArticleListModel from "@util/db/mongoose/article_list";
import UserInfoModel from "@util/db/mongoose/user_info";
import UserDynamicModel from "@util/db/mongoose/user_dynamic";

export async function POST(req: Request) {
	try {
		const { content, img_list } = await req.json();

		const { user_id } = await jwt_verify(req);

		// 连接数据库
		await db();

		const checkUser = await UserInfoModel.findOne({ _id: user_id });

		if (checkUser) {
			const res = await ArticleListModel.create({
				user_id,
				content,
				img_list,
			});

			//异步创建动态
			const createDynamicRecord = async () => {
				try {
					await UserDynamicModel.create({
						user_id,
						article_id: res._id,
						text: content.substring(0, 10) + "...",
					});
				} catch (err) {
					console.error(err);
				}
			};

			createDynamicRecord();

			return NextResponse.json({
				code: 200,
				msg: "发布成功",
			});
		}

		return NextResponse.json({
			code: 400,
			msg: "发布错误",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
