"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Pagination, Zoom } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/zoom";

import style from "./index.module.scss";

export interface i_imgListprops {
	imgList: string[];
	activeKey: number;
	visable: boolean;
	cancel?: () => void;
}

function Index({ imgList, activeKey, visable, cancel }: i_imgListprops) {
	return (
		<div className={style.mySwiperWrapper}>
			{visable && (
				<div className={style.mySwiperBg} onClick={cancel}>
					<Swiper
						pagination={{
							type: "fraction",
						}}
						zoom={true}
						spaceBetween={50}
						className={style.mySwiper}
						modules={[Pagination, Zoom]}
						onInit={(swiper) => {
							swiper.slideTo(activeKey, 0, false);
						}}
					>
						{imgList.map((item) => {
							return (
								<SwiperSlide className={style.slide} key={item}>
									<div className={`${style.swiperImg} swiper-zoom-container`}>
										<Image
											onClick={(e) => {
												e.stopPropagation();
											}}
											src={item}
											width={375}
											height={375}
											alt=""
										/>
									</div>
								</SwiperSlide>
							);
						})}
					</Swiper>
				</div>
			)}
		</div>
	);
}

export default Index;
