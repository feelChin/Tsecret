import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";

interface inter_param {
	text: any;
	key: string;
	type: string;
}

let add: (v: inter_param) => void = () => {},
	element: undefined | HTMLElement,
	reactFiber,
	maxCount = 3,
	timeout = 3000;

const _seed = () => {
	const time = Date.now();
	return time + (Math.random() * time).toFixed();
};

const _init = () => {
	return new Promise((resolve) => {
		if (!element) {
			element = document.createElement("div");
			element.className = "customMessage";
			element.style.setProperty("--time", timeout / 1000 - 0.5 + "s");
			document.body.appendChild(element);
			reactFiber = ReactDOM.createRoot(element);

			reactFiber.render(<RenderMessage resolve={resolve} />);
		} else {
			resolve(null);
		}
	});
};

function RenderMessage({ resolve }: { resolve: any }) {
	const [notices, setNotices] = useState<inter_param[]>([]);

	function remove({ key }: inter_param) {
		setNotices((prevNotices) =>
			prevNotices.filter(({ key: itemKey }) => key !== itemKey)
		);
	}

	add = (notice) => {
		setNotices((prevNotices) => [...prevNotices, notice]);

		setTimeout(() => {
			remove(notice);
		}, timeout);
	};

	useEffect(() => {
		resolve(null);

		if (notices.length > maxCount) {
			const [firstNotice] = notices;

			remove(firstNotice);
		}
	}, [notices]);

	return (
		<>
			{notices.map((item: inter_param, index) => (
				<MessageChild {...item} key={index as any} />
			))}
		</>
	);
}

function MessageChild({ text, type }: inter_param) {
	return (
		<div className="message">
			<div
				className={`iconfont ${type} ${
					type == "success" ? "wb-chenggong" : "wb-shibai"
				}`}
			></div>
			<div className="text">{String(text)}</div>
		</div>
	);
}

export default {
	success: async (text: any) => {
		await _init();

		add({
			text,
			key: _seed(),
			type: "success",
		});
	},
	error: async (text: any) => {
		await _init();

		add({
			text,
			key: _seed(),
			type: "error",
		});
	},
};
