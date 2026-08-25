import { useEffect, type ReactNode } from "react";

/**
 * JavaScript が無い場合も内容を隠さない、控えめな入場アニメーションです。
 * ライブラリは使わず、IntersectionObserver とグローバルの lp-reveal クラス
 * (custom.css)だけで実装します。
 */
export default function LandingMotion(): ReactNode {
	useEffect(() => {
		// reduced-motion 時はクラス自体を付けない(内容は最初から見える)。
		// custom.css 側の @media 上書きは、再生中に設定が切り替わった場合の保険。
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const sections = Array.from(
			document.querySelectorAll<HTMLElement>("[data-landing-section]"),
		);
		for (const section of sections) section.classList.add("lp-reveal");

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.classList.add("lp-reveal-visible");
					observer.unobserve(entry.target);
				}
			},
			{ rootMargin: "0px 0px -12%", threshold: 0.08 },
		);
		for (const section of sections) observer.observe(section);

		return () => {
			observer.disconnect();
			for (const section of sections) {
				section.classList.remove("lp-reveal", "lp-reveal-visible");
			}
		};
	}, []);

	return null;
}
