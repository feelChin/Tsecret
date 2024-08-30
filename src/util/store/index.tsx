"use client";

import { getCookieData } from "@util/cookie";
import React, { useState, useContext, createContext, ReactNode } from "react";

type type_update = (v: inter_userInfo, cb?: () => void) => void;
type type_remove = () => void;
type type_setTheme = (v: type_theme) => void;
type type_theme = "light" | "dark";

interface inter_context {
	theme: type_theme;
	changeTheme: type_setTheme;
	userInfo: inter_userInfo;
	updateUser: type_update;
	removeUser: type_remove;
	reloadUserInfo: type_remove;
}

export interface inter_userInfo {
	id?: string;
	username?: string;
	onlyname?: string;
	avatar?: string;
	banner?: string;
	createdAt?: string;
	follows?: number;
	fans?: number;
	vip?: string;
	sex?: number;
	age?: number;
	describe?: string;
	token?: string | null;
}

export let myToken = () => {
	return getCookieData("token");
};

const RootContext = createContext<inter_context>({
	theme: "light",
	changeTheme: () => {},
	userInfo: {},
	updateUser: () => {},
	removeUser: () => {},
	reloadUserInfo: () => {},
});

export const RootProvider = ({ children }: { children: ReactNode }) => {
	const [userInfo, setUserInfo] = useState<inter_userInfo>({});
	const [theme, setTheme] = useState<type_theme>("light");

	const update_userInfo: type_update = (val, cb) => {
		setUserInfo({
			...userInfo,
			...val,
		});

		myToken = () => {
			return (val.token as string) || "";
		};

		cb && cb();
	};

	const remove_userInfo: type_remove = () => {
		setUserInfo({});
	};

	const changeTheme = (v: type_theme) => {
		document.documentElement.setAttribute("data-theme", v);
		setTheme(v);
	};

	const reload_userInfo = () => {
		const { token } = userInfo;

		setUserInfo({
			token,
		});
	};

	const value: inter_context = {
		theme,
		changeTheme,
		userInfo,
		updateUser: update_userInfo,
		reloadUserInfo: reload_userInfo,
		removeUser: remove_userInfo,
	};

	return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
};

export default function Index() {
	return useContext(RootContext);
}
