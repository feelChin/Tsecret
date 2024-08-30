import { NextResponse } from "next/server";
import db from "@util/db";
import { jwt_verify } from "@util/db/jwt";
import { PipelineStage } from "mongoose";
import { base_total } from "@util/db/util";
import UserFriendModel from "@util/db/mongoose/friend";
import MessageModel from "@util/db/mongoose/message";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const type = searchParams.get("type");
		const unread = searchParams.get("unread");

		const { user_id } = await jwt_verify(req);

		// 连接数据库
		await db();

		//查询当前组
		if (type) {
			let pipeline: PipelineStage[] = [
				{
					$match: {
						type,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
				{
					$project: {
						__v: 0,
						updatedAt: 0,
					},
				},
				base_total(req),
			];

			const [item] = await MessageModel.aggregate(pipeline);

			const { metadata, data } = item;

			return NextResponse.json({
				code: 200,
				data,
				total: metadata[0]?.total,
			});
		}

		// 未读
		if (unread) {
			const res = await UserFriendModel.find({
				friend_ids: {
					$in: [user_id],
				},
				status: 1,
			});

			const conditions = res.map((item) => {
				const id = (item.friend_ids as string[]).find(
					(el) => el !== user_id
				) as string;

				return {
					type: String(item._id),
					user_id: id,
				};
			});

			if (!conditions.length) {
				return NextResponse.json({
					code: 200,
					data: [],
				});
			}

			let pipeline: PipelineStage[] = [
				{
					$match: {
						$or: conditions,
						status: 0, // 未读状态
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
				{
					$group: {
						_id: "$type",
						user_id: { $first: "$user_id" },
						count: { $count: {} },
						text: { $first: "$text" },
						type: { $first: "$type" },
						createdAt: { $first: "$createdAt" },
					},
				},
				{ $addFields: { user_id: { $toObjectId: "$user_id" } } },
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
					},
				},
				{
					$unwind: "$avatar",
				},
				{
					$unwind: "$username",
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
				{
					$project: {
						__v: 0,
						_id: 0,
						updatedAt: 0,
						get_user: 0,
						createdAt: 0,
					},
				},
			];

			const data = await MessageModel.aggregate(pipeline);

			return NextResponse.json({
				code: 200,
				data,
			});
		}
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}

export async function POST(req: Request) {
	try {
		const param = await req.json();

		const { text, type } = param;

		const { user_id } = await jwt_verify(req);

		// 连接数据库
		await db();

		await MessageModel.create({ type, user_id, text });

		return NextResponse.json({
			code: 200,
			msg: "发送成功",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}

export async function PUT(req: Request) {
	try {
		await jwt_verify(req);

		const { ids } = await req.json();

		// 连接数据库
		await db();

		await MessageModel.updateMany(
			{
				_id: {
					$in: ids,
				},
			},
			{
				status: 1,
			}
		);

		return NextResponse.json({
			code: 200,
			msg: "已读",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
