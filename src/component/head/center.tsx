"use client";

import store from "@util/store";
import Logo from "@component/logo";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import style from "./index.module.scss";

function Index({
	centerType = "default",
	centerName = "",
	centerCall = (v: string) => {},
}) {
	const {
		userInfo: { avatar },
	} = store();

	const router = useRouter();

	const inputRef = useRef<HTMLInputElement | null>(null);

	const [visable, setVisable] = useState<boolean>(false);
	const [value, setValue] = useState("");

	useEffect(() => {
		if (visable) {
			inputRef.current?.focus();
		} else {
			setValue("");
		}
	}, [visable]);

	return (
		<div className={style.logo}>
			{centerType === "default" ? (
				<Logo width={30} />
			) : centerType === "search" ? (
				<>
					<section
						className={`${style.searchWrapper} ${visable ? style.active : ""}`}
						onClick={() => {
							setVisable(true);
						}}
					>
						<div className={style.search}>
							<i className="iconfont wb-sousuo"></i>
							<input
								value={value}
								onChange={(e) => {
									const target = e.target as HTMLInputElement;
									setValue(target.value);
								}}
								onKeyDown={(e) => {
									if (e.keyCode === 13) {
										centerCall(value);
									}
								}}
								ref={inputRef}
								type="text"
								placeholder="搜索 Tsecret"
							/>
						</div>
						{visable && (
							<span
								onClick={(e) => {
									e.stopPropagation();

									setVisable(false);
								}}
							>
								取消
							</span>
						)}
					</section>
				</>
			) : (
				centerName
			)}
		</div>
	);
}

export default Index;
