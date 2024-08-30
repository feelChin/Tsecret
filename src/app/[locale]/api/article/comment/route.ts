import { NextResponse } from "next/server";
import db from "@util/db";
import mongoose, { PipelineStage } from "mongoose";
import { jwt_verify } from "@util/db/jwt";
import { base_total } from "@util/db/util";
import UserDynamicModel from "@util/db/mongoose/user_dynamic";
import ArticleListModel from "@util/db/mongoose/article_list";
import CommentModel from "@util/db/mongoose/article_comment";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		const id = searchParams.get("id");
		const p_id = searchParams.get("p_id");

		await db();

		const pipeline: PipelineStage[] = [
			{ $match: { article_id: id, parent_id: p_id ?? null } },
			{ $addFields: { user_id: { $toObjectId: "$user_id" } } },
			{ $sort: { createdAt: -1 } },
			{
				$lookup: {
					from: "user_info",
					localField: "user_id",
					foreignField: "_id",
					as: "get_user",
				},
			},
			{
				$addFields: {
					avatar: "$get_user.avatar",
					username: "$get_user.username",
					onlyname: "$get_user.onlyname",
				},
			},
			{
				$unwind: "$avatar",
			},
			{
				$unwind: "$username",
			},
			{
				$unwind: "$onlyname",
			},
			{
				$project: {
					__v: 0,
					updatedAt: 0,
					get_user: 0,
				},
			},
			base_total(req),
		];

		const [item] = await CommentModel.aggregate(pipeline);

		const { metadata, data } = item;

		return NextResponse.json({
			code: 200,
			data: data,
			total: metadata[0]?.total,
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
		const { article_id, parent_id, content } = await req.json();

		const { user_id } = await jwt_verify(req);

		await db();

		session.startTransaction();

		if (parent_id) {
			await CommentModel.updateOne(
				{
					_id: parent_id,
				},
				{ $inc: { count: 1 } },
				{ session }
			);
		}

		await CommentModel.insertMany(
			[
				{
					user_id,
					parent_id,
					article_id,
					content,
				},
			],
			{ session }
		);

		await ArticleListModel.updateOne(
			{
				_id: article_id,
			},
			{ $inc: { comment: 1 } },
			{ session }
		);

		await session.commitTransaction();

		//异步创建动态
		const createDynamicRecord = async () => {
			try {
				await UserDynamicModel.create({
					user_id,
					article_id: article_id,
					type: 3,
					text: content.substring(0, 10) + "...",
				});
			} catch (err) {
				console.error(err);
			}
		};

		createDynamicRecord();

		return NextResponse.json({
			code: 200,
			msg: "评论成功",
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
