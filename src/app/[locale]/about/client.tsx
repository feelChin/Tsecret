"use client";

import Head from "@component/head";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Http from "@util/fetch";
import store from "@util/store";
import Image from "next/image";
import Button from "@component/button";
import style from "./page.module.scss";
import dayjs from "dayjs";
import Message from "@component/message";

interface i_props {
	end: (param: {}) => void;
}

interface i_file {
	file: File | null;
	src: string;
}

function Index() {
	const t = useTranslations("about");

	const [visable, setVisable] = useState<boolean>(false);
	const [item, setItem] = useState<string>("");

	const {
		userInfo: { avatar, banner, username, onlyname, sex, age, vip, describe },
		reloadUserInfo,
	} = store();

	async function end(param: {}) {
		await Http(
			`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/info`,
			{
				method: "put",
			},
			param
		);

		Message.success("修改成功");

		setVisable(false);
		reloadUserInfo();
	}

	function renderItem(key: string) {
		let item;

		switch (key) {
			case t("头像"):
				item = <EditAvatar end={end} />;
				break;
			case t("背景"):
				item = <EditBanner end={end} />;
				break;
			case t("名字"):
				item = <EditUsername end={end} />;
				break;
			case t("签名"):
				item = <EditDescribe end={end} />;
				break;
			case t("性别"):
				item = <EditSex end={end} />;
				break;
			case t("年龄"):
				item = <EditAge end={end} />;
				break;
			case t("会员"):
				item = <EditVip end={end} />;
				break;
		}

		return (
			<>
				<Head
					isBackCall={() => {
						setVisable(false);
					}}
					centerType={"custom"}
					centerName={key}
				/>
				{item}
			</>
		);
	}

	const config = [
		{
			name: t("头像"),
			el: (
				<figure>
					{avatar && <Image src={avatar} width={100} height={100} alt="" />}
				</figure>
			),
		},
		{
			name: t("背景"),
			el: (
				<figure>
					{banner && <Image src={banner} width={100} height={100} alt="" />}
				</figure>
			),
		},
		{
			name: t("名字"),
			el: <span>{username}</span>,
		},
		{
			name: t("签名"),
			el: <span>{describe}</span>,
		},
		{
			name: t("性别"),
			el: <span>{sex ? (sex === 1 ? t("男") : t("女")) : t("秘密")}</span>,
		},
		{
			name: t("年龄"),
			el: <span>{age}</span>,
		},
		{
			name: t("会员"),
			el: (
				<span
					className={`iconfont wb-renzhengyonghu ${
						dayjs(vip) > dayjs() ? style.active : style.icon
					}`}
				></span>
			),
		},
	];

	return (
		<section className={`${style.about} ${visable ? style.active : ""}`}>
			<div className={style.myInfo}>
				<Head centerType={"custom"} centerName={t("个人信息")} />
				<div className={style.item}>
					<p>Tsecret ID</p>
					<span>{onlyname}</span>
				</div>

				{config.map((item) => {
					return (
						<div
							className={style.item}
							key={item.name}
							onClick={() => {
								setItem(item.name);
								setVisable(true);
							}}
						>
							<p>{item.name}</p>
							{item.el}
							<i className="iconfont wb-jiantou"></i>
						</div>
					);
				})}
			</div>
			<div className={style.modal}>{renderItem(item)}</div>
		</section>
	);
}

function EditAvatar({ end }: i_props) {
	const t = useTranslations("about");

	const {
		userInfo: { avatar },
	} = store();

	const [fileData, setFileData] = useState<i_file>({
		file: null,
		src: "",
	});

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
		const { file, src } = fileData;

		if (src === avatar) {
			throw "请上传新的头像";
		}

		const { data } = (await Http(
			`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/upload/img`,
			{
				method: "post",
				type: "form",
			},
			{
				file,
			}
		)) as { data: string };

		await end({
			avatar: data,
		});
	}

	useEffect(() => {
		setFileData({
			file: null,
			src: avatar as string,
		});
	}, [avatar]);

	return (
		<div className={style.editAvatar}>
			<div className={style.list}>
				<div className={style.add}>
					<input
						onChange={async (e) => {
							const target = e.target as HTMLInputElement;
							const files = target.files;

							const [item] = files as FileList;

							const src = (await getBase64(item)) as string;

							setFileData({
								file: item,
								src,
							});
						}}
						type="file"
						accept="image/png, image/jpeg"
					/>
				</div>
				<figure>
					{fileData.src && (
						<Image src={fileData.src} width={100} height={100} alt="" />
					)}
				</figure>
			</div>
			<Button name={t("立即修改")} click={handleSend} />
		</div>
	);
}

function EditBanner({ end }: i_props) {
	const t = useTranslations("about");

	const {
		userInfo: { banner },
	} = store();

	const [fileData, setFileData] = useState<i_file>({
		file: null,
		src: "",
	});

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
		const { file, src } = fileData;

		if (src === banner) {
			throw "请上传新的banner";
		}

		const { data } = (await Http(
			`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/upload/img`,
			{
				method: "post",
				type: "form",
			},
			{
				file,
			}
		)) as { data: string };

		await end({
			banner: data,
		});
	}

	useEffect(() => {
		setFileData({
			file: null,
			src: banner as string,
		});
	}, [banner]);

	return (
		<div className={style.editBanner}>
			<figure>
				{fileData.src && (
					<Image src={fileData.src} width={500} height={400} alt="" />
				)}
			</figure>
			<div className={style.list}>
				<div className={style.add}>
					<input
						onChange={async (e) => {
							const target = e.target as HTMLInputElement;
							const files = target.files;

							const [item] = files as FileList;

							const src = (await getBase64(item)) as string;

							setFileData({
								file: item,
								src,
							});
						}}
						type="file"
						accept="image/png, image/jpeg"
					/>
				</div>
			</div>
			<Button name={t("立即修改")} click={handleSend} />
		</div>
	);
}

function EditUsername({ end }: i_props) {
	const t = useTranslations("about");

	const inputRef = useRef<HTMLInputElement | null>(null);

	async function handleSend() {
		await end({
			username: inputRef.current?.value,
		});
	}
	return (
		<div className={style.editUsername}>
			<input type="text" placeholder={t("请输入您的新名字")} ref={inputRef} />
			<Button name={t("立即修改")} click={handleSend} />
		</div>
	);
}

function EditDescribe({ end }: i_props) {
	const t = useTranslations("about");

	const {
		userInfo: { describe },
	} = store();

	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const [count, setCount] = useState<number>(0);

	async function handleSend() {
		if (count > 20) {
			throw t("字数超出限制");
		}
		await end({
			describe: textareaRef.current?.value,
		});
	}
	return (
		<div className={style.editDescribe}>
			<textarea
				defaultValue={describe}
				className={count > 20 ? style.none : ""}
				placeholder={t("请输入您的签名")}
				onChange={(e) => {
					const target = e.target as HTMLTextAreaElement;
					setCount(target.value.length);
				}}
				ref={textareaRef}
			/>
			<div className={style.count}>{count} / 20</div>
			<Button name={t("立即修改")} click={handleSend} />
		</div>
	);
}
function EditSex({ end }: i_props) {
	const t = useTranslations("about");

	const {
		userInfo: { sex },
	} = store();

	const [userSex, setUserSex] = useState(0);

	async function handleSend() {
		await end({
			sex: userSex,
		});
	}

	useEffect(() => {
		if (sex) {
			setUserSex(sex);
		}
	}, [sex]);
	return (
		<div className={style.editUsersex}>
			<div className={style.list}>
				<div
					className={`${style.item} ${userSex === 1 ? style.active : ""}`}
					onClick={() => {
						setUserSex(userSex === 1 ? 0 : 1);
					}}
				>
					<i className="iconfont wb-nan1"></i>
					<p>{t("男")}</p>
				</div>
				<div
					className={`${style.item} ${userSex === 2 ? style.active : ""}`}
					onClick={() => {
						setUserSex(userSex === 2 ? 0 : 2);
					}}
				>
					<i className="iconfont wb-nv1"></i>
					<p>{t("女")}</p>
				</div>
			</div>
			<Button name={t("立即修改")} click={handleSend} />
		</div>
	);
}

function EditAge({ end }: i_props) {
	const t = useTranslations("about");

	const {
		userInfo: { age },
	} = store();

	const inputRef = useRef<HTMLInputElement | null>(null);

	async function handleSend() {
		await end({
			age: inputRef.current?.value,
		});
	}
	return (
		<div className={style.editUsername}>
			{age && <input type="text" placeholder={String(age)} ref={inputRef} />}
			<Button name={t("立即修改")} click={handleSend} />
		</div>
	);
}

function EditVip({ end }: i_props) {
	const t = useTranslations("about");

	const {
		userInfo: { vip },
	} = store();

	const [count, setCount] = useState<number>(1);

	const isVip = dayjs(vip) > dayjs();

	async function handleSend() {
		await end({
			vip: dayjs(isVip ? vip : new Date())
				.add(count, "day")
				.format("YYYY-MM-DD HH:mm:ss"),
		});
	}

	return (
		<div className={style.editVip}>
			<p>
				{vip && (
					<>{isVip ? t("您的会员有效期至") + vip : t("暂未获得会员权限")}</>
				)}
			</p>
			<div className={style.list}>
				{[1, 3, 5, 7].map((item) => {
					return (
						<div
							className={`${style.item} ${count === item ? style.active : ""}`}
							key={item}
							onClick={() => {
								setCount(item);
							}}
						>
							<i className={`iconfont wb-renzhengyonghu`}></i>
							<h5>
								{item} <span> {t("天")}</span>
							</h5>
						</div>
					);
				})}
			</div>
			<Button name={t("充值")} click={handleSend} />
		</div>
	);
}

export default Index;
