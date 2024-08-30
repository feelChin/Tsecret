"use client";

import store, { inter_userInfo } from "@util/store";
import Http from "@util/fetch";
import { getCookieData } from "@util/cookie";
import Message from "@component/message";
import { useEffect } from "react";

function Index() {
	const { userInfo, changeTheme, updateUser } = store();

	async function queryUserInfo(token: string) {
		try {
			const { data } = (await Http(`/[locale]/api/user/info`, {
				method: "get",
				headers: {
					token: token,
				},
			})) as { data: inter_userInfo };

			updateUser({
				...data,
				token,
			});
		} catch (err) {
			Message.error(err);
		}
	}

	useEffect(() => {
		const token = getCookieData("token");
		if (token && !userInfo.id) {
			queryUserInfo(token);
		}

		const cache_theme = getCookieData("theme");

		if (cache_theme && cache_theme !== "light") {
			changeTheme("dark");
		}
	}, [userInfo]);

	return <></>;
}

export default Index;
