import { NextResponse } from "next/server";
import db from "@util/db";
import UserInfoModel from "@util/db/mongoose/user_info";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		const user_id = searchParams.get("user_id") || 0;

		await db();

		const checkUser = await UserInfoModel.findOne(
			{ _id: user_id },
			{
				password: 0,
				__v: 0,
				updatedAt: 0,
			}
		);

		if (checkUser) {
			const data = checkUser._doc;
			data.id = data._id;

			delete data._id;

			return NextResponse.json({
				code: 200,
				data: data,
			});
		}

		return NextResponse.json({
			code: 400,
			msg: "查询失败",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
