import { NextResponse } from "next/server";
import { jwt_verify } from "@util/db/jwt";
import db from "@util/db";
import { PipelineStage } from "mongoose";
import { base_total } from "@util/db/util";
import UserInfoModel from "@util/db/mongoose/user_info";
import UserFriendModel from "@util/db/mongoose/friend";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const page = Number(searchParams.get("page")) || 1;

		const { user_id } = await jwt_verify(req);

		await db();

		const base_pipeline = [
			{
				$addFields: {
					the_friend: { $arrayElemAt: ["$friend_ids", 0] },
					apply_friend: { $arrayElemAt: ["$friend_ids", 1] },
				},
			},
			{ $addFields: { the_friend: { $toObjectId: "$the_friend" } } },
			{
				$match: {
					apply_friend: user_id,
					status: 0,
				},
			},
		];

		let pipeline: PipelineStage[] = [
			...base_pipeline,
			{
				$project: {
					__v: 0,
					updatedAt: 0,
					_id: 0,
					createdAt: 0,
					status: 0,
				},
			},
		];

		if (page) {
			pipeline.push(
				{
					$lookup: {
						from: "user_info",
						localField: "the_friend",
						foreignField: "_id",
						as: "get_user",
					},
				},
				{
					$project: {
						__v: 0,
						updatedAt: 0,
						_id: 0,
						createdAt: 0,
						status: 0,
						apply_friend: 0,
						friend_ids: 0,
						"get_user.password": 0,
					},
				},
				base_total(req)
			);
		}

		const findUser = await UserFriendModel.aggregate(pipeline);

		if (page) {
			const [item] = findUser;
			const { metadata, data } = item;

			const lookup = (data: any[]) => {
				return data.map((item) => {
					const { get_user } = item;
					const [user] = get_user;
					const { avatar, username, onlyname } = user;

					delete item.get_user;

					return {
						...item,
						avatar: avatar,
						username: username,
						onlyname: onlyname,
					};
				});
			};

			return NextResponse.json({
				code: 200,
				data: lookup(data),
				total: metadata[0]?.total,
			});
		}

		const getDetailFindUser = findUser.slice(0, 3).map((item) => {
			const [prev, next] = item.friend_ids;

			return prev === user_id ? next : prev;
		});

		const userArr = [];

		for (let i of [0, 1, 2]) {
			if (!getDetailFindUser[i]) break;
			const res = await UserInfoModel.findOne(
				{ _id: getDetailFindUser[i] },
				{
					password: 0,
					__v: 0,
					updatedAt: 0,
				}
			);

			const { username, avatar } = res;

			userArr.push({
				username,
				avatar,
			});
		}

		return NextResponse.json({
			code: 200,
			data: userArr,
			total: findUser.length,
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
		const { type, friend_id } = param;

		if (!friend_id) {
			throw "friend_id";
		}

		await db();

		const findUser = await UserFriendModel.findOne({
			friend_ids: [friend_id, user_id],
		});

		if (!findUser) {
			throw "没有该用户";
		}

		if (type) {
			await UserFriendModel.updateOne(
				{
					friend_ids: [friend_id, user_id],
				},
				{ status: 1 }
			);
		} else {
			await UserFriendModel.deleteOne({
				friend_ids: [friend_id, user_id],
			});
		}

		return NextResponse.json({
			code: 200,
			msg: type ? "恭喜你们成为好友了" : "已拒绝该用户",
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
		const { searchParams } = new URL(req.url);
		const friend_id = searchParams.get("friend_id");

		const { user_id } = await jwt_verify(req);

		if (!friend_id) {
			throw "friend_id";
		}

		await db();

		const findUser = await UserFriendModel.findOne({
			friend_ids: {
				$all: [user_id, friend_id],
			},
		});

		if (!findUser) {
			throw "没有该用户";
		}

		await UserFriendModel.deleteOne({
			friend_ids: {
				$all: [user_id, friend_id],
			},
		});

		return NextResponse.json({
			code: 200,
			data: [],
			msg: "删除成功",
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
