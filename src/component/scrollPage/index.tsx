"use client";

import { cancelHttp } from "@util/fetch";
import { inter_param } from "@type/index";
import Loading from "@component/loading";
import NoMsg from "@component/noMsg";
import NoMoreMsg from "@component/noMoreMsg";
import { useRef, useEffect, useState, ReactNode } from "react";

export interface i_scroll {
	total: number;
	loading: boolean;
	data: any[];
}

interface inter_props extends i_scroll {
	children: ReactNode;
	request: (v: inter_param) => void;
}

function Index({ children, total, data, loading, request }: inter_props) {
	const ob = useRef<any | null>(null);
	const observerRef = useRef<HTMLDivElement | null>(null);

	const [param, setParam] = useState<inter_param>({
		page: 1,
		page_size: 10,
	});

	useEffect(() => {
		request(param);

		return () => {
			cancelHttp();
		};
	}, [param]);

	useEffect(() => {
		if (!data.length) return;

		ob.current = new IntersectionObserver((entries) => {
			const { isIntersecting } = entries[0];

			if (isIntersecting) {
				ob.current.disconnect();

				const { page, page_size } = param;

				if (page * page_size >= total) return;

				setParam({
					page: page + 1,
					page_size: 10,
				});
			}
		});

		ob.current.observe(observerRef.current);
		return () => {
			ob.current?.disconnect();
		};
	}, [data]);

	return (
		<>
			{children}
			{data.length > 0 && (
				<div
					ref={observerRef}
					style={{
						transform: `translateY(-1rem)`,
					}}
				></div>
			)}

			{loading ? (
				<>
					{param.page * param.page_size >= total && data.length !== total ? (
						<div
							style={{
								position: "relative",
								height: "1rem",
							}}
						>
							<Loading />
						</div>
					) : (
						""
					)}
					{data.length == total && <NoMoreMsg />}
					{data.length === 0 && <NoMsg />}
				</>
			) : (
				<Loading />
			)}
		</>
	);
}

export default Index;
