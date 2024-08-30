"use client";

import store from "@util/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import style from "./index.module.scss";

const WithCustomLoading = dynamic(() => import("@component/mySetting"), {
	ssr: false,
});

function Index({
	isBack = true,
	isBackCall,
}: {
	isBack?: boolean;
	isBackCall?: () => void;
}) {
	const router = useRouter();
	const { userInfo, updateUser } = store();

	const [visable, setVisable] = useState<boolean>(false);

	return (
		<>
			{isBack ? (
				<i
					onClick={() => {
						isBackCall ? isBackCall() : router.back();
					}}
					className={`${style.arrow} iconfont wb-jiantou`}
				></i>
			) : (
				<>
					<figure
						className={style.avatar}
						onClick={() => {
							setVisable(true);
						}}
					>
						{userInfo.avatar ? (
							<Image width={60} height={60} src={userInfo.avatar} alt="" />
						) : (
							<div className={style.text}>Sign.</div>
						)}
					</figure>
					<WithCustomLoading
						show={visable}
						cancel={() => {
							setVisable(false);
						}}
					/>
				</>
			)}
		</>
	);
}

export default Index;
