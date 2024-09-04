import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();

		let file: Blob | null = null;
		for (const value of formData.values()) {
			file = value as Blob;
		}

		if (!file) {
			return NextResponse.json({
				code: 200,
				msg: "参数错误",
			});
		}

		formData.append("smfile", file);

		const res = await fetch("https://sm.ms/api/v2/upload", {
			method: "POST",
			body: formData,
			headers: {
				Authorization: "Basic tHoAONDkK3m5S4j0eenaeV3b0gR8kNX6",
			},
		});

		const result = await res.json();

		if (result.success) {
			return NextResponse.json({
				code: 200,
				data: result.data?.url,
			});
		}

		if (result.code === "image_repeated") {
			return NextResponse.json({
				code: 200,
				data: result.images,
			});
		}

		throw "上传失败，请重试";

		//	const type = file.type;
		// const name =
		// 	"/content/" +
		// 	new Date().getTime() +
		// 	"." +
		// 	(Boolean(type.indexOf("png") > -1) ? "png" : "jpg");

		// const handleFile = async () => {
		// 	try {
		// 		const arrayBuffer = await (file as Blob).arrayBuffer();
		// 		const buffer = Buffer.from(arrayBuffer);

		// 		fs.writeFileSync(`./public${name}`, buffer, "binary");
		// 	} catch (err) {
		// 		throw "上传图片错误  写入图片错误 fs.writeFileSync 不支持";
		// 	}
		// };

		// await handleFile();

		// return NextResponse.json({
		// 	code: 200,
		// 	data: name,
		// });
	} catch (err) {
		return NextResponse.json({
			code: 400,
			msg: String(err),
		});
	}
}
