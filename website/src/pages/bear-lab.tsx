import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { BearActionId } from "../components/BearScene/bearTimeline";
import styles from "./bear-lab.module.css";

/** 工房で切り替えられるアクション一覧(walk は位相を時間で自走させる)。 */
const LAB_ACTIONS: readonly BearActionId[] = [
	"idle",
	"hold",
	"hello",
	"walk",
	"sit",
	"peer",
	"bow",
	"sleep",
];

interface LabHandle {
	setAction(action: BearActionId): void;
	setAutoRotate(enabled: boolean): void;
	cheer(): void;
	dispose(): void;
}

/**
 * マスコット工房。BearScene と同じモデル(bearModel.ts)を大きく表示し、
 * アクション・まばたき・輪郭線を確認しながら調整するための開発者向けページ。
 * ナビゲーションからはリンクせず、検索エンジンにも載せない。
 */
export default function BearLab(): ReactNode {
	const hostRef = useRef<HTMLDivElement>(null);
	const handleRef = useRef<LabHandle | null>(null);
	const [action, setAction] = useState<BearActionId>("idle");
	const [autoRotate, setAutoRotate] = useState(false);
	const [stats, setStats] = useState("loading…");

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		let disposed = false;

		void (async () => {
			const [THREE, { buildBear, applyBearPose }] = await Promise.all([
				import("three"),
				import("../components/BearScene/bearModel"),
			]);
			if (disposed) return;

			let renderer: import("three").WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
			} catch {
				setStats("WebGL を初期化できませんでした");
				return;
			}
			renderer.setClearColor(0x000000, 0);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			host.appendChild(renderer.domElement);

			const scene = new THREE.Scene();
			const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -500, 500);
			camera.position.z = 100;
			scene.add(new THREE.HemisphereLight(0xfff2e0, 0x3a2414, 1.15));
			const key = new THREE.DirectionalLight(0xffc890, 1.25);
			key.position.set(2, 4, 3);
			scene.add(key);
			const rim = new THREE.DirectionalLight(0xff9a50, 0.6);
			rim.position.set(-3, 2, -2);
			scene.add(rim);

			const rig = buildBear();
			scene.add(rig.root);

			const weights = Object.fromEntries(
				LAB_ACTIONS.map((a) => [a, a === "idle" ? 1 : 0]),
			) as Record<BearActionId, number>;
			let currentAction: BearActionId = "idle";
			let rotate = false;
			let yaw = 0;
			let walkPhase = 0;
			let cheerStartedAt = -Infinity;
			let lastTime = performance.now();
			let frame = 0;

			const resize = (): void => {
				const rect = host.getBoundingClientRect();
				renderer.setSize(rect.width, rect.height);
				camera.left = -rect.width / 2;
				camera.right = rect.width / 2;
				camera.top = rect.height / 2;
				camera.bottom = -rect.height / 2;
				camera.updateProjectionMatrix();
				const scale = Math.min(rect.height / 2.4, rect.width / 2.4);
				rig.root.scale.setScalar(scale);
				rig.root.position.y = -rect.height / 2 + rect.height * 0.12;
			};
			resize();
			const observer = new ResizeObserver(resize);
			observer.observe(host);

			const loop = (now: number): void => {
				frame = requestAnimationFrame(loop);
				const dt = Math.min(0.1, (now - lastTime) / 1000);
				lastTime = now;
				const t = now / 1000;

				for (const a of LAB_ACTIONS) {
					weights[a] = THREE.MathUtils.damp(
						weights[a],
						a === currentAction ? 1 : 0,
						6,
						dt,
					);
				}
				if (currentAction === "walk") walkPhase += dt * 7;
				if (rotate) yaw += dt * 0.6;

				const cheerElapsed = now - cheerStartedAt;
				const cheer =
					cheerElapsed >= 0 && cheerElapsed < 1100 ? cheerElapsed / 1100 : 0;

				applyBearPose(rig, { time: t, weights, walkPhase, yaw, cheer });
				renderer.render(scene, camera);
			};
			frame = requestAnimationFrame(loop);

			const info = renderer.info;
			const statsTimer = window.setInterval(() => {
				setStats(
					`draw calls: ${info.render.calls} / triangles: ${info.render.triangles}`,
				);
			}, 800);

			handleRef.current = {
				setAction: (a) => {
					currentAction = a;
				},
				setAutoRotate: (enabled) => {
					rotate = enabled;
					if (!enabled) yaw = 0;
				},
				cheer: () => {
					cheerStartedAt = performance.now();
				},
				dispose: () => {
					cancelAnimationFrame(frame);
					window.clearInterval(statsTimer);
					observer.disconnect();
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
				},
			};
		})();

		return () => {
			disposed = true;
			handleRef.current?.dispose();
			handleRef.current = null;
		};
	}, []);

	return (
		<Layout description="マスコット工房(開発者向け)" noFooter>
			<Head>
				<meta name="robots" content="noindex, nofollow" />
				<title>Bear Lab(開発者向け)</title>
			</Head>
			<main className={styles.lab}>
				<div className={styles.stage} ref={hostRef} />
				<aside className={styles.panel}>
					<h1>Bear Lab</h1>
					<p className={styles.note}>
						トップページのマスコット(BearScene)と同じモデル・同じポーズ合成を
						そのまま表示する工房です。アクションの調整やモデルの差し替えは、
						ここで確認しながら進めます。
					</p>
					<div className={styles.actions} role="group" aria-label="アクション">
						{LAB_ACTIONS.map((a) => (
							<button
								key={a}
								type="button"
								data-active={action === a || undefined}
								onClick={() => {
									setAction(a);
									handleRef.current?.setAction(a);
								}}
							>
								{a}
							</button>
						))}
						<button type="button" onClick={() => handleRef.current?.cheer()}>
							cheer(クリック演出)
						</button>
					</div>
					<label className={styles.toggle}>
						<input
							type="checkbox"
							checked={autoRotate}
							onChange={(event) => {
								setAutoRotate(event.target.checked);
								handleRef.current?.setAutoRotate(event.target.checked);
							}}
						/>
						ターンテーブル回転
					</label>
					<p className={styles.stats}>{stats}</p>
					<p className={styles.note}>
						glTF 資産を検査・最適化する場合は{" "}
						<code>bunx @gltf-transform/cli inspect &lt;file.glb&gt;</code> を
						利用できます(website の devDependency)。
					</p>
				</aside>
			</main>
		</Layout>
	);
}
