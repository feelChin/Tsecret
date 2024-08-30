import { NextResponse } from "next/server";
import { jwt_sign, jwt_verify } from "@util/db/jwt";
import db from "@util/db";
import UserInfoModel from "@util/db/mongoose/user_info";

export async function GET(req: Request) {
	try {
		const { user_id } = await jwt_verify(req);

		await db();

		const checkUser = await UserInfoModel.findOne(
			{ _id: user_id, status: 1 },
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
			msg: "登录已失效，请重新登录",
		});
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

		param.onlyname = param.username;

		const onlyname = "@" + param.onlyname;

		await db();

		const checkUser = await UserInfoModel.findOne({ onlyname });

		if (checkUser) {
			return NextResponse.json({
				code: 400,
				msg: "已有账号注册",
			});
		}

		await UserInfoModel.create({
			...param,
			onlyname,
		});

		const { _id } = await UserInfoModel.findOne({ onlyname });

		return NextResponse.json({
			code: 200,
			msg: "注册成功",
			token: jwt_sign({ user_id: _id }),
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
		const param = await req.json();

		const { user_id } = await jwt_verify(req);

		await db();

		await UserInfoModel.updateOne(
			{
				_id: user_id,
			},
			param,
			{ runValidators: true }
		);

		return NextResponse.json({
			code: 200,
			msg: "修改成功",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}

export async function DELETE(req: Request) {
	try {
		const { user_id } = await jwt_verify(req);

		await db();

		await UserInfoModel.updateOne(
			{
				_id: user_id,
			},
			{
				status: 0,
			}
		);

		return NextResponse.json({
			code: 200,
			msg: "注销成功",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
