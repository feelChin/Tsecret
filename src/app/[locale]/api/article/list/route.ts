import { NextResponse } from "next/server";
import db from "@util/db";
import { jwt_verify } from "@util/db/jwt";
import ArticleListModel from "@util/db/mongoose/article_list";
import ArticleLikeModel from "@util/db/mongoose/article_like";
import UserInfoModel from "@util/db/mongoose/user_info";
import { base_total, shuffleArray } from "@util/db/util";
import { PipelineStage } from "mongoose";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		const id = searchParams.get("id") || 0;
		const search = searchParams.get("search") || null;
		const user_id = searchParams.get("user_id") || null;
		const user_like = Boolean(searchParams.get("user_like")) || false;
		const searchType = Number(searchParams.get("searchType")) || 0;
		const sort = Number(searchParams.get("sort")) || 0;

		await db();

		const base_pipeline = [
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
					onlyname: "$get_user.onlyname",
					vip: "$get_user.vip",
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
				$unwind: "$vip",
			},
			{
				$project: {
					updatedAt: 0,
					__v: 0,
					get_user: 0,
				},
			},
		];

		const verifyLike = async (data: any[]) => {
			const token = req.headers.get("token") as string;

			if (token) {
				const { user_id } = await jwt_verify(req);

				const articleIds = data.map((item) => item._id);

				const likeList = await ArticleLikeModel.find({
					user_id,
					article_id: { $in: articleIds },
				});

				const nowlikeList = likeList.map((item) => item.article_id);

				data.forEach((item) => {
					if (nowlikeList.includes(String(item._id))) {
						item.isLike = true;
					}
				});
			}
		};

		if (user_like) {
			const res = await ArticleLikeModel.find({
				user_id,
			});

			const article_id = res.map((item) => item.article_id);

			const pipeline: PipelineStage[] = [
				{ $addFields: { article_id: { $toString: "$_id" } } },
				{
					$match: {
						article_id: { $in: article_id },
					},
				},
				...base_pipeline,
				{ $sort: { createdAt: -1 } },
				base_total(req),
			];

			const [item] = await ArticleListModel.aggregate(pipeline);

			const { metadata, data } = item;

			await verifyLike(data);

			return NextResponse.json({
				code: 200,
				data,
				total: metadata[0]?.total,
			});
		}

		if (user_id) {
			const pipeline: PipelineStage[] = [
				{
					$match: {
						user_id: user_id,
					},
				},
				...base_pipeline,
				{ $sort: { createdAt: -1 } },
				base_total(req),
			];

			const [item] = await ArticleListModel.aggregate(pipeline);

			const { metadata, data } = item;

			await verifyLike(data);

			return NextResponse.json({
				code: 200,
				data,
				total: metadata[0]?.total,
			});
		}

		if (search) {
			let pipeline: PipelineStage[];
			let pipeResult = [];

			if (searchType == 2) {
				pipeline = [
					{ $sort: sort ? { fans: -1 } : { createdAt: -1 } },
					{
						$match: {
							$or: [
								{
									username: {
										$regex: search,
										$options: "i",
									},
								},
								{
									onlyname: {
										$regex: search,
										$options: "i",
									},
								},
							],
						},
					},
					{
						$project: {
							sex: 0,
							age: 0,
							password: 0,
							__v: 0,
							createdAt: 0,
							updatedAt: 0,
							follows: 0,
						},
					},
					base_total(req),
				];

				pipeResult = await UserInfoModel.aggregate(pipeline);
			} else {
				let matchOR = [];
				if (searchType == 0) {
					matchOR = [
						{
							"get_user.username": {
								$regex: search,
								$options: "i",
							},
						},
						{
							"get_user.onlyname": {
								$regex: search,
								$options: "i",
							},
						},
					];
				} else {
					matchOR = [
						{
							content: {
								$regex: search,
								$options: "i",
							},
						},
					];
				}

				pipeline = [
					...base_pipeline,
					{ $sort: sort ? { see: -1 } : { createdAt: -1 } },
					{
						$match: {
							$or: matchOR,
						},
					},
					base_total(req),
				];

				pipeResult = await ArticleListModel.aggregate(pipeline);
			}

			const [item] = pipeResult;

			const { metadata, data } = item;

			await verifyLike(data);

			return NextResponse.json({
				code: 200,
				data,
				total: metadata[0]?.total,
			});
		}

		if (id) {
			// 根据id查询 其余信息
			const data = await ArticleListModel.findOne({
				_id: String(id),
			});
			data.see += 1;

			await data.save();

			const token = req.headers.get("token") as string;

			let isLike;

			if (token) {
				const { user_id } = await jwt_verify(req);

				isLike = await ArticleLikeModel.findOne({
					user_id,
					article_id: id,
				});
			}

			return NextResponse.json({
				code: 200,
				data: {
					comment: data.comment,
					like: data.like,
					share: data.share,
					isLike: Boolean(isLike),
				},
			});
		}

		// 查询倒序实时
		const pipeline: PipelineStage[] = [
			...base_pipeline,
			{
				$addFields: {
					create_day: {
						$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
					},
				},
			},
			{ $sort: { create_day: -1, see: -1 } },
			base_total(req),
		];

		const [item] = await ArticleListModel.aggregate(pipeline);
		const { metadata, data } = item;

		await verifyLike(data);

		return NextResponse.json({
			code: 200,
			data: shuffleArray(data),
			total: metadata[0]?.total,
		});
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
