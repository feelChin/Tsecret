import { NextResponse } from "next/server";
import db from "@util/db";
import { jwt_verify } from "@util/db/jwt";
import { PipelineStage } from "mongoose";
import { base_total } from "@util/db/util";
import UserDynamicModel from "@util/db/mongoose/user_dynamic";
import ArticleListModel from "@util/db/mongoose/article_list";
import dayjs from "dayjs";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const type = searchParams.get("type") || 0;

		const { user_id } = await jwt_verify(req);

		await db();

		if (type) {
		}

		const res = await ArticleListModel.find({
			user_id,
		});

		const article_ids = res.map((item) => String(item._id));

		const pipeline: PipelineStage[] = [
			{
				$match: {
					article_id: {
						$in: article_ids,
					},
					user_id: {
						$ne: user_id,
					},
					type: {
						$gt: 0,
					},
					$expr: {
						$gt: [
							"$createdAt",
							dayjs().subtract(7, "day").format("YYYY-MM-DD"),
						],
					},
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
					onlyname: "$get_user.onlyname",
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
				$unwind: "$onlyname",
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
