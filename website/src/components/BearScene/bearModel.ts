/**
 * ブランドマスコットの熊。プリミティブ構成だが「デザインされたキャラクター」に
 * 見せるため、次の3点を柱にしている:
 *   1. チビ頭身(頭が全高の約半分)と短い手足 — ぬいぐるみのプロポーション
 *   2. トゥーンシェーディング(3段階の gradientMap)+ インバーテッドハルの輪郭線
 *   3. まばたき・スカッシュ&ストレッチなどの生き物らしい所作
 * 各関節は「回転中心の Group + オフセットした Mesh」(Pivot Group パターン)。
 *
 * このモジュールは three を静的 import するため、必ず動的 import で読み込むこと
 * (トップページの初期バンドルに three を含めないため)。
 */
import * as THREE from "three";
import type { BearActionId } from "./bearTimeline";

/** ブランドパレット。サイトのトークン(エスプレッソ/キャラメル/クリーム)に合わせる。 */
const FUR = 0x5a381e;
const CARAMEL = 0xc98a54;
const CREAM = 0xefd6b2;
const INK = 0x241309;
const OUTLINE = 0x2b1608;
const AMBER = 0xe89a55;
const AMBER_GLOW = 0xb45f22;

export interface BearRig {
	/** ワールド配置(位置・スケール)を担うルート。 */
	readonly root: THREE.Group;
	/** ポーズ(向き・しゃがみ・転がり)を担う内側のルート。 */
	readonly pose: THREE.Group;
	readonly body: THREE.Group;
	readonly head: THREE.Group;
	readonly armL: THREE.Group;
	readonly armR: THREE.Group;
	readonly legL: THREE.Group;
	readonly legR: THREE.Group;
	readonly eyeL: THREE.Mesh;
	readonly eyeR: THREE.Mesh;
	/** hold アクションで抱える、発光するクラスキューブ。 */
	readonly cube: THREE.Mesh;
	readonly cubeMaterial: THREE.MeshStandardMaterial;
	/** sleep アクションで立ち上る Zzz 粒。 */
	readonly zzz: readonly THREE.Mesh[];
	readonly zzzMaterials: readonly THREE.MeshStandardMaterial[];
	readonly shadow: THREE.Mesh;
	readonly shadowMaterial: THREE.MeshBasicMaterial;
}

/** 3段階のトゥーン階調。NearestFilter でセル調の段差を保つ。 */
function makeGradientMap(): THREE.DataTexture {
	const data = new Uint8Array([110, 190, 255]);
	const texture = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;
	return texture;
}

export function buildBear(): BearRig {
	const gradientMap = makeGradientMap();
	const toon = (color: number): THREE.MeshToonMaterial =>
		new THREE.MeshToonMaterial({ color, gradientMap });
	const outlineMaterial = new THREE.MeshBasicMaterial({
		color: OUTLINE,
		side: THREE.BackSide,
	});

	/** 本体メッシュに、少し膨らませた裏面クローンを重ねて輪郭線にする。 */
	const withOutline = (
		geometry: THREE.BufferGeometry,
		material: THREE.Material,
		outlineScale = 1.06,
	): THREE.Group => {
		const group = new THREE.Group();
		const main = new THREE.Mesh(geometry, material);
		const outline = new THREE.Mesh(geometry, outlineMaterial);
		outline.scale.setScalar(outlineScale);
		group.add(outline, main);
		return group;
	};

	const root = new THREE.Group();
	const pose = new THREE.Group();
	root.add(pose);

	// 脚: 短いスタブ。ホップ移動が主なので存在感は控えめでよい。
	const legGeo = new THREE.CapsuleGeometry(0.16, 0.12, 6, 12);
	const legL = new THREE.Group();
	legL.position.set(-0.24, 0.34, 0);
	const legLBody = withOutline(legGeo, toon(FUR), 1.12);
	legLBody.position.y = -0.14;
	legL.add(legLBody);
	const legR = legL.clone(true);
	legR.position.x = 0.24;
	pose.add(legL, legR);

	// 胴: 洋梨型に少し潰した球。おなかにキャラメルのパッチ。
	const body = new THREE.Group();
	body.position.y = 0.34;
	const torso = withOutline(new THREE.SphereGeometry(0.54, 24, 18), toon(FUR));
	torso.position.y = 0.42;
	torso.scale.set(1, 0.98, 0.9);
	body.add(torso);
	const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), toon(CARAMEL));
	belly.scale.set(0.95, 1, 0.5);
	belly.position.set(0, 0.36, 0.28);
	body.add(belly);
	pose.add(body);

	// 腕: 短いスタブを肩から下げる。
	const armGeo = new THREE.CapsuleGeometry(0.13, 0.16, 6, 12);
	const armL = new THREE.Group();
	armL.position.set(-0.5, 0.62, 0);
	const armLBody = withOutline(armGeo, toon(FUR), 1.14);
	armLBody.position.y = -0.16;
	armL.add(armLBody);
	const armR = armL.clone(true);
	armR.position.x = 0.5;
	body.add(armL, armR);

	// 頭: 全高の約半分を占める大きな球。ロゴと同じ丸耳+キャラメルの内耳。
	const head = new THREE.Group();
	head.position.y = 0.92;
	const skull = withOutline(new THREE.SphereGeometry(0.62, 28, 22), toon(FUR));
	skull.position.y = 0.4;
	head.add(skull);

	const muzzle = withOutline(new THREE.SphereGeometry(0.27, 20, 16), toon(CREAM), 1.08);
	muzzle.scale.set(1.05, 0.72, 0.66);
	muzzle.position.set(0, 0.22, 0.52);
	head.add(muzzle);
	const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), toon(INK));
	nose.scale.set(1.2, 0.85, 0.9);
	nose.position.set(0, 0.32, 0.72);
	head.add(nose);

	const eyeGeo = new THREE.SphereGeometry(0.06, 12, 10);
	const eyeMat = toon(INK);
	const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
	eyeL.position.set(-0.24, 0.46, 0.52);
	const eyeR = eyeL.clone();
	eyeR.position.x = 0.24;
	head.add(eyeL, eyeR);

	// 頬のほんのり(キャラメルを薄く平たく)。
	const blushGeo = new THREE.SphereGeometry(0.075, 10, 8);
	const blushMat = new THREE.MeshToonMaterial({
		color: CARAMEL,
		gradientMap,
		transparent: true,
		opacity: 0.75,
	});
	for (const side of [-1, 1] as const) {
		const blush = new THREE.Mesh(blushGeo, blushMat);
		blush.scale.set(1.15, 0.7, 0.35);
		blush.position.set(side * 0.38, 0.3, 0.47);
		head.add(blush);
	}

	const earGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.09, 20);
	const earInnerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
	for (const side of [-1, 1] as const) {
		const ear = withOutline(earGeo, toon(FUR), 1.1);
		ear.rotation.x = Math.PI / 2;
		ear.position.set(side * 0.46, 0.86, -0.04);
		const inner = new THREE.Mesh(earInnerGeo, toon(CARAMEL));
		inner.rotation.x = Math.PI / 2;
		inner.position.set(side * 0.46, 0.86, 0.02);
		head.add(ear, inner);
	}
	body.add(head);

	// 発光キューブ: 「置くだけで、動く。」のクラス1枚を象徴する小道具。
	const cubeMaterial = new THREE.MeshStandardMaterial({
		color: AMBER,
		emissive: AMBER_GLOW,
		emissiveIntensity: 0.55,
		roughness: 0.4,
	});
	const cube = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), cubeMaterial);
	cube.position.set(0, 0.62, 0.58);
	cube.visible = false;
	body.add(cube);

	// Zzz 粒: sleep 中に頭上へ立ち上るクリーム色の球。
	const zzz: THREE.Mesh[] = [];
	const zzzMaterials: THREE.MeshStandardMaterial[] = [];
	for (let i = 0; i < 3; i += 1) {
		const material = new THREE.MeshStandardMaterial({
			color: CREAM,
			roughness: 0.8,
			transparent: true,
			opacity: 0,
		});
		const dot = new THREE.Mesh(
			new THREE.SphereGeometry(0.07 + i * 0.02, 10, 8),
			material,
		);
		dot.visible = false;
		pose.add(dot);
		zzz.push(dot);
		zzzMaterials.push(material);
	}

	// 接地影: 本物のシャドウマップは使わず、楕円の板で軽く偽装する。
	const shadowMaterial = new THREE.MeshBasicMaterial({
		color: 0x1a0d05,
		transparent: true,
		opacity: 0.18,
		depthWrite: false,
	});
	const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 28), shadowMaterial);
	shadow.rotation.x = -Math.PI / 2;
	shadow.scale.x = 1.3;
	shadow.position.y = 0.02;
	root.add(shadow);

	return {
		root,
		pose,
		body,
		head,
		armL,
		armR,
		legL,
		legR,
		eyeL,
		eyeR,
		cube,
		cubeMaterial,
		zzz,
		zzzMaterials,
		shadow,
		shadowMaterial,
	};
}

export interface BearPoseInput {
	/** 経過秒。 */
	readonly time: number;
	/** アクションごとのブレンド重み(0..1)。 */
	readonly weights: Readonly<Record<BearActionId, number>>;
	/** 歩行(ホップ)サイクルの位相(移動量から積算)。 */
	readonly walkPhase: number;
	/** 体の向き(Y 回転、ラジアン)。呼び出し側で減衰済みの値を渡す。 */
	readonly yaw: number;
	/** クリック時の歓喜リアクションの進行(0..1)。無いときは 0。 */
	readonly cheer?: number;
}

/**
 * ニュートラルへ戻してから、各アクションの寄与を重み付きで加算合成します。
 * 回転は小角度の加算合成で近似する(カートゥーン用途では十分滑らか)。
 */
export function applyBearPose(rig: BearRig, input: BearPoseInput): void {
	const { time: t, weights: w, walkPhase, yaw } = input;
	const cheer = input.cheer ?? 0;

	// ニュートラルへリセット
	rig.pose.rotation.set(0, yaw, 0);
	rig.pose.position.set(0, 0, 0);
	rig.pose.scale.set(1, 1, 1);
	rig.body.rotation.set(0, 0, 0);
	rig.head.rotation.set(0, 0, 0);
	rig.armL.rotation.set(0, 0, 0.25);
	rig.armR.rotation.set(0, 0, -0.25);
	rig.legL.rotation.set(0, 0, 0);
	rig.legR.rotation.set(0, 0, 0);

	// まばたき: 約3.4秒ごとに一瞬つぶる。生き物らしさの要。
	const blinkCycle = (t + 1.2) % 3.4;
	const blink = blinkCycle < 0.13 ? 0.12 : 1;
	rig.eyeL.scale.set(1, blink, 1);
	rig.eyeR.scale.set(1, blink, 1);

	// idle: 呼吸と視線の揺らぎ。どのアクションにも下地として薄く混ぜる。
	const idle = Math.max(w.idle, 0.35);
	const breath = Math.sin(t * 2.1);
	rig.pose.scale.y += 0.014 * breath * idle;
	rig.head.rotation.z += 0.05 * Math.sin(t * 0.8) * idle;
	rig.head.rotation.y += 0.09 * Math.sin(t * 0.5) * idle;

	// walk: ぬいぐるみらしくぴょこぴょこ跳ねて進む(ホップ+着地スカッシュ)。
	if (w.walk > 0.001) {
		const hop = Math.abs(Math.sin(walkPhase));
		const squash = Math.max(0, -Math.sin(walkPhase * 2)) * 0.06;
		rig.pose.position.y += hop * 0.16 * w.walk;
		rig.pose.scale.y += (-squash + hop * 0.03) * w.walk;
		rig.pose.scale.x += squash * 0.7 * w.walk;
		rig.body.rotation.z += 0.05 * Math.sin(walkPhase) * w.walk;
		rig.body.rotation.x += 0.06 * w.walk;
		rig.legL.rotation.x += 0.5 * Math.sin(walkPhase) * w.walk;
		rig.legR.rotation.x += -0.5 * Math.sin(walkPhase) * w.walk;
		rig.armL.rotation.x += -0.35 * Math.sin(walkPhase) * w.walk;
		rig.armR.rotation.x += 0.35 * Math.sin(walkPhase) * w.walk;
	}

	// hold: 両腕でキューブを抱えて掲げる。
	if (w.hold > 0.001) {
		rig.armL.rotation.x += -1.7 * w.hold;
		rig.armR.rotation.x += -1.7 * w.hold;
		rig.armL.rotation.z += 0.45 * w.hold;
		rig.armR.rotation.z += -0.45 * w.hold;
		rig.head.rotation.x += -0.08 * w.hold;
	}
	rig.cube.visible = w.hold > 0.02;
	if (rig.cube.visible) {
		rig.cube.scale.setScalar(Math.max(0.001, w.hold));
		rig.cube.position.y = 0.62 + 0.05 * Math.sin(t * 2.4);
		rig.cube.rotation.y = t * 0.9;
		rig.cubeMaterial.emissiveIntensity = 0.45 + 0.25 * (0.5 + 0.5 * Math.sin(t * 2.4));
	}

	// hello: 右腕を上げて振り、少し首をかしげる。
	if (w.hello > 0.001) {
		rig.armR.rotation.x += -2.4 * w.hello;
		rig.armR.rotation.z += (-0.3 + 0.4 * Math.sin(t * 5.2)) * w.hello;
		rig.head.rotation.z += 0.14 * w.hello;
	}

	// sit: 腰を落として脚を前へ。コードを眺める姿勢。
	if (w.sit > 0.001) {
		rig.pose.position.y += -0.22 * w.sit;
		rig.legL.rotation.x += -1.4 * w.sit;
		rig.legR.rotation.x += -1.4 * w.sit;
		rig.body.rotation.x += 0.08 * w.sit;
		rig.head.rotation.x += -0.1 * w.sit;
	}

	// bow: 日本式のおじぎをゆっくり繰り返す。
	if (w.bow > 0.001) {
		const cycle = 0.5 - 0.5 * Math.cos(t * 1.7);
		rig.body.rotation.x += 0.5 * cycle * w.bow;
		rig.head.rotation.x += 0.12 * cycle * w.bow;
		rig.armL.rotation.x += 0.2 * cycle * w.bow;
		rig.armR.rotation.x += 0.2 * cycle * w.bow;
	}

	// sleep: 横になって眠る。Zzz が頭上へ立ち上る。
	// 足元原点のまま回転すると胴が地面へ沈むため、体の半径ぶん持ち上げる。
	if (w.sleep > 0.001) {
		rig.pose.rotation.z += Math.PI * 0.46 * w.sleep;
		rig.pose.position.y += 0.5 * w.sleep;
		rig.pose.scale.y += 0.02 * Math.sin(t * 1.2) * w.sleep;
		rig.head.rotation.z += -0.22 * w.sleep;
	}
	for (let i = 0; i < rig.zzz.length; i += 1) {
		const dot = rig.zzz[i]!;
		const material = rig.zzzMaterials[i]!;
		const visible = w.sleep > 0.02;
		dot.visible = visible;
		if (!visible) continue;
		const cycle = (t * 0.45 + i * 0.33) % 1;
		dot.position.set(0.6 + cycle * 0.28 + i * 0.12, 0.95 + cycle * 0.8, 0.2);
		material.opacity = w.sleep * (cycle < 0.15 ? cycle / 0.15 : 1 - (cycle - 0.15) / 0.85) * 0.9;
	}

	// cheer: クリックへの返礼。スピンジャンプ+両手上げ+着地スカッシュ。
	if (cheer > 0.001) {
		const bell = Math.sin(Math.PI * cheer);
		rig.pose.position.y += bell * 0.55;
		rig.pose.rotation.y += cheer * Math.PI * 2;
		rig.armL.rotation.x += -2.6 * bell;
		rig.armR.rotation.x += -2.6 * bell;
		// 踏み切りと着地で軽く潰れる
		const edge = Math.max(0, 0.25 - Math.min(cheer, 1 - cheer)) / 0.25;
		rig.pose.scale.y += -0.12 * edge;
		rig.pose.scale.x += 0.1 * edge;
		rig.head.rotation.x += -0.15 * bell;
	}

	// 接地影: 高さとポーズに応じて薄く伸縮させる。
	const lift = rig.pose.position.y;
	rig.shadowMaterial.opacity = Math.max(0.06, 0.18 - lift * 0.18);
	const spread = 1 + w.sleep * 0.55 + w.sit * 0.15 - lift * 0.3;
	rig.shadow.scale.set(1.3 * Math.max(0.6, spread), Math.max(0.6, spread), 1);
}
