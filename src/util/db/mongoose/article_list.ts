import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		user_id: {
			type: String,
		},
		content: {
			type: String,
			required: [true, "请输入文章内容"],
			maxlength: [200, "文章内容长度不能大于200"],
		},
		img_list: {
			type: Array<String>,
		},
		share: {
			type: Number,
			default: 0,
		},
		like: {
			type: Number,
			default: 0,
		},
		see: {
			type: Number,
			default: 0,
		},
		comment: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

const Index =
	mongoose.models.article_list ||
	mongoose.model("article_list", schema, "article_list");

export default Index;
