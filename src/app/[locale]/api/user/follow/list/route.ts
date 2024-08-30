import { NextResponse } from "next/server";
import db from "@util/db";
import { PipelineStage } from "mongoose";
import { jwt_verify } from "@util/db/jwt";
import { base_total } from "@util/db/util";
import FollowModel from "@util/db/mongoose/follow";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		const type = Number(searchParams.get("type")) || 0;
		const { user_id } = await jwt_verify(req);

		await db();

		const param: any = {};

		if (type) {
			param.follow_id = user_id;
		} else {
			param.user_id = user_id;
		}

		let pipeline: PipelineStage[] = [
			{
				$match: param,
			},
			{
				$addFields: { uid: { $toObjectId: type ? "$user_id" : "$follow_id" } },
			},
			{
				$lookup: {
					from: "user_info",
					localField: "uid",
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
					follow_id: 0,
					user_id: 0,
				},
			},
			base_total(req),
		];

		const [item] = await FollowModel.aggregate(pipeline);

		const { data, metadata } = item;

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
