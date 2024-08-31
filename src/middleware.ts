import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

async function middleware1(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 过滤api路由
	if (pathname.indexOf("api") > -1) {
		return NextResponse.next();
	}

	const whiteList = [undefined, "login", "user", "search", "detail"]; //路由白名单

	const filterPathName = pathname.split("/")[2];

	const isWhite = whiteList.includes(filterPathName); // 判断路由是否白名单
	console.log(isWhite);
	console.log(whiteList);
	if (isWhite) {
		return NextResponse.next();
	}

	const token = request.cookies.get("token")?.value;
	console.log(request.cookies);
	if (!token) {
		throw "无权限访问";
	}
}

export default async function middleware(request: NextRequest) {
	try {
		await middleware1(request);

		const handleI18nRouting = createIntlMiddleware({
			locales: ["cn", "tw"],
			defaultLocale: "cn",
		});

		const response = handleI18nRouting(request);

		return response;
	} catch (err) {
		const { value } = request.cookies.get("NEXT_LOCALE") as {
			name: string;
			value: string;
		};

		return NextResponse.redirect(new URL(`/${value}/login`, request.url));
	}
}

export const config = {
	matcher: ["/", "/(cn|tw)/:path*"],
};
