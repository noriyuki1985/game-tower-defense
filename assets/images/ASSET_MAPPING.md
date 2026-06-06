# 画像アセット対応表 v3.5.0

ゲーム内の定義名と画像ファイル名の対応を明示しています。
命名ルールは `カテゴリ_対象_分岐.png` です。

## 主要対応

| ゲーム内定義 | 画像キー | ファイル |
|---|---|---|
| 王 idle | kingIdle | king/king_idle.png |
| 王 run1 | kingRun1 | king/king_run_1.png |
| 王 run2 | kingRun2 | king/king_run_2.png |
| 雑兵 | enemyGrunt | enemies/enemy_grunt.png |
| 走り兵 | enemyRunner | enemies/enemy_runner.png |
| 重兵 | enemyBrute | enemies/enemy_brute.png |
| 盾兵 | enemyShield | enemies/enemy_shield.png |
| 破壊兵 | enemySaboteur | enemies/enemy_saboteur.png |
| 爆弾兵 | enemyBomber | enemies/enemy_bomber.png |
| 呪術兵 | enemyShaman | enemies/enemy_shaman.png |
| 破城槌 | enemySiegeRam | enemies/enemy_siege_ram.png |
| 将軍 | enemyWarlord | enemies/enemy_warlord.png |
| 大将軍 | enemyOverlord | enemies/enemy_overlord.png |

## 施設分岐画像

| 施設/分岐 | 画像キー | ファイル |
|---|---|---|
| 柵/棘付き柵 | buildingPalisadeThorns | buildings/upgrades/building_palisade_thorns.png |
| 柵/強化柵 | buildingPalisadeReinforced | buildings/upgrades/building_palisade_reinforced.png |
| 石壁/城壁 | buildingStoneWallBastion | buildings/upgrades/building_stone_wall_bastion.png |
| 石壁/迎撃門 | buildingStoneWallGate | buildings/upgrades/building_stone_wall_gate.png |
| 弓塔/長弓塔 | buildingArcherTowerLongbow | buildings/upgrades/building_archer_tower_longbow.png |
| 弓塔/連射弓塔 | buildingArcherTowerRapid | buildings/upgrades/building_archer_tower_rapid.png |
| 大砲/重砲 | buildingCannonHeavy | buildings/upgrades/building_cannon_heavy.png |
| 大砲/散弾砲 | buildingCannonScatter | buildings/upgrades/building_cannon_scatter.png |
| 兵舎/盾部隊 | buildingBarracksShield | buildings/upgrades/building_barracks_shield.png |
| 兵舎/槍部隊 | buildingBarracksSpear | buildings/upgrades/building_barracks_spear.png |
| 金鉱/徴税所 | buildingGoldMineTax | buildings/upgrades/building_gold_mine_tax.png |
| 金鉱/金庫 | buildingGoldMineVault | buildings/upgrades/building_gold_mine_vault.png |
| 修理小屋/現場班 | buildingRepairHutFieldwork | buildings/upgrades/building_repair_hut_fieldwork.png |
| 修理小屋/工房 | buildingRepairHutWorkshop | buildings/upgrades/building_repair_hut_workshop.png |
| 棘罠/鋭利な罠 | buildingSpikeTrapBarbed | buildings/upgrades/building_spike_trap_barbed.png |
| 棘罠/氷結罠 | buildingSpikeTrapFrost | buildings/upgrades/building_spike_trap_frost.png |
| 指揮所/攻撃号令 | buildingWarBannerMorale | buildings/upgrades/building_war_banner_morale.png |
| 指揮所/見張り号令 | buildingWarBannerCommand | buildings/upgrades/building_war_banner_command.png |
| 狼煙台/見張り火 | buildingSignalBeaconScout | buildings/upgrades/building_signal_beacon_scout.png |
| 狼煙台/集結火 | buildingSignalBeaconRally | buildings/upgrades/building_signal_beacon_rally.png |

## 発展施設Lv.2画像

| 施設 | 画像キー | ファイル |
|---|---|---|
| 村 Lv.2+ | buildingVillageLv2 | buildings/upgrades/building_village_lv2.png |
| 市場 Lv.2+ | buildingMarketLv2 | buildings/upgrades/building_market_lv2.png |
| 前哨基地 Lv.2+ | buildingOutpostLv2 | buildings/upgrades/building_outpost_lv2.png |
| 訓練場 Lv.2+ | buildingTrainingYard | buildings/upgrades/building_training_yard.png |
| 王の砦 Lv.2+ | buildingRoyalKeepLv2 | buildings/upgrades/building_royal_keep_lv2.png |

## 補足

- `src/game.js` の `facilityAssetKey(f)` が、施設タイプ・分岐・レベルに応じて自動選択します。
- 画像が読み込めない場合は従来の図形描画へフォールバックします。

## v1.7.0 敵歩行アニメーション


| ゲーム内定義 | 画像キー | ファイル |
|---|---|---|


## v1.8.0 兵士攻撃モーション

| ゲーム内定義名 | asset key | ファイル |
|---|---|---|
| soldier.militia.attack_1 | allyMilitiaAttack1 | assets/images/allies/attack/ally_militia_attack_1.png |
| soldier.militia.attack_2 | allyMilitiaAttack2 | assets/images/allies/attack/ally_militia_attack_2.png |
| soldier.militia.attack_3 | allyMilitiaAttack3 | assets/images/allies/attack/ally_militia_attack_3.png |
| soldier.militia.attack_4 | allyMilitiaAttack4 | assets/images/allies/attack/ally_militia_attack_4.png |
| soldier.shield.attack_1 | allyShieldAttack1 | assets/images/allies/attack/ally_shield_attack_1.png |
| soldier.shield.attack_2 | allyShieldAttack2 | assets/images/allies/attack/ally_shield_attack_2.png |
| soldier.shield.attack_3 | allyShieldAttack3 | assets/images/allies/attack/ally_shield_attack_3.png |
| soldier.shield.attack_4 | allyShieldAttack4 | assets/images/allies/attack/ally_shield_attack_4.png |
| soldier.spear.attack_1 | allySpearAttack1 | assets/images/allies/attack/ally_spear_attack_1.png |
| soldier.spear.attack_2 | allySpearAttack2 | assets/images/allies/attack/ally_spear_attack_2.png |
| soldier.spear.attack_3 | allySpearAttack3 | assets/images/allies/attack/ally_spear_attack_3.png |
| soldier.spear.attack_4 | allySpearAttack4 | assets/images/allies/attack/ally_spear_attack_4.png |
| soldier.archer.attack_1 | allyArcherAttack1 | assets/images/allies/attack/ally_archer_attack_1.png |
| soldier.archer.attack_2 | allyArcherAttack2 | assets/images/allies/attack/ally_archer_attack_2.png |
| soldier.archer.attack_3 | allyArcherAttack3 | assets/images/allies/attack/ally_archer_attack_3.png |
| soldier.archer.attack_4 | allyArcherAttack4 | assets/images/allies/attack/ally_archer_attack_4.png |
| soldier.engineer.attack_1 | allyEngineerAttack1 | assets/images/allies/attack/ally_engineer_attack_1.png |
| soldier.engineer.attack_2 | allyEngineerAttack2 | assets/images/allies/attack/ally_engineer_attack_2.png |
| soldier.engineer.attack_3 | allyEngineerAttack3 | assets/images/allies/attack/ally_engineer_attack_3.png |
| soldier.engineer.attack_4 | allyEngineerAttack4 | assets/images/allies/attack/ally_engineer_attack_4.png |

`v1.8.0` 時点で実際に兵舎から出る主な兵士は `militia` / `shield` / `spear` です。`archer` / `engineer` は今後の兵士追加に備えて同じ命名規則で用意しています。


## 王アニメーション v3.5.0

| ゲーム内定義 | 画像キー | ファイル |
|---|---|---|
| 王 idle 1 | kingIdle1 | king/idle/king_idle_1.png |
| 王 idle 2 | kingIdle2 | king/idle/king_idle_2.png |
| 王 run frame 1 | kingRunFrame1 | king/run/king_run_1.png |
| 王 run frame 2 | kingRunFrame2 | king/run/king_run_2.png |
| 王 run frame 3 | kingRunFrame3 | king/run/king_run_3.png |
| 王 run frame 4 | kingRunFrame4 | king/run/king_run_4.png |
| 王 被弾 | kingHurt | king/king_hurt.png |
| 王 気絶 | kingDown | king/king_down.png |


## v3.5.0 中核5建物 レベル別画像

| 建物 | Lv1 青 | Lv2 緑 | Lv3 黄 | Lv4 赤 |
|---|---|---|---|---|
| 柵 | buildingPalisadeLv1 / buildings/levels/building_palisade_lv1.png | buildingPalisadeLv2 / buildings/levels/building_palisade_lv2.png | buildingPalisadeLv3 / buildings/levels/building_palisade_lv3.png | buildingPalisadeLv4 / buildings/levels/building_palisade_lv4.png |
| 弓塔 | buildingArcherTowerLv1 / buildings/levels/building_archer_tower_lv1.png | buildingArcherTowerLv2 / buildings/levels/building_archer_tower_lv2.png | buildingArcherTowerLv3 / buildings/levels/building_archer_tower_lv3.png | buildingArcherTowerLv4 / buildings/levels/building_archer_tower_lv4.png |
| 大砲 | buildingCannonLv1 / buildings/levels/building_cannon_lv1.png | buildingCannonLv2 / buildings/levels/building_cannon_lv2.png | buildingCannonLv3 / buildings/levels/building_cannon_lv3.png | buildingCannonLv4 / buildings/levels/building_cannon_lv4.png |
| 兵舎 | buildingBarracksLv1 / buildings/levels/building_barracks_lv1.png | buildingBarracksLv2 / buildings/levels/building_barracks_lv2.png | buildingBarracksLv3 / buildings/levels/building_barracks_lv3.png | buildingBarracksLv4 / buildings/levels/building_barracks_lv4.png |
| 金鉱 | buildingGoldMineLv1 / buildings/levels/building_gold_mine_lv1.png | buildingGoldMineLv2 / buildings/levels/building_gold_mine_lv2.png | buildingGoldMineLv3 / buildings/levels/building_gold_mine_lv3.png | buildingGoldMineLv4 / buildings/levels/building_gold_mine_lv4.png |

- Lv1 は青基調、Lv2 は緑基調、Lv3 は黄基調、Lv4 は赤基調。
- 通常マップではこの5建物のみを使用する。
- 分岐強化画像は現時点では通常マップの主導線では使用しない。


## v3.5.0 Lv別建物画像

- 柵・弓塔・大砲・兵舎・金鉱は Lv1〜Lv4 の画像を使用します。
- Lv1=青、Lv2=緑、Lv3=黄、Lv4=赤。
- 対象画像は `assets/images/buildings/levels/` に配置します。
- 通常マップではこの5建物だけを建設対象にします。
