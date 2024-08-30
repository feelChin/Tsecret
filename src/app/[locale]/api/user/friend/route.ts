import { NextResponse } from "next/server";
import { jwt_verify } from "@util/db/jwt";
import db from "@util/db";
import { PipelineStage } from "mongoose";
import { base_total } from "@util/db/util";
import UserFriendModel from "@util/db/mongoose/friend";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const detail = Boolean(searchParams.get("detail")) || false;
		const friend_id = searchParams.get("friend_id");

		const { user_id } = await jwt_verify(req);

		await db();

		if (detail) {
			let pipeline: PipelineStage[] = [
				{
					$match: {
						friend_ids: {
							$in: [user_id],
						},
						status: 1,
					},
				},
				{
					$addFields: {
						prev_friend: { $arrayElemAt: ["$friend_ids", 0] },
						next_friend: { $arrayElemAt: ["$friend_ids", 1] },
					},
				},
				{
					$addFields: {
						lookupField: {
							$cond: {
								if: { $eq: ["$prev_friend", user_id] },
								then: { $toObjectId: "$next_friend" },
								else: { $toObjectId: "$prev_friend" },
							},
						},
					},
				},
				{
					$lookup: {
						from: "user_info",
						localField: "lookupField",
						foreignField: "_id",
						as: "get_user",
					},
				},
				{
					$addFields: {
						home_id: "$_id",
						user_id: "$get_user._id",
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
					$unwind: "$user_id",
				},
				{
					$project: {
						__v: 0,
						_id: 0,
						lookupField: 0,
						updatedAt: 0,
						createdAt: 0,
						status: 0,
						apply_friend: 0,
						friend_ids: 0,
						get_user: 0,
						prev_friend: 0,
						next_friend: 0,
					},
				},
				base_total(req),
			];

			const [item] = await UserFriendModel.aggregate(pipeline);

			const { data, metadata } = item;

			return NextResponse.json({
				code: 200,
				data,
				total: metadata[0]?.total,
			});
		}

		if (friend_id) {
			const isFriend = await UserFriendModel.findOne({
				friend_ids: {
					$all: [user_id, friend_id],
				},
				status: 1,
			});

			return NextResponse.json({
				code: 200,
				status: isFriend ? 1 : 0,
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

		const { user_id } = await jwt_verify(req);

		const { friend_id } = param;

		await db();

		const findUser = await UserFriendModel.findOne(
			{
				friend_ids: {
					$all: [user_id, friend_id],
				},
			},
			{
				__v: 0,
				updatedAt: 0,
			}
		);

		if (findUser) {
			const { friend_ids } = findUser;

			const [user_friend, apply_friend] = friend_ids;

			if (apply_friend === user_id) {
				await UserFriendModel.updateOne(
					{
						friend_ids: [user_friend, apply_friend],
					},
					{ status: 1 }
				);

				return NextResponse.json({
					code: 200,
					msg: "同意好友请求",
				});
			}

			if (findUser.status) {
				return NextResponse.json({
					code: 200,
					msg: "已经是好友",
				});
			} else {
				return NextResponse.json({
					code: 200,
					msg: "请勿重复提交，请等待该用户回复",
				});
			}
		}

		console.log(3);

		await UserFriendModel.create({ friend_ids: [user_id, friend_id] });

		return NextResponse.json({
			code: 200,
			msg: "申请成功",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
