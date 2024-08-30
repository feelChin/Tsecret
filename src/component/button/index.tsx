"use client";

import { useState } from "react";
import Loading from "@component/loading";
import Message from "@component/message";

interface i_props {
	name: string;
	click: () => void;
}

function Index({ name, click }: i_props) {
	const [loading, setLoading] = useState(false);

	return (
		<button
			className={"menu"}
			style={{
				pointerEvents: loading ? "none" : "auto",
			}}
			onClick={async () => {
				setLoading(true);
				try {
					await click();
				} catch (err) {
					Message.error(err);
				} finally {
					setLoading(false);
				}
			}}
		>
			{loading ? <Loading type="white" /> : name}
		</button>
	);
}

export default Index;
