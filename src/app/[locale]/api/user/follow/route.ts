import { NextResponse } from "next/server";
import db from "@util/db";
import mongoose from "mongoose";
import { jwt_verify } from "@util/db/jwt";
import UserInfoModel from "@util/db/mongoose/user_info";
import FollowModel from "@util/db/mongoose/follow";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		const follow_id = searchParams.get("follow_id") || 0;
		const { user_id } = await jwt_verify(req);

		await db();

		const checkUser = await FollowModel.findOne({
			follow_id,
			user_id,
		});

		return NextResponse.json({
			code: 200,
			status: checkUser ? 1 : 0,
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
		const { follow_id } = await req.json();

		const { user_id } = await jwt_verify(req);

		await db();

		session.startTransaction();

		const checkUser = await FollowModel.findOne({
			follow_id,
			user_id,
		}).session(session);

		if (checkUser) {
			await FollowModel.deleteOne(
				{
					follow_id,
					user_id,
				},
				{ session }
			);
		} else {
			await FollowModel.insertMany(
				[
					{
						follow_id,
						user_id,
					},
				],
				{ session }
			);
		}

		await UserInfoModel.updateOne(
			{
				_id: user_id,
			},
			{ $inc: { follows: checkUser ? -1 : 1 } },
			{ session }
		);
		await UserInfoModel.updateOne(
			{
				_id: follow_id,
			},
			{ $inc: { fans: checkUser ? -1 : 1 } },
			{ session }
		);

		await session.commitTransaction();

		return NextResponse.json({
			code: 200,
			msg: checkUser ? "已取消关注" : "关注成功",
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
