import mongoose from "mongoose";
import md5 from "@util/db/md5";
import { roll, avatarPool } from "@util/db/util";
import dayjs from "dayjs";

const schema = new mongoose.Schema(
	{
		onlyname: {
			type: String,
			required: [true, "请输入用户名"],
			maxlength: [18, "用户名长度不能大于18"],
		},
		password: {
			type: String,
			required: [true, "请输入密码"],
			maxlength: [8, "密码长度不能大于8"],
		},
		username: {
			type: String,
			required: [true, "请输入用户名"],
			maxlength: [18, "用户名长度不能大于18"],
		},
		status: {
			type: Number,
			default: 1,
		},
		sex: {
			type: Number,
			default: 0,
		},
		age: {
			type: Number,
			min: [0, "年龄不能小于0岁"],
			max: [100, "年龄不能大于100岁"],
			default: 18,
		},
		avatar: {
			type: String,
		},
		banner: {
			type: String,
			default: "/img/banner/0.jpg",
		},
		describe: {
			type: String,
			default: "",
		},
		vip: {
			type: String,
			default: dayjs(new Date("2000-01-01")).format("YYYY-MM-DD HH:mm:ss"),
		},
		follows: {
			type: Number,
			default: 0,
		},
		fans: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

schema.pre("save", function (next) {
	const { onlyname, password } = this;
	const pwd = md5(password);

	this.username = onlyname.split("@")[1];
	this.password = pwd;

	this.avatar = roll(avatarPool);

	next();
});

// 会自动更改为复数 如user_infos 第三个参数是重命名
const Index =
	mongoose.models.user_info || mongoose.model("user_info", schema, "user_info");

export default Index;
