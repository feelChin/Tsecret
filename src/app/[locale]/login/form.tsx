"use client";
import Http from "@util/fetch";
import { useEffect, useState } from "react";
import store from "@util/store";
import { setCookieData } from "@util/cookie";
import { useLocale, useTranslations } from "next-intl";
import Button from "@component/button";
import { useRouter } from "next/navigation";
import { removeCookieData } from "@util/cookie";
import useDebounce from "@hook/useDebounce";
import style from "./page.module.scss";

type btnStr = "login" | "register" | "reset";

interface i_props {
	name: string[];
	type: btnStr;
}

interface i_inputVal {
	[key: string]: string;
}

interface i_inputValue {
	value: string;
	name: string;
}

const nameArr = ["username", "password"];

function Index({ name, type }: i_props) {
	const t = useTranslations("login");
	const locale = useLocale();
	const router = useRouter();

	const { updateUser, removeUser } = store();

	const [seeType, setSeeType] = useState<boolean>(false);
	const [state, setState] = useState<i_inputVal>({});

	const debounce_handleInput: any = useDebounce(handleInput, 30, false);
	const debounce_handleInputBlur: any = useDebounce(
		handleInputBlur,
		100,
		false
	);

	function handleInput({ value, name }: i_inputValue) {
		setState((prevState) => {
			return { ...prevState, [name]: value };
		});
	}

	function handleInputBlur(name: string) {
		if (!state[name]) {
			setState((prevState) => {
				delete prevState[name];
				return { ...prevState };
			});
		}
	}

	async function finish() {
		const { token } = (await Http(
			`${process.env.NEXT_PUBLIC_BASE_URL}[locale]/api/user/${
				type === "login" ? "sign" : "info"
			}`,
			{
				method: "post",
			},
			state
		)) as { token: string };

		setCookieData("token", token);
		updateUser({ token });

		router.push(`/${locale}`);
	}

	useEffect(() => {
		localStorage.clear();
		removeCookieData("token");
		removeUser();
	}, []);

	return (
		<>
			{name.map((item, index) => {
				const name = nameArr[index];

				return (
					<div
						key={index}
						className={`${style.item} ${
							Object.keys(state).includes(name) ? style.active : ""
						}`}
					>
						<p>{item}</p>
						{name === "password" && state[name] && (
							<i
								onClick={() => {
									setSeeType((prevType) => !prevType);
								}}
								className={`${style.see} ${
									seeType ? style.active : ""
								} iconfont wb-chakan`}
							></i>
						)}
						<input
							onInput={(e) => {
								const target = e.target as HTMLInputElement;

								debounce_handleInput({ value: target.value, name });
							}}
							onBlur={() => {
								debounce_handleInputBlur(name);
							}}
							onFocus={() => {
								if (Object.keys(state).includes(name)) return;

								setState((prevState) => {
									return { ...prevState, [name]: "" };
								});
							}}
							type={
								name === "password" && seeType === false ? "password" : "text"
							}
						/>
					</div>
				);
			})}
			<Button
				name={type === "register" ? t("立即注册") : t("立即登录")}
				click={finish}
			/>
		</>
	);
}

export default Index;
