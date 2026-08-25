import { useEffect, type RefObject } from "react";

/**
 * 信号アニメーション(データの流れ図)の稼働制御。
 * - ビューポートに入っている間だけ data-live を立て、CSS アニメーションを回す
 *   (画面外では止める)
 * - prefers-reduced-motion では一切立てず、静的な図として成立させる
 * - ベアが指定のウェイポイントへ到着したら、周期をリセットして
 *   「到着と同時に一巡が始まる」控えめな連携を作る
 */
export function useSignalLive(
	ref: RefObject<HTMLElement | null>,
	bearWaypointId?: string,
): void {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.setAttribute("data-live", "");
					} else {
						entry.target.removeAttribute("data-live");
					}
				}
			},
			{ rootMargin: "80px 0px" },
		);
		observer.observe(el);

		// アニメーションの時計を初期化して、一巡を頭から再生する。
		const restart = (): void => {
			if (!el.hasAttribute("data-live")) return;
			el.removeAttribute("data-live");
			// 強制リフローでアニメーションのリセットを確定させる。
			void el.offsetWidth;
			el.setAttribute("data-live", "");
		};

		const onBearWaypoint = (event: Event): void => {
			const id = (event as CustomEvent<{ id?: string }>).detail?.id;
			if (bearWaypointId !== undefined && id === bearWaypointId) restart();
		};
		if (bearWaypointId !== undefined) {
			document.addEventListener("cc-bear-waypoint", onBearWaypoint);
		}

		return () => {
			observer.disconnect();
			if (bearWaypointId !== undefined) {
				document.removeEventListener("cc-bear-waypoint", onBearWaypoint);
			}
		};
	}, [ref, bearWaypointId]);
}
