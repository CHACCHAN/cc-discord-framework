import { useEffect, useRef, type ReactNode } from "react";
import {
	bearTargetsAt,
	sortWaypoints,
	type BearActionId,
	type BearWaypoint,
} from "./bearTimeline";
import styles from "./styles.module.css";

/** ベアの表示スケール(1 単位 = このピクセル数)。全高はおよそ 2 単位。 */
const BEAR_SCALE_DESKTOP = 96;
const BEAR_SCALE_MOBILE = 62;

/** モバイル判定の境界。CSS のブレークポイントと揃える。 */
const MOBILE_MAX_WIDTH = 996;

/** ベアの足がとどまろうとする、ビューポート高に対する位置。 */
const ANCHOR_VIEWPORT_FRAC = 0.66;

/** 歩行サイクルの歩幅(移動ピクセル → 位相ラジアン換算)。 */
const STRIDE_PX = 15;

/** この速度(px/秒)で歩行モーションが最大になる。 */
const WALK_SPEED_REF = 150;

/** クリックへの歓喜リアクションの長さ(ミリ秒)。 */
const CHEER_MS = 1100;

/** 一回きりのあいさつ系アクションを続ける時間(ミリ秒)。以降は idle に戻る。 */
const ONE_SHOT_MS = 4800;

/** 滞在後も idle に戻さず、そのまま続ける姿勢。 */
const SUSTAINED = new Set<BearActionId>(["sit", "sleep", "hold", "peer", "idle"]);

const ACTIONS: readonly BearActionId[] = [
	"hold",
	"idle",
	"sit",
	"hello",
	"bow",
	"peer",
	"sleep",
	"walk",
];

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * data-bear-waypoint 属性を持つ要素から、文書座標のウェイポイントを計測します。
 * モバイル(996px 以下)では -sm 系の属性で上書きできます:
 *   - data-bear-x-sm: 立ち位置(ビューポート幅に対する割合)
 *   - data-bear-dy-sm: 要素上端からの縦位置。モバイルのセクション高は
 *     ばらつくため、要素高ではなくビューポート高に対する割合で解釈する
 *     (負の値も可 — 上端より上に立たせるときに使う)
 *   - data-bear-dwell-sm: 滞在半径の上書き(0 で通過点)
 */
function measureWaypoints(isMobile: boolean): BearWaypoint[] {
	const elements = Array.from(
		document.querySelectorAll<HTMLElement>("[data-bear-waypoint]"),
	);
	const scrollY = window.scrollY;
	const viewportH = window.innerHeight;
	const waypoints: BearWaypoint[] = [];
	for (const el of elements) {
		const action = el.dataset.bearWaypoint as BearWaypoint["action"] | undefined;
		if (!action) continue;
		const rect = el.getBoundingClientRect();
		const parse = (raw: string | undefined): number | null => {
			const value = Number.parseFloat(raw ?? "");
			return Number.isFinite(value) ? value : null;
		};
		const dyBase = parse(el.dataset.bearDy) ?? 0;
		const dySm = parse(el.dataset.bearDySm);
		const docY =
			isMobile && dySm !== null
				? rect.top + scrollY + dySm * viewportH
				: rect.top + scrollY + rect.height * dyBase;
		const xFrac =
			(isMobile ? parse(el.dataset.bearXSm) : null) ??
			parse(el.dataset.bearX) ??
			0.5;
		const dwell =
			(isMobile ? parse(el.dataset.bearDwellSm) : null) ??
			parse(el.dataset.bearDwell);
		const faceRaw = parse(el.dataset.bearFace);
		waypoints.push({
			id: el.dataset.bearId ?? action,
			docY,
			xFrac,
			action,
			...(dwell !== null ? { dwellPx: dwell } : {}),
			...(faceRaw === 1 || faceRaw === -1 ? { face: faceRaw } : {}),
		});
	}
	return sortWaypoints(waypoints);
}

/**
 * スクロールに連動してページを旅するブランドベアの 3D レイヤーです。
 * three.js は動的 import で読み込み、初期バンドルには含めません。
 * reduced-motion・WebGL 不可・省データ回線では何も描画しません。
 * モバイルでは解像度とスケールを落として描画コストを抑えます。
 */
export default function BearScene(): ReactNode {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		// 省データモードの回線では 3D レイヤーごと諦める。
		const connection = (
			navigator as Navigator & { connection?: { saveData?: boolean } }
		).connection;
		if (connection?.saveData) return;

		let disposed = false;
		let cleanup = (): void => {};

		void (async () => {
			const [THREE, { buildBear, applyBearPose }] = await Promise.all([
				import("three"),
				import("./bearModel"),
			]);
			if (disposed) return;

			let isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;

			let renderer: import("three").WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({
					alpha: true,
					antialias: !isMobile,
					powerPreference: "low-power",
				});
			} catch {
				return; // WebGL が使えない環境では静かに諦める
			}
			renderer.setClearColor(0x000000, 0);
			host.appendChild(renderer.domElement);

			const scene = new THREE.Scene();
			const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -500, 500);
			camera.position.z = 100;

			// 温かい環境光 + 右上からのアンバーのキーライト + 背面のリムライト。
			scene.add(new THREE.HemisphereLight(0xfff2e0, 0x3a2414, 1.15));
			const key = new THREE.DirectionalLight(0xffc890, 1.25);
			key.position.set(2, 4, 3);
			scene.add(key);
			const rim = new THREE.DirectionalLight(0xff9a50, 0.6);
			rim.position.set(-3, 2, -2);
			scene.add(rim);

			// ダークモードでは深煎りの毛色が背景に沈むため、輪郭が立つよう
			// リムライトとキーライトを持ち上げる。テーマ切替に追従する。
			const applyThemeLights = (): void => {
				const dark = document.documentElement.dataset.theme === "dark";
				rim.intensity = dark ? 1.2 : 0.6;
				key.intensity = dark ? 1.5 : 1.25;
			};
			applyThemeLights();
			const themeObserver = new MutationObserver(applyThemeLights);
			themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["data-theme"],
			});

			const rig = buildBear();
			scene.add(rig.root);

			let bearScale = 0;
			let width = 0;
			let height = 0;
			const resize = (): void => {
				width = window.innerWidth;
				height = window.innerHeight;
				isMobile = width <= MOBILE_MAX_WIDTH;
				bearScale = isMobile ? BEAR_SCALE_MOBILE : BEAR_SCALE_DESKTOP;
				rig.root.scale.setScalar(bearScale);
				renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.75));
				renderer.setSize(width, height);
				camera.left = -width / 2;
				camera.right = width / 2;
				camera.top = height / 2;
				camera.bottom = -height / 2;
				camera.updateProjectionMatrix();
			};
			resize();

			let waypoints = measureWaypoints(isMobile);
			let remeasureQueued = false;
			const queueRemeasure = (): void => {
				if (remeasureQueued) return;
				remeasureQueued = true;
				window.setTimeout(() => {
					remeasureQueued = false;
					waypoints = measureWaypoints(isMobile);
				}, 200);
			};
			// 画像やフォントの読み込みでページ高が変わるため、body の伸縮を監視する。
			const bodyObserver = new ResizeObserver(queueRemeasure);
			bodyObserver.observe(document.body);
			const onResize = (): void => {
				resize();
				queueRemeasure();
			};
			window.addEventListener("resize", onResize);

			// 現在状態(目標へ damp で追従する)
			const weights = Object.fromEntries(
				ACTIONS.map((a) => [a, a === "idle" ? 1 : 0]),
			) as Record<BearActionId, number>;
			// 初期位置: 画面右外。最初のウェイポイントの高さへ向けて歩いて登場する。
			const firstDocY =
				waypoints[0]?.docY ?? window.scrollY + height * ANCHOR_VIEWPORT_FRAC;
			let curX = width + bearScale * 2;
			let curDocY = firstDocY;
			let yaw = 0;
			let yawTarget = 0;
			let walkPhase = 0;
			let prevX = curX;
			let prevDocY = curDocY;
			let lastTime = performance.now();
			let frame = 0;
			let cheerStartedAt = -Infinity;
			// 滞在中のウェイポイントと滞在開始時刻(あいさつ系を idle に戻すため)。
			let dwellId: string | null = null;
			let dwellStartedAt = 0;
			// スクロールが止まったときの「歩き切り」用の仮想アンカー。
			let restAnchor: number | null = null;
			let lastRawAnchor = 0;
			let anchorMovedAt = 0;

			const loop = (now: number): void => {
				frame = requestAnimationFrame(loop);
				const dt = Math.min(0.1, (now - lastTime) / 1000);
				lastTime = now;
				const t = now / 1000;

				const rawAnchor = window.scrollY + height * ANCHOR_VIEWPORT_FRAC;
				if (Math.abs(rawAnchor - lastRawAnchor) > 1) {
					lastRawAnchor = rawAnchor;
					anchorMovedAt = now;
					restAnchor = null;
				}

				// スクロールが止まったら、道の途中で固まらず最寄りの滞在圏まで
				// 歩き切る(仮想アンカーをゆっくり目的地へ進める)。
				let anchor = restAnchor ?? rawAnchor;
				let target = bearTargetsAt(anchor, waypoints);
				if (now - anchorMovedAt > 700 && target.action === "walk") {
					restAnchor = THREE.MathUtils.damp(
						anchor,
						target.restAnchorDocY,
						1.4,
						dt,
					);
					anchor = restAnchor;
					target = bearTargetsAt(anchor, waypoints);
				}

				// 滞在の開始を検出する。あいさつ系(hello / bow)は一度だけ披露して
				// idle に戻る — ループし続けるお辞儀は機械的に見えるため。
				if (target.waypointId !== dwellId) {
					dwellId = target.waypointId;
					dwellStartedAt = now;
					// 到着をページへ知らせる(信号アニメーションなどの控えめな連携用)。
					if (dwellId !== null) {
						document.dispatchEvent(
							new CustomEvent("cc-bear-waypoint", { detail: { id: dwellId } }),
						);
					}
				}
				let action = target.action;
				if (
					dwellId !== null &&
					!SUSTAINED.has(action) &&
					action !== "walk" &&
					now - dwellStartedAt > ONE_SHOT_MS
				) {
					action = "idle";
				}

				const margin = bearScale * 1.1;
				const targetX = clamp(target.xFrac * width, margin, width - margin);
				curX = THREE.MathUtils.damp(curX, targetX, 4, dt);
				curDocY = THREE.MathUtils.damp(curDocY, target.docY, 4, dt);

				// アクションの重みを目標へ減衰追従させる
				for (const a of ACTIONS) {
					const goal = a === action ? 1 : 0;
					weights[a] = THREE.MathUtils.damp(weights[a], goal, 6, dt);
				}

				// 実際の移動速度(px/秒)。タイムライン上の目標だけでなく、登場時や
				// 追いつき中も足が動くよう、歩行モーションは速度から導出する。
				const vx = (curX - prevX) / Math.max(dt, 1e-4);
				const vy = (curDocY - prevDocY) / Math.max(dt, 1e-4);
				const speed = Math.hypot(vx, vy);
				const speedWalk = clamp(speed / WALK_SPEED_REF, 0, 1);
				const walkAmount = Math.max(weights.walk, speedWalk * (1 - weights.sleep));

				// 歩行位相は実際の移動量から積算する(速く動くほど速く歩く)
				const moved = Math.abs(curX - prevX) + Math.abs(curDocY - prevDocY);
				walkPhase += (moved / STRIDE_PX) * walkAmount;
				prevX = curX;
				prevDocY = curDocY;

				// 向き: 実際に横へ動いているときは進行方向へ、滞在中はウェイポイントの
				// face へ、それ以外は正面へ戻る。
				if (Math.abs(vx) > 24) {
					yawTarget = Math.sign(vx) * 0.7;
				} else if (target.waypointId !== null) {
					yawTarget = (target.facing ?? 0) * 0.6;
				} else if (walkAmount < 0.35) {
					yawTarget = 0;
				}
				yaw = THREE.MathUtils.damp(yaw, yawTarget, 4, dt);

				const cheerElapsed = now - cheerStartedAt;
				const cheer =
					cheerElapsed >= 0 && cheerElapsed < CHEER_MS ? cheerElapsed / CHEER_MS : 0;

				applyBearPose(rig, {
					time: t,
					weights: { ...weights, walk: walkAmount },
					walkPhase,
					yaw,
					cheer,
				});

				// 進行方向への傾ぎと視線: ポーズ合成の後から少量だけ足す。
				// 速度に比例させることで、歩き出し・減速に自然な緩急が生まれる。
				const lean = clamp(vx / 900, -0.13, 0.13);
				rig.body.rotation.z += -lean * walkAmount;
				rig.head.rotation.y += clamp(vx / 700, -0.28, 0.28) * (1 - weights.sleep);

				const feetScreenY = curDocY - window.scrollY;
				rig.root.position.set(curX - width / 2, height / 2 - feetScreenY, 0);

				// モバイルには安全な歩行レーンがないため、歩行中はフェードアウトし、
				// 立ち寄り先でだけ姿を見せる(本文の可読性を最優先する)。
				let opacity = 1;
				if (isMobile) {
					opacity = Math.max(0, 1 - walkAmount * 1.6);
					const style = renderer.domElement.style;
					const next = opacity.toFixed(2);
					if (style.opacity !== next) style.opacity = next;
				} else if (renderer.domElement.style.opacity !== "") {
					renderer.domElement.style.opacity = "";
				}

				// 画面から大きく外れている・完全に透明な間は描画を省く
				if (
					opacity > 0.02 &&
					feetScreenY > -120 &&
					feetScreenY < height + bearScale * 2.4
				) {
					renderer.render(scene, camera);
				}
			};
			frame = requestAnimationFrame(loop);

			// ベアは背面レイヤーで pointer-events を持たないため、クリックは
			// document 側で拾い、ベアの画面上の矩形に当たったときだけ反応する。
			// リンクやボタンなど操作対象へのクリックには反応しない。
			const onClick = (event: MouseEvent): void => {
				const clicked = event.target;
				if (
					clicked instanceof Element &&
					clicked.closest("a, button, input, textarea, select, summary, [role=button]")
				) {
					return;
				}
				const feetY = curDocY - window.scrollY;
				const halfWidth = bearScale * 0.75;
				const bearHeight = bearScale * 1.85;
				if (
					Math.abs(event.clientX - curX) <= halfWidth &&
					event.clientY <= feetY &&
					event.clientY >= feetY - bearHeight
				) {
					cheerStartedAt = performance.now();
				}
			};
			document.addEventListener("click", onClick);

			// バックグラウンドタブではループ自体を止める
			const onVisibility = (): void => {
				if (document.hidden) {
					cancelAnimationFrame(frame);
				} else {
					lastTime = performance.now();
					frame = requestAnimationFrame(loop);
				}
			};
			document.addEventListener("visibilitychange", onVisibility);

			// コンテキストロスト時は preventDefault の上でループを止め、復帰で再開する。
			const onContextLost = (event: Event): void => {
				event.preventDefault();
				cancelAnimationFrame(frame);
			};
			const onContextRestored = (): void => {
				lastTime = performance.now();
				frame = requestAnimationFrame(loop);
			};
			renderer.domElement.addEventListener("webglcontextlost", onContextLost);
			renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

			cleanup = () => {
				cancelAnimationFrame(frame);
				document.removeEventListener("visibilitychange", onVisibility);
				document.removeEventListener("click", onClick);
				renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
				renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
				window.removeEventListener("resize", onResize);
				bodyObserver.disconnect();
				themeObserver.disconnect();
				scene.traverse((obj) => {
					if (obj instanceof THREE.Mesh) {
						obj.geometry.dispose();
						const material = obj.material;
						if (Array.isArray(material)) {
							for (const m of material) m.dispose();
						} else {
							material.dispose();
						}
					}
				});
				renderer.dispose();
				renderer.domElement.remove();
			};
		})();

		return () => {
			disposed = true;
			cleanup();
		};
	}, []);

	return (
		<div ref={hostRef} className={styles.root} data-bear-layer aria-hidden="true" />
	);
}
