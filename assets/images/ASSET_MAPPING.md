# 画像アセット対応表 v3.9.0

v3.9.0 では現行メインマップ1枚に背景ラフ画像を追加しました。建設対象は引き続き中核5建物のみです。

## 中核5建物 レベル別画像

| 建物 | Lv1 青 | Lv2 緑 | Lv3 黄 | Lv4 赤 |
|---|---|---|---|---|
| 柵 | buildingPalisadeLv1 / buildings/levels/building_palisade_lv1.png | buildingPalisadeLv2 / buildings/levels/building_palisade_lv2.png | buildingPalisadeLv3 / buildings/levels/building_palisade_lv3.png | buildingPalisadeLv4 / buildings/levels/building_palisade_lv4.png |
| 弓塔 | buildingArcherTowerLv1 / buildings/levels/building_archer_tower_lv1.png | buildingArcherTowerLv2 / buildings/levels/building_archer_tower_lv2.png | buildingArcherTowerLv3 / buildings/levels/building_archer_tower_lv3.png | buildingArcherTowerLv4 / buildings/levels/building_archer_tower_lv4.png |
| 大砲 | buildingCannonLv1 / buildings/levels/building_cannon_lv1.png | buildingCannonLv2 / buildings/levels/building_cannon_lv2.png | buildingCannonLv3 / buildings/levels/building_cannon_lv3.png | buildingCannonLv4 / buildings/levels/building_cannon_lv4.png |
| 兵舎 | buildingBarracksLv1 / buildings/levels/building_barracks_lv1.png | buildingBarracksLv2 / buildings/levels/building_barracks_lv2.png | buildingBarracksLv3 / buildings/levels/building_barracks_lv3.png | buildingBarracksLv4 / buildings/levels/building_barracks_lv4.png |
| 金鉱 | buildingGoldMineLv1 / buildings/levels/building_gold_mine_lv1.png | buildingGoldMineLv2 / buildings/levels/building_gold_mine_lv2.png | buildingGoldMineLv3 / buildings/levels/building_gold_mine_lv3.png | buildingGoldMineLv4 / buildings/levels/building_gold_mine_lv4.png |

## 方針

- 通常マップ・チュートリアル・fallback pads はすべて中核5建物のみ。
- Lv1=青、Lv2=緑、Lv3=黄、Lv4=赤。
- 分岐強化画像は使用しないため削除済み。
- 旧施設画像も preload manifest から削除済み。

## 背景ラフ画像 v3.9.0

現行メインマップのみ、以下の背景ラフ画像を追加しています。

- `bgMeadowRoughBase` / `backgrounds/meadow/bg_meadow_rough_base.png`
- `bgMeadowRoughPath` / `backgrounds/meadow/bg_meadow_rough_path.png`
- `bgMeadowRoughDecorationBack` / `backgrounds/meadow/bg_meadow_rough_decoration_back.png`
- `bgMeadowRoughDecorationFront` / `backgrounds/meadow/bg_meadow_rough_decoration_front.png`
- `bgMeadowRoughAtmosphere` / `backgrounds/meadow/bg_meadow_rough_atmosphere.png`

画像が存在しない場合は、従来の手続き型背景に fallback します。
