import { NextResponse } from "next/server";
import db from "@util/db";
import mongoose from "mongoose";
import { jwt_verify } from "@util/db/jwt";
import ArticleListModel from "@util/db/mongoose/article_list";
import UserDynamicModel from "@util/db/mongoose/user_dynamic";
import ShareModel from "@util/db/mongoose/article_share";

export async function POST(req: Request) {
	const session = await mongoose.startSession();

	try {
		const { article_id } = await req.json();

		const { user_id } = await jwt_verify(req);

		await db();

		session.startTransaction();

		const checkUser = await ShareModel.findOne({
			article_id,
			user_id,
		}).session(session);

		if (checkUser) {
			return NextResponse.json({
				code: 200,
				msg: "分享成功",
			});
		}

		await ShareModel.insertMany(
			[
				{
					article_id,
					user_id,
				},
			],
			{ session }
		);

		await ArticleListModel.updateOne(
			{
				_id: article_id,
			},
			{ $inc: { share: checkUser ? -1 : 1 } },
			{ session }
		);

		await session.commitTransaction();

		//异步创建动态
		const createDynamicRecord = async () => {
			try {
				const hasDynamic = await UserDynamicModel.findOne({
					user_id,
					article_id: article_id,
					type: 2,
				});

				if (hasDynamic) {
					return;
				}

				const item = await ArticleListModel.findOne({
					_id: article_id,
				});

				await UserDynamicModel.create({
					user_id,
					article_id: article_id,
					type: 2,
					text: item.content.substring(0, 10) + "...",
				});
			} catch (err) {
				console.error(err);
			}
		};

		createDynamicRecord();

		return NextResponse.json({
			code: 200,
			msg: "分享成功",
		});
	} catch (err: any) {
		await session.abortTransaction();

		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	} finally {
		session.endSession();
	}
}
