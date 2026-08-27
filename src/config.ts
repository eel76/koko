export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE = 32;

// Gameplay camera zoom so level content fills most of the screen.
// HUD and touch controls are compensated to keep their apparent size.
export const CAMERA_ZOOM = 1.5;

export const GRAVITY = 1000;
export const PLAYER_SPEED = 220;
export const JUMP_VELOCITY = -470;
// Releasing jump while rising caps upward speed at this value (variable jump height)
export const JUMP_CUT_VELOCITY = -160;
export const COYOTE_MS = 90;
export const JUMP_BUFFER_MS = 120;

export const ENEMY_SPEED = 60;
export const STOMP_BOUNCE = -320;
// Sparky patrols like a ground enemy but cannot be stomped (spikes!)
export const SPARKY_SPEED = 50;

// Spiders hang from the ceiling and bob up and down on a thread
export const SPIDER_DROP = 384;
export const SPIDER_SPEED_MS = 1600;
// Bats patrol horizontally with a slight vertical wobble
export const BAT_RANGE_X = 96;
export const BAT_RANGE_Y = 20;
export const BAT_SPEED_MS = 1800;
// Fliegi traces one continuous figure-eight: a sine drives the horizontal
// position, so it eases to a halt at the turns instead of bouncing off them,
// while the vertical sine runs on through the whole loop. Kept slow so the
// character stays easy to read.
export const FLIEGI_RANGE_X = 110;
export const FLIEGI_WAVE_Y = 30;
export const FLIEGI_WAVE_CYCLES = 2;
export const FLIEGI_LOOP_MS = 5600;
// Giant flies buzz around faster and more erratically than bats
export const FLY_RANGE_X = 120;
export const FLY_RANGE_Y = 60;
export const FLY_SPEED_MS = 1400;
// Fish leap out of water pools and fall back in
export const FISH_JUMP_HEIGHT = 120;
export const FISH_RISE_MS = 600;
export const FISH_PAUSE_MS = 1000;

// Floating logs drift back and forth over the water and carry the player.
// Every log follows the same sine, so neighbouring logs keep their distance
// and never drift into each other. How far a log really swings is decided by
// the water it floats on — LOG_RANGE_X is only the upper limit, and
// LOG_BANK_MARGIN the gap it keeps to the bank at the end of its swing.
export const LOG_RANGE_X = 64;
export const LOG_BANK_MARGIN = 4;
export const LOG_PERIOD_MS = 3400;

export const COIN_SCORE = 10;
export const BLOCK_COIN_SCORE = 50;
export const ENEMY_SCORE = 100;
export const FLAG_SCORE = 500;
export const START_LIVES = 3;

// Each level must be finished within the time limit; remaining seconds
// are converted into bonus points at the flag.
export const LEVEL_TIME_SECONDS = 120;
export const TIME_BONUS_PER_SECOND = 10;

// Entering and leaving a level is played as a little scene: the character
// walks in from the left screen edge to the middle before the controls appear,
// and walks off the right edge after the goal. INTRO_LEAD_IN is how far left of
// the visible area the character starts, OUTRO_MARGIN how far past the right
// edge it walks before the level ends.
export const INTRO_LEAD_IN = 60;
export const OUTRO_MARGIN = 80;
// How long the walk-off waits for the character to land before setting it down
// on the goal's ground itself: the level is left on foot, never floating.
export const OUTRO_LANDING_MS = 1500;
export const CONTROLS_FADE_MS = 350;

export const SKY_COLOR = 0x5c94fc;
export const CAVE_BG_COLOR = 0x171226;
export const FOREST_BG_COLOR = 0x74975f;
// Ordinary woods: no sky at all behind the trees. A forest does not open onto
// blue — the deeper you look, the darker and denser it gets, and this is what
// is left where the trees run out (see R40).
export const WOODS_BG_COLOR = 0x16321f;
export const NIGHT_COLOR = 0x1a1a2e;

// How the woods recede: one tint and one grass colour per parallax band,
// ordered from the furthest band to the nearest. Together with the tint of the
// plane just behind the character these form one unbroken ramp — every plane
// is drawn darker than the plane in front of it, none of them shares a colour
// with its neighbour, and the character's own plane alone keeps full daylight
// colour (see R46). Kept here so the whole depth palette can be judged — and
// changed — in one place.
export const WOODS_BAND_TINT = [0x4c634b, 0x6e8a6b, 0x93ad8f];
// The band furthest back does not move at all and is drawn almost in the
// colour of the forest behind it: trees one only half sees.
export const WOODS_STILL_BAND_TINT = 0x2c4232;
export const WOODS_BAND_GRASS = [0x134416, 0x1b5e1f, 0x247629];

// The woods have a shaded plane behind the character: the flowers that do not
// crowd the player grow there, and the harmless ants crawl there. Everything
// on it is drawn in this tint so it reads as further into the forest.
export const WOODS_BACK_PLANE_TINT = 0xbdd0b8;
// That plane has ground of its own — a bank this many pixels higher than the
// ground the character runs on, so nothing standing on it hangs in the air.
// Its earth and grass are the front plane's colours under the tint above.
export const WOODS_BACK_PLANE_LIFT = 8;
export const WOODS_BACK_PLANE_EARTH = 0x66491f;
export const WOODS_BACK_PLANE_GRASS = 0x2f8e35;
export const WOODS_BACK_PLANE_GRASS_EDGE = 0x23722a;
// How fast a beetle climbs a trunk in the tree line, in pixels per second
export const BEETLE_CLIMB_SPEED = 14;

// The leaf roof hangs in front of everything, nearer than the character, so it
// sweeps past faster than the world as the player runs. Vertically it barely
// moves at all: a jump would otherwise slide the roof down out of the top of
// the screen and show open sky above the forest.
export const WOODS_CANOPY_FACTOR_X = 1.15;
export const WOODS_CANOPY_FACTOR_Y = 0.2;
export const WOODS_CANOPY_ALPHA = 0.86;
// A hint of sky above the crowns: from this world y down to the depth of the
// forest, the background lightens towards blue. It is fixed in the world, so
// the higher the character jumps the more of it comes into view.
export const WOODS_SKY_TOP_COLOR = 0x8fc8e8;
export const WOODS_SKY_DEPTH = 260;

// World y of the roof's upper edge, and how tall the strip is. The roof hangs
// deep enough to frame the picture but stops short of the height Fliegi flies
// at: leaves in front of the player may cover scenery, never a hazard.
export const WOODS_CANOPY_TOP = 37;
export const WOODS_CANOPY_HEIGHT = 276;

// The stick-figure player is drawn white and tinted to contrast the theme
export const PLAYER_TINT_DARK = 0x26262e;
export const PLAYER_TINT_LIGHT = 0xf5f5f5;
