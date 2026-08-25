import { useEffect, useRef, type ReactNode } from "react";
import {
	bearTargetsAt,
	sortWaypoints,
	type BearActionId,
	type BearWaypoint,
} from "./bearTimeline";
import styles from "./styles.module.css";

/** ベアの表示スケール(1 単位 = このピクセル数)。全高はおよそ 2 単位。 */
const BEAR_SCALE = 96;

/** ベアの足がとどまろうとする、ビューポート高に対する位置。 */
const ANCHOR_VIEWPORT_FRAC = 0.66;

/** 歩行サイクルの歩幅(移動ピクセル → 位相ラジアン換算)。 */
const STRIDE_PX = 15;

/** クリックへの歓喜リアクションの長さ(ミリ秒)。 */
const CHEER_MS = 1100;

const ACTIONS: readonly BearActionId[] = [
	"hold",
	"idle",
	"sit",
	"hello",
	"bow",
	"sleep",
	"walk",
];

/** data-bear-waypoint 属性を持つ要素から、文書座標のウェイポイントを計測します。 */
function measureWaypoints(): BearWaypoint[] {
	const elements = Array.from(
		document.querySelectorAll<HTMLElement>("[data-bear-waypoint]"),
	);
	const scrollY = window.scrollY;
	const waypoints: BearWaypoint[] = [];
	for (const el of elements) {
		const action = el.dataset.bearWaypoint as BearWaypoint["action"] | undefined;
		if (!action) continue;
		const rect = el.getBoundingClientRect();
		const dy = Number.parseFloat(el.dataset.bearDy ?? "0");
		const xFrac = Number.parseFloat(el.dataset.bearX ?? "0.5");
		waypoints.push({
			id: el.dataset.bearId ?? action,
			docY: rect.top + scrollY + rect.height * dy,
			xFrac,
			action,
		});
	}
	return sortWaypoints(waypoints);
}

/**
 * スクロールに連動してページを旅するブランドベアの 3D レイヤーです。
 * three.js は動的 import で読み込み、初期バンドルには含めません。
 * reduced-motion・狭い画面・WebGL 不可の環境では何も描画しません。
 */
export default function BearScene(): ReactNode {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (window.matchMedia("(max-width: 996px)").matches) return;
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

			let renderer: import("three").WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({
					alpha: true,
					antialias: true,
					powerPreference: "low-power",
				});
			} catch {
				return; // WebGL が使えない環境では静かに諦める
			}
			renderer.setClearColor(0x000000, 0);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
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

			const rig = buildBear();
			rig.root.scale.setScalar(BEAR_SCALE);
			scene.add(rig.root);

			let width = 0;
			let height = 0;
			const resize = (): void => {
				width = window.innerWidth;
				height = window.innerHeight;
				renderer.setSize(width, height);
				camera.left = -width / 2;
				camera.right = width / 2;
				camera.top = height / 2;
				camera.bottom = -height / 2;
				camera.updateProjectionMatrix();
			};
			resize();

			let waypoints = measureWaypoints();
			let remeasureQueued = false;
			const queueRemeasure = (): void => {
				if (remeasureQueued) return;
				remeasureQueued = true;
				window.setTimeout(() => {
					remeasureQueued = false;
					waypoints = measureWaypoints();
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
			let curX = width / 2;
			let curDocY = window.scrollY + height * ANCHOR_VIEWPORT_FRAC;
			let yaw = 0;
			let yawTarget = 0;
			let walkPhase = 0;
			let prevX = curX;
			let prevDocY = curDocY;
			let lastTime = performance.now();
			let frame = 0;
			let cheerStartedAt = -Infinity;

			const loop = (now: number): void => {
				frame = requestAnimationFrame(loop);
				const dt = Math.min(0.1, (now - lastTime) / 1000);
				lastTime = now;
				const t = now / 1000;

				const anchor = window.scrollY + height * ANCHOR_VIEWPORT_FRAC;
				const target = bearTargetsAt(anchor, waypoints);

				const margin = BEAR_SCALE * 1.1;
				const targetX = Math.min(
					width - margin,
					Math.max(margin, target.xFrac * width),
				);
				curX = THREE.MathUtils.damp(curX, targetX, 4, dt);
				curDocY = THREE.MathUtils.damp(curDocY, target.docY, 4, dt);

				// アクションの重みを目標へ減衰追従させる
				for (const action of ACTIONS) {
					const goal = action === target.action ? 1 : 0;
					weights[action] = THREE.MathUtils.damp(weights[action], goal, 6, dt);
				}

				// 歩行位相は実際の移動量から積算する(速く動くほど速く歩く)
				const moved =
					Math.abs(curX - prevX) + Math.abs(curDocY - prevDocY);
				walkPhase += (moved / STRIDE_PX) * weights.walk;
				prevX = curX;
				prevDocY = curDocY;

				// 向き: 歩行中は進行方向へ、それ以外は正面へ。
				if (target.action === "walk" && target.facing !== 0) {
					yawTarget = target.facing * 0.7;
				} else if (weights.walk < 0.4) {
					yawTarget = 0;
				}
				yaw = THREE.MathUtils.damp(yaw, yawTarget, 4, dt);

				const cheerElapsed = now - cheerStartedAt;
				const cheer =
					cheerElapsed >= 0 && cheerElapsed < CHEER_MS ? cheerElapsed / CHEER_MS : 0;

				applyBearPose(rig, { time: t, weights, walkPhase, yaw, cheer });

				const feetScreenY = curDocY - window.scrollY;
				rig.root.position.set(curX - width / 2, height / 2 - feetScreenY, 0);


				// 画面から大きく外れている間は描画を省く(状態の追従だけ続ける)
				if (feetScreenY > -120 && feetScreenY < height + BEAR_SCALE * 2.4) {
					renderer.render(scene, camera);
				}
			};
			frame = requestAnimationFrame(loop);

			// ベアは背面レイヤーで pointer-events を持たないため、クリックは
			// document 側で拾い、ベアの画面上の矩形に当たったときだけ反応する。
			// リンクやボタンなど操作対象へのクリックには反応しない。
			const onClick = (event: MouseEvent): void => {
				const target = event.target;
				if (
					target instanceof Element &&
					target.closest("a, button, input, textarea, select, summary, [role=button]")
				) {
					return;
				}
				const feetY = curDocY - window.scrollY;
				const halfWidth = BEAR_SCALE * 0.75;
				const bearHeight = BEAR_SCALE * 1.85;
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
