import Image from "next/image";

function Index({ width = 80 }) {
	return (
		<div>
			<Image width={width} height={width} src="/logo.svg" alt="logo" />
		</div>
	);
}

export default Index;
