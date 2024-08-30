"use client";

import Head from "@component/head";
import useLoading from "@hook/useLoading";
import RenderItem from "@component/renderItem";

function Index() {
	const { loading, setLoading } = useLoading();

	return (
		<>
			<Head
				isBack={false}
				other={
					<i
						onClick={() => {
							setLoading(false);
						}}
						className={"iconfont wb-Artifact-fashu"}
					></i>
				}
			/>
			<div className="pageWrapper">{loading && <RenderItem />}</div>
		</>
	);
}

export default Index;
