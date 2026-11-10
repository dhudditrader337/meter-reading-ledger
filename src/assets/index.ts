/**
 * Re-export of the Codex PNGs. Fixed contract names only (Step 1.5) —
 * never invent another file name, the build fails on a missing require.
 */

export const assets = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  sprite1: require('../../assets/sprite_1.png'),
  sprite2: require('../../assets/sprite_2.png'),
  sprite3: require('../../assets/sprite_3.png'),
  sprite4: require('../../assets/sprite_4.png'),
  sprite5: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
};

/** Meter sprites addressed by the Meter.sprite index (1..4). */
export const meterSprites = [
  assets.sprite1,
  assets.sprite2,
  assets.sprite3,
  assets.sprite4,
] as const;

export function spriteFor(index: number) {
  return meterSprites[Math.max(0, Math.min(3, index - 1))];
}

export default assets;
