"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Http from "@util/fetch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@component/button";
import MySwiper, { i_imgListprops } from "@component/mySwiper";
import style from "./page.module.scss";

interface i_fileList {
	src: string;
	file: File;
}

const inie_config = { imgList: [], activeKey: 0, visable: false };

function Index() {
	const t = useTranslations("edit");
	const router = useRouter();

	const editRef = useRef<HTMLTextAreaElement | null>(null);

	const [value, setValue] = useState<string>("");
	const [fileList, setFileList] = useState<i_fileList[]>([]);

	const [config, setConfig] = useState<i_imgListprops>(inie_config);

	function getBase64(data: File) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(data);

			reader.addEventListener("load", () => {
				resolve(reader.result);
			});
		});
	}

	async function handleSend() {
		let arr = [];

		for (let item of fileList) {
			const { data } = (await Http(
				`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/upload/img`,
				{
					method: "post",
					type: "form",
				},
				{
					file: item.file,
				}
			)) as { data: string };

			arr.push(data);
		}

		await Http(
			`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/article`,
			{
				method: "post",
			},
			{
				content: value,
				img_list: arr,
			}
		);

		router.back();
	}

	return (
		<>
			<MySwiper
				{...config}
				cancel={() => {
					setConfig(inie_config);
				}}
			/>
			<div className="pageWrapper">
				<div className={style.scroll}>
					<div className={style.editBox}>
						<textarea
							onChange={(e) => {
								const target = e.target as HTMLTextAreaElement;

								setValue(target.value);
							}}
							maxLength={200}
							ref={editRef}
							className={style.edit}
							rows={10}
							placeholder={t("分享你现在的想法")}
						></textarea>
						<div className={style.editFont}>{value.length}/200</div>
					</div>
					<div className={style.photoBox}>
						<div className={style.photoAdd}>
							<div className={style.item}>
								<input
									onChange={async (e) => {
										const target = e.target as HTMLInputElement;
										const files = target.files;

										const fileList: i_fileList[] = [];

										if (files) {
											for (let item of files) {
												const file = (await getBase64(item)) as string;

												fileList.push({
													src: file,
													file: item,
												});
											}
										}

										setFileList((prevList) => {
											return [...prevList, ...fileList];
										});
									}}
									type="file"
									multiple={true}
									accept="image/png, image/jpeg"
								/>
							</div>
						</div>
						<div className={style.photoList}>
							<i></i>
							{fileList.map(({ src }, index) => {
								return (
									<div
										key={index}
										className={style.item}
										onClick={() => {
											setConfig({
												imgList: fileList.map((item) => item.src),
												activeKey: index,
												visable: true,
											});
										}}
									>
										<figure>
											<Image width={66} height={66} src={src} alt="" />
										</figure>
										<div
											className={style.delete}
											onClick={() => {
												const prevList = [...fileList];
												prevList.splice(index, 1);

												setFileList([...prevList]);
											}}
										></div>
									</div>
								);
							})}
							<i></i>
							<i></i>
							<i></i>
						</div>
						<Button name={t("立即发布")} click={handleSend} />
					</div>
				</div>
			</div>
		</>
	);
}

export default Index;
