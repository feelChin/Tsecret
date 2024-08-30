import { NextResponse } from "next/server";
import db from "@util/db";
import { jwt_sign } from "@util/db/jwt";
import md5 from "@util/db/md5";
import UserInfoModel from "@util/db/mongoose/user_info";

export async function POST(req: Request) {
	try {
		const param = await req.json();

		const { username, password } = param;

		// 连接数据库
		await db();

		const checkUser = await UserInfoModel.findOne({ username });

		if (checkUser) {
			if (!checkUser.status) {
				return NextResponse.json({
					code: 400,
					msg: "登录失败，该用户已注销",
				});
			}

			const pwd = md5(password);

			if (checkUser.password === pwd) {
				return NextResponse.json({
					code: 200,
					msg: "登录成功",
					token: jwt_sign({ user_id: checkUser._id }),
				});
			}

			return NextResponse.json({
				code: 400,
				msg: "登录失败，密码错误",
			});
		} else {
			return NextResponse.json({
				code: 400,
				msg: "登录失败，该用户未注册",
			});
		}
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
