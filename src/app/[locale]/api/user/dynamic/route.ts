import { NextResponse } from "next/server";
import db from "@util/db";
import { jwt_verify } from "@util/db/jwt";
import followModel from "@util/db/mongoose/follow";
import { PipelineStage } from "mongoose";
import { base_total } from "@util/db/util";
import UserDynamicModel from "@util/db/mongoose/user_dynamic";
import dayjs from "dayjs";

interface i_follow {
	[key: string]: string;
}

export async function GET(req: Request) {
	try {
		const { user_id } = await jwt_verify(req);

		await db();

		const res = await followModel.find({
			user_id,
		});

		if (!res.length) {
			return NextResponse.json({
				code: 200,
				data: [],
				total: 0,
			});
		}

		const follow: i_follow = {};

		res.forEach(({ follow_id, createdAt }) => {
			follow[follow_id] = createdAt;
		});

		const pipeline: PipelineStage[] = [
			{
				$match: {
					$or: Object.keys(follow).map((user_id) => ({
						$and: [
							{ user_id: user_id },
							{ $expr: { $gt: ["$createdAt", follow[user_id]] } },
							{ type: 0 },
							{
								$expr: {
									$gt: [
										"$createdAt",
										dayjs().subtract(7, "day").format("YYYY-MM-DD"),
									],
								},
							},
						],
					})),
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
			{ $sort: { createdAt: -1 } },
			{
				$addFields: {
					avatar: "$get_user.avatar",
					username: "$get_user.username",
					isVip: "$get_user.vip",
				},
			},
			{
				$unwind: "$avatar",
			},
			{
				$unwind: "$username",
			},
			{
				$unwind: "$isVip",
			},
			{
				$project: {
					updatedAt: 0,
					__v: 0,
					createdAt: 0,
					get_user: 0,
				},
			},
			base_total(req),
		];

		const [item] = await UserDynamicModel.aggregate(pipeline);

		const { metadata, data } = item;

		const now = dayjs();

		data.forEach((item: any) => {
			item.isVip = dayjs(item.isVip) > now;
		});

		return NextResponse.json({
			code: 200,
			data,
			total: metadata[0]?.total,
		});
	} catch (err: any) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
