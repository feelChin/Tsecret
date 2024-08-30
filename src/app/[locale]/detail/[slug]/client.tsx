"use client";

import Loading from "@component/loading";
import { Suspense, useState } from "react";
import ArticelState from "./state";
import useLoading from "@hook/useLoading";
import Comment from "./comment";
import CommentList from "./commentList";

interface i_state {
	id: string;
	parent_id: string | null;
	visable: boolean;
}

function Index({ id }: { id: string }) {
	const { loading, setLoading } = useLoading();

	const [config, setConfig] = useState<i_state>({
		id,
		parent_id: null,
		visable: false,
	});

	function goComment(id: string, parent_id: string | null = null) {
		setConfig({
			id,
			parent_id,
			visable: true,
		});
	}

	function close(flag: boolean = false) {
		setConfig({
			...config,
			visable: false,
		});

		if (flag) {
			setLoading(false);
		}
	}

	return (
		<>
			<ArticelState
				id={id}
				goComment={(id: string, parent_id?: string | null) => {
					goComment(id, parent_id);
				}}
			/>
			<section style={{ position: "relative", minHeight: "2rem" }}>
				<Suspense fallback={<Loading />}>
					{loading ? (
						<CommentList
							id={id}
							goComment={(id: string, parent_id?: string | null) => {
								goComment(id, parent_id);
							}}
						/>
					) : (
						<Loading />
					)}
					{config.visable && (
						<Comment id={config.id} p_id={config.parent_id} close={close} />
					)}
				</Suspense>
			</section>
		</>
	);
}

export default Index;
