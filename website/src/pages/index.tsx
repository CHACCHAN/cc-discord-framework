import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import BearScene from "../components/BearScene";
import CodeShowcase from "../components/CodeShowcase";
import Comparison from "../components/Comparison";
import FeatureGrid from "../components/FeatureGrid";
import GettingStarted from "../components/GettingStarted";
import Hero from "../components/Hero";
import JapanNote from "../components/JapanNote";
import Pillars from "../components/Pillars";
import PluginArchitecture from "../components/PluginArchitecture";
import PluginCards from "../components/PluginCards";
import ProjectStatus from "../components/ProjectStatus";
import WasmBoundary from "../components/WasmBoundary";

/*
 * data-bear-waypoint: スクロール連動ベア(BearScene)の立ち寄り先。
 * 立ち位置は各セクションのレイアウトが最初から空けてある場所
 * (見出し脇・カラム下・右の空き列)にだけ置く。
 *   - data-bear-x / data-bear-dy: ビューポート幅・ラッパー高さに対する位置
 *   - data-bear-x-sm / data-bear-dy-sm: モバイル(996px 以下)での上書き
 *   - data-bear-dwell="0": 滞在しない通過点(歩行経路の中継)
 *   - data-bear-face: 滞在中の体の向き(+1 右 / -1 左)
 * 不透明な背景のセクション(Comparison・PluginCards・JapanNote)は
 * あえて素通りさせ、「パネルの陰に隠れて、抜けた先でまた現れる」動きを作る。
 */
export default function Home(): ReactNode {
	return (
		<Layout description="置くだけで、動く。Bun 専用・クラス指向の Discord Bot フレームワーク。discord.js 14 の柔軟性はそのままに、規約と型で Bot に構造を与えます。">
			<main data-landing className="overflow-clip">
				<BearScene />
				<Hero />
				<div
					data-bear-waypoint="hold"
					data-bear-id="pillars"
					data-bear-x="0.28"
					data-bear-dy="0.97"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="0.05"
				>
					<Pillars />
				</div>
				<Comparison />
				<div
					data-bear-waypoint="sit"
					data-bear-id="features"
					data-bear-x="0.84"
					data-bear-dy="0.2"
					data-bear-dwell="130"
					data-bear-face="-1"
					data-bear-dwell-sm="0"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="0.05"
				>
					<FeatureGrid />
				</div>
				{/* 通過点: コード帯の左レーンへ、セクションの境目で歩き移る。 */}
				<div
					data-bear-waypoint="peer"
					data-bear-id="showcase-seam"
					data-bear-dwell="0"
					data-bear-x="0.095"
					data-bear-dy="0"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="0.05"
					aria-hidden="true"
				/>
				{/* コード帯はステージ(data-bear-stage)なので、ラッパーで包まない。
				    包むと z:2 に持ち上がり、ベアの前後関係が壊れる。 */}
				<CodeShowcase />
				<div
					data-bear-waypoint="sit"
					data-bear-id="architecture"
					data-bear-x="0.78"
					data-bear-dy="0.99"
					data-bear-face="-1"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="0.05"
				>
					<PluginArchitecture />
				</div>
				<PluginCards />
				<div
					data-bear-waypoint="hold"
					data-bear-id="wasm"
					data-bear-x="0.14"
					data-bear-dy="0.965"
					data-bear-dwell="120"
					data-bear-dwell-sm="0"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="0.05"
				>
					<WasmBoundary />
				</div>
				{/* 通過点: WASM の左からステータス右の空きレーンへ、境目で歩き移る。 */}
				<div
					data-bear-waypoint="idle"
					data-bear-id="status-rail"
					data-bear-dwell="0"
					data-bear-x="0.87"
					data-bear-dy="0"
					data-bear-x-sm="0.5"
					aria-hidden="true"
				/>
				<ProjectStatus />
				<div
					data-bear-waypoint="bow"
					data-bear-id="start"
					data-bear-x="0.86"
					data-bear-dy="0.42"
					data-bear-face="-1"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="0.05"
				>
					<GettingStarted />
				</div>
				{/* 眠り場所: はじめるセクション末尾の余白(高さ0のマーカー)。 */}
				<div
					data-bear-waypoint="sleep"
					data-bear-id="goodnight"
					data-bear-x="0.8"
					data-bear-dy="0"
					data-bear-x-sm="0.5"
					data-bear-dy-sm="-0.01"
					aria-hidden="true"
				/>
				<JapanNote />
			</main>
		</Layout>
	);
}
