import { NextResponse } from "next/server";
import db from "@util/db";
import mongoose from "mongoose";
import { jwt_verify } from "@util/db/jwt";
import UserDynamicModel from "@util/db/mongoose/user_dynamic";
import ArticleListModel from "@util/db/mongoose/article_list";
import ArticleLikeModel from "@util/db/mongoose/article_like";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id") || " ";

		const { user_id } = await jwt_verify(req);

		await db();

		const res = await ArticleLikeModel.find({
			user_id,
			article_id: id.indexOf(",") > -1 ? { $in: id.split(",") } : id,
		});

		return NextResponse.json({
			code: 200,
			data: res.map((item) => {
				return item.article_id;
			}),
		});
	} catch (err: any) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}

export async function POST(req: Request) {
	const session = await mongoose.startSession();

	try {
		const { article_id } = await req.json();

		const { user_id } = await jwt_verify(req);

		await db();

		session.startTransaction();

		const checkLike = await ArticleLikeModel.findOne({
			article_id,
			user_id,
		}).session(session);

		if (checkLike) {
			await ArticleLikeModel.deleteOne(
				{
					article_id,
					user_id,
				},
				{ session }
			);
		} else {
			await ArticleLikeModel.insertMany(
				[
					{
						article_id,
						user_id,
					},
				],
				{ session }
			);
		}

		await ArticleListModel.updateOne(
			{
				_id: article_id,
			},
			{ $inc: { like: checkLike ? -1 : 1 } },
			{ session }
		);

		await session.commitTransaction();

		//异步创建动态
		const createDynamicRecord = async () => {
			try {
				const hasDynamic = await UserDynamicModel.findOne({
					user_id,
					article_id: article_id,
					type: 1,
				});

				if (hasDynamic) {
					await UserDynamicModel.deleteOne({
						article_id,
						user_id,
						type: 1,
					});

					return;
				}

				const item = await ArticleListModel.findOne({
					_id: article_id,
				});

				await UserDynamicModel.create({
					user_id,
					article_id: article_id,
					type: 1,
					text: item.content.substring(0, 10) + "...",
				});
			} catch (err) {
				console.error(err);
			}
		};

		createDynamicRecord();

		return NextResponse.json({
			code: 200,
			msg: checkLike ? "已取消点赞" : "点赞成功",
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
