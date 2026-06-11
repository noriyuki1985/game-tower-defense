# CHANGELOG

## v3.12.4
- ステージ説明を1か所へ集約
- ステージ要点と診断表示をチップ形式へ整理
- stagePurposeText / stageRuleText の表示を削除
- モバイル時の説明量を削減し、文字重なり・枠はみ出しを抑制
- モバイルメッセージバーの「状況」見出しを削除
- saveKey / audioKey / ASSET_VERSION を v3.12.4 へ更新

## v3.12.3

- 画像生成なし。
- ステージ選択UIのスマホ表示を最適化。
- スマホではステージ概要カードの長文を抑制し、ルート数・難易度・推奨建物・診断値をコンパクト表示するよう調整。
- サイドパネル内のスクロール負荷を下げた。
- `saveKey` / `audioKey` を `v123` に更新。
- `ASSET_VERSION` を `v3.12.3` に更新。

## v3.12.2

- 画像生成なし。
- バランス調整前の診断表示をステージ選択UIに追加。
- 初期資金、敵HP/攻撃/速度倍率、建設床数、ルート別敵出現数、総敵数、波数を表示。
- meadow / crossroads / ridge のステージ差をUI上で比較しやすくした。


## v3.12.1

- 画像生成なし。ステージ選択UIを改善。
- `C.stageUiMeta` を追加し、各ステージの区分・ルート数・難易度・推奨建物・目的を整理。
- ステージ選択プルダウンに、ステージ区分・ルート数・難易度を表示。
- ステージ概要カードを追加し、meadow / crossroads / ridge の違いを見やすくした。
- 背景テスト用ステージと本番候補ステージをUI上で区別。
- `saveKey` / `audioKey` を `v121` に更新。
- `ASSET_VERSION` を `v3.12.1` に更新。

## v3.12.0
- ridge専用の背景パーツ（岩・崖・高台・草束）を追加
- ridge背景レイアウトを専用パーツ中心へ更新
- 背景パーツプリセットに ridgeUpperShelf / ridgePlateauNook / ridgeRockScatter を追加
- saveKey / audioKey / ASSET_VERSION / asset manifest を v3.12.0 へ更新

# CHANGELOG

## v3.11.2

- 画像生成なし。背景パーツ配置プリセット化を追加。
- `C.backgroundPartPresets` を追加。
- `C.expandBackgroundPartLayoutPresets` を追加し、プリセットを展開してから `C.normalizeBackgroundPartLayouts` を適用する流れにした。
- `rockyBackCluster` / `forestEdgeCluster` / `supplyFrontCluster` / `softMistSet` を追加。
- `ridge` の背景パーツ配置にプリセットを適用し、岩場・樹林・補給小物・薄霧をまとめて配置できるようにした。
- 建設床の弓塔表示で「弓」がラベルと重なって見える問題を修正。
- `saveKey` / `audioKey` を `v112` に更新。
- アセットキャッシュバージョンを `v3.11.2` に更新。

## v3.11.1

- 画像生成なし。`ridge` の建設床位置と探索地点を調整。
- `r2` / `r3` / `r5` / `r7` / `r13` / `r14` の位置を微調整。
- `ridge_cache` / `ridge_mine` の発見地点を背景パーツや道と重なりにくい位置へ調整。
- 建設床のハロー・枠線と施設足元プレートを微調整。
- `C.stagePlacementTuning` を追加し、ステージ別の配置調整意図を明文化。


## v3.11.0

- 画像生成なし。既存背景パーツを流用して新マップ `ridge`（高台の前線）を追加。
- `meadow` / `crossroads` / `ridge` の3マップで背景切替を確認可能にした。
- `C.stages.ridge`、`C.stageGoals.ridge`、`C.stageThemes.ridge`、`C.stageBackgrounds.ridge` を追加。
- `C.backgroundPartLayouts.ridge` を追加し、既存パーツを岩場寄りの雰囲気で再配置した。
- `C.stagePaths.ridge`、`C.routeLabels.ridge`、`C.stagePadLayouts.ridge`、`C.discoveryPoints.ridge`、`C.routeChokepoints.ridge`、`C.mapGuideTrails.ridge` を追加。
- `crossroads.next` を `ridge` に更新。
- 開発用初期セーブで `ridge` を最初から選択可能にした。
- `saveKey` / `audioKey` を `v110` に更新。
- アセットキャッシュバージョンを `v3.11.0` に更新。

# CHANGELOG

## v3.10.4

- 画像生成なし。背景パーツ画像は増やさず、配置調整・確認用の開発機能を追加。
- `C.backgroundPartDebug` を追加し、`P`キーで背景パーツ確認モードをON/OFFできるようにした。
- `backgroundPartLayouts` を正規化し、各パーツへ `id` / `stage` / `layer` / `debugLabel` を自動付与。
- `C.backgroundPartLayoutSchema` を追加し、調整対象フィールドと必須項目を明文化。
- 背景パーツ確認モードで、パーツ名・座標・サイズ・透明度・ルート名を画面に表示。
- パーツ配置警告を追加。catalog未定義、x/y未指定、alpha範囲外、サイズ不正、画面外、asset未登録を検出。
- `meadow` / `crossroads` の両方で確認可能。
- `saveKey` / `audioKey` を `v104` に更新。
- アセットキャッシュバージョンを `v3.10.4` に更新。

## v3.10.3

- 背景パーツ画像を品質調整版へ差し替え。
  - 草パッチの輪郭を自然化
  - 土パッチを2パターン化
  - 直線道 / 曲線道のつながり感を改善
  - 木 / 岩 / 柵 / 木箱の見た目を調整
  - 影 / 霧の主張を弱めて操作対象の邪魔をしにくくした
- `C.backgroundPartCatalog` に `groundPatchAlt` を追加。
- `meadow` / `crossroads` の背景パーツ配置と透明度を微調整。
- `saveKey` / `audioKey` を `v103` に更新。
- アセットキャッシュバージョンを `v3.10.3` に更新。

## v3.10.1

- `v3.9.3` と `v3.10.0` を含めて統合。
- 背景ラフ `meadow` の背面装飾・前面装飾・雰囲気レイヤーの透明度を調整し、建物・敵・味方・建設床との奥行き関係を見やすくした。
- 施設の足元に `C.facilityGroundPlate` を追加し、建設前の床と建設後の施設の見え方を比較しやすくした。
- `C.backgroundPartCatalog` / `C.backgroundPartLayouts` を追加し、地面・道・木・岩・柵・木箱・草・影・雰囲気オーバーレイを再利用パーツとして整理した。
- 背景パーツを使う仮マップ `crossroads` を追加し、同じパーツでも別の雰囲気・別のルート配置に切り替えられることを確認できるようにした。
- `saveKey` / `audioKey` を `v101` に更新。
- アセットキャッシュバージョンを `v3.10.1` に更新。

## v3.9.2

- `meadow` の背景ラフを現行キャラクター・建物画像に寄せて再調整。
- 地面・道・装飾の線密度と小物密度を抑制。
- 道を丸みのある太い形状に整理し、視認性を維持しつつ質感差を縮めた。
- 背面装飾・前面装飾・雰囲気レイヤーの主張を抑えた。
- `C.backgroundStyleGuide` を追加。
- `visibilityGuide` の補助線を弱めた。
- `saveKey` / `audioKey` を `v392` に更新。
- アセットキャッシュバージョンを `v3.9.2` に更新。

## v3.9.1

- `meadow` 背景ラフの視認性を調整。
- 敵ルートの輪郭と中心線を補強。
- 建設床の背景埋もれ対策として `C.padVisibility` を追加。

## v3.9.0

- 現行メインマップ `meadow` に背景ラフ5レイヤーを追加。

## v3.8.1

- `C.backgroundDebug` を追加し、背景レイヤー可視化を追加。

## v3.8.0

- 背景差し替え基盤を追加。
