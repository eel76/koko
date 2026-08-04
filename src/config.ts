export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE = 32;

export const GRAVITY = 1000;
export const PLAYER_SPEED = 220;
export const JUMP_VELOCITY = -470;
// Releasing jump while rising caps upward speed at this value (variable jump height)
export const JUMP_CUT_VELOCITY = -160;
export const COYOTE_MS = 90;
export const JUMP_BUFFER_MS = 120;

export const ENEMY_SPEED = 60;
export const STOMP_BOUNCE = -320;

// Spiders hang from the ceiling and bob up and down on a thread
export const SPIDER_DROP = 384;
export const SPIDER_SPEED_MS = 1600;
// Bats patrol horizontally with a slight vertical wobble
export const BAT_RANGE_X = 96;
export const BAT_RANGE_Y = 20;
export const BAT_SPEED_MS = 1800;
// Giant flies buzz around faster and more erratically than bats
export const FLY_RANGE_X = 120;
export const FLY_RANGE_Y = 60;
export const FLY_SPEED_MS = 1400;

export const COIN_SCORE = 10;
export const BLOCK_COIN_SCORE = 50;
export const ENEMY_SCORE = 100;
export const FLAG_SCORE = 500;
export const START_LIVES = 3;

export const SKY_COLOR = 0x5c94fc;
export const CAVE_BG_COLOR = 0x171226;
export const FOREST_BG_COLOR = 0x8fca85;
export const NIGHT_COLOR = 0x1a1a2e;

// The stick-figure player is drawn white and tinted to contrast the theme
export const PLAYER_TINT_DARK = 0x26262e;
export const PLAYER_TINT_LIGHT = 0xf5f5f5;
