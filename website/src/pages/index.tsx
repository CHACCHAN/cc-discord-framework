import Layout from "@theme/Layout";
import type { ReactNode } from "react";
import BearScene from "../components/BearScene";
import CodeShowcase from "../components/CodeShowcase";
import Comparison from "../components/Comparison";
import FeatureGrid from "../components/FeatureGrid";
import GettingStarted from "../components/GettingStarted";
import Hero from "../components/Hero";
import JapanNote from "../components/JapanNote";
import LandingMotion from "../components/LandingMotion";
import Pillars from "../components/Pillars";
import PluginArchitecture from "../components/PluginArchitecture";
import PluginCards from "../components/PluginCards";
import ProjectStatus from "../components/ProjectStatus";

/*
 * data-bear-waypoint: スクロール連動ベア(BearScene)の立ち寄り先。
 * ベアはコンテンツの背面レイヤーにいるため、立ち寄り先は「背景が透明な
 * セクション」だけに置く(不透明なセクションの裏は通過中に隠れて、
 * 抜けた先で再び姿を見せる)。値はアクション名、data-bear-x はビューポート
 * 幅に対する立ち位置、data-bear-dy はラッパー高さに対する足元の位置。
 */
export default function Home(): ReactNode {
	return (
		<Layout description="置くだけで、動く。Bun 専用・クラス指向の Discord Bot フレームワーク。discord.js 14 の柔軟性はそのままに、規約と型で Bot に構造を与えます。">
			<main data-landing className="overflow-clip">
				<LandingMotion />
				<BearScene />
				<Hero />
				<ProjectStatus />
				<div data-bear-waypoint="hold" data-bear-id="pillars" data-bear-x="0.08" data-bear-dy="0.26">
					<Pillars />
				</div>
				<Comparison />
				<div data-bear-waypoint="hello" data-bear-id="features" data-bear-x="0.9" data-bear-dy="0.25">
					<FeatureGrid />
				</div>
				<CodeShowcase />
				<div data-bear-waypoint="sit" data-bear-id="architecture" data-bear-x="0.74" data-bear-dy="0.9">
					<PluginArchitecture />
				</div>
				<PluginCards />
				<div data-bear-waypoint="bow" data-bear-id="start" data-bear-x="0.07" data-bear-dy="0.24">
					<GettingStarted />
				</div>
				{/* 眠り場所: はじめるセクション末尾の余白(高さ0のマーカー)。 */}
				<div data-bear-waypoint="sleep" data-bear-id="goodnight" data-bear-x="0.5" data-bear-dy="0" aria-hidden="true" />
				<JapanNote />
			</main>
		</Layout>
	);
}
