"use client";

import MySwiper, { i_imgListprops } from "@component/mySwiper";
import Image from "next/image";
import { useState } from "react";
import style from "./index.module.scss";

const init_config = { imgList: [], activeKey: 0, visable: false };

function Index({ imgList }: { imgList: string[] }) {
	const [config, setConfig] = useState<i_imgListprops>(init_config);

	return (
		<>
			<MySwiper
				{...config}
				cancel={() => {
					setConfig(init_config);
				}}
			/>
			<div
				className={`${style.imgList} ${
					imgList.length == 1
						? style.little
						: imgList.length <= 4
						? style.small
						: ""
				}`}
			>
				{imgList.map((item, index) => {
					if (index > 8) return;
					return (
						<div
							className={style.imgItem}
							key={index}
							onClick={() => {
								setConfig({
									imgList,
									activeKey: index,
									visable: true,
								});
							}}
						>
							<Image src={`${item}`} width={100} height={100} alt="" />
							{index === 8 && imgList.length > 9 && (
								<>
									<div className={style.imgCount}>+{imgList.length - 9}</div>
								</>
							)}
						</div>
					);
				})}
				{imgList.length > 4 ? (
					<>
						<div className={style.imgPlace}></div>
						<div className={style.imgPlace}></div>
						<div className={style.imgPlace}></div>
					</>
				) : (
					""
				)}
			</div>
		</>
	);
}

export default Index;
