import Phaser from 'phaser';
import { CharacterDef, getSelectedCharacter } from '../characters';
import * as C from '../config';
import { Controls } from '../controls';
import { isDevMode } from '../devmode';
import { LEVELS, LevelTheme } from '../levels';
import { startMusic } from '../music';
import { placeOnHud } from '../ui';

interface GameData {
  levelIndex?: number;
  score?: number;
  lives?: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private blocks!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private spiders!: Phaser.Physics.Arcade.Group;
  private bats!: Phaser.Physics.Arcade.Group;
  private flies!: Phaser.Physics.Arcade.Group;
  private fishes!: Phaser.Physics.Arcade.Group;
  private sparkies!: Phaser.Physics.Arcade.Group;
  private fliegis!: Phaser.Physics.Arcade.Group;
  private logs!: Phaser.Physics.Arcade.Group;
  private controls!: Controls;
  private character!: CharacterDef;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private timeLeft = C.LEVEL_TIME_SECONDS;

  private solidTiles = new Set<string>();
  private levelIndex = 0;
  private score = 0;
  private startScore = 0;
  private lives = C.START_LIVES;
  private levelHeight = 0;
  private lastGrounded = -10000;
  private lastJumpPress = -10000;
  private dead = false;
  private finished = false;
  // A level is entered and left as a little scene: 'intro' walks the character
  // in from the left screen edge, 'play' hands over to the player, and 'outro'
  // walks it off the right edge once the goal is reached.
  private phase: 'intro' | 'play' | 'outro' | 'done' = 'intro';
  private introTargetX = 0;
  private outroWalking = false;
  private outroStarted = 0;
  private logPhase = 0;
  private secondsLeft = 0;
  private timeBonus = 0;

  constructor() {
    super('Game');
  }

  init(data: GameData): void {
    this.levelIndex = data.levelIndex ?? 0;
    this.startScore = this.score = data.score ?? 0;
    this.lives = data.lives ?? C.START_LIVES;
    this.solidTiles = new Set();
    this.lastGrounded = -10000;
    this.lastJumpPress = -10000;
    this.dead = false;
    this.finished = false;
    this.phase = 'intro';
    this.outroWalking = false;
    this.outroStarted = 0;
    this.logPhase = 0;
    this.timeLeft = C.LEVEL_TIME_SECONDS;
  }

  create(): void {
    const { map: rows, theme } = LEVELS[this.levelIndex];
    const levelWidth = Math.max(...rows.map((r) => r.length)) * C.TILE;
    this.levelHeight = rows.length * C.TILE;

    const bgColors: Record<LevelTheme, number> = {
      cave: C.CAVE_BG_COLOR,
      meadow: C.SKY_COLOR,
      forest: C.FOREST_BG_COLOR,
      woods: C.WOODS_BG_COLOR,
    };
    this.cameras.main.setBackgroundColor(bgColors[theme]);
    this.addBackdrop(levelWidth, theme);

    this.solids = this.physics.add.staticGroup();
    this.blocks = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.spiders = this.physics.add.group({ allowGravity: false });
    this.bats = this.physics.add.group({ allowGravity: false });
    this.flies = this.physics.add.group({ allowGravity: false });
    this.fishes = this.physics.add.group({ allowGravity: false });
    this.sparkies = this.physics.add.group();
    this.fliegis = this.physics.add.group({ allowGravity: false });
    this.logs = this.physics.add.group({ allowGravity: false, immovable: true });

    let spawnX = 64;
    let spawnY = 64;
    const enemySpawns: { x: number; y: number }[] = [];
    const sparkySpawns: { x: number; y: number }[] = [];
    let flagZone: Phaser.GameObjects.Zone | undefined;

    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const x = c * C.TILE + C.TILE / 2;
        const y = r * C.TILE + C.TILE / 2;
        switch (row[c]) {
          case '#': {
            const above = r > 0 && rows[r - 1][c] === '#';
            const texture = theme === 'cave' ? 'rock' : above ? 'dirt' : 'ground';
            this.solids.create(x, y, texture);
            this.solidTiles.add(`${c},${r}`);
            break;
          }
          case 'B': {
            const platform =
              theme === 'forest' ? 'log' : theme === 'woods' ? 'log-moss' : 'brick';
            this.solids.create(x, y, platform);
            this.solidTiles.add(`${c},${r}`);
            break;
          }
          case '?':
            this.blocks.create(x, y, 'block').setData('used', false);
            break;
          case 'C':
            this.coins.create(x, y, 'coin');
            break;
          case 'E':
            enemySpawns.push({ x, y });
            break;
          case 'K':
            sparkySpawns.push({ x, y });
            break;
          case 'S':
            this.spawnSpider(x, r);
            break;
          case 'V':
            this.spawnBat(x, y);
            break;
          case 'G':
            this.spawnFly(x, y);
            break;
          case 'Y':
            this.spawnFliegi(x, y);
            break;
          case 'W': {
            const above = r > 0 && rows[r - 1][c] === 'W';
            const clear = theme === 'woods';
            const surface = clear ? 'stream' : 'water';
            const deep = clear ? 'stream-deep' : 'water-deep';
            this.add.image(x, y, above ? deep : surface).setDepth(8);
            break;
          }
          case 'L':
            this.spawnFloatLog(x, (r + 1) * C.TILE);
            break;
          case 'X':
            this.spawnFish(x, (r + 1) * C.TILE);
            break;
          case 'P':
            spawnX = x;
            spawnY = y;
            break;
          case 'F': {
            const base = (r + 1) * C.TILE;
            // In the woods the goal is a weathered, overgrown signpost;
            // the other levels keep their flag.
            const goal = theme === 'woods' ? 'signpost' : 'flag';
            this.add.image(x, base, goal).setOrigin(0.5, 1).setDepth(5);
            // The goal zone covers the flag's whole tile column, from far above
            // the level down to the ground: jumping over the flag from a nearby
            // platform still finishes the level instead of leaving it unfinishable.
            const top = -C.GAME_HEIGHT;
            flagZone = this.add.zone(x, (top + base) / 2, C.TILE, base - top);
            this.physics.add.existing(flagZone, true);
            break;
          }
        }
      }
    });

    this.character = getSelectedCharacter();
    this.player = this.physics.add.sprite(spawnX, spawnY, this.character.idleTexture);
    this.player.setSize(...this.character.bodySize).setOffset(...this.character.bodyOffset);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    if (this.character.tintByTheme) {
      this.player.setTint(theme === 'cave' ? C.PLAYER_TINT_LIGHT : C.PLAYER_TINT_DARK);
    }

    this.physics.world.setBounds(0, -320, levelWidth, this.levelHeight + 640);
    this.physics.world.setBoundsCollision(true, true, false, false);
    // Camera bounds extend half a screen past both level ends so the player
    // stays centered even at the world bounds and never reaches a screen edge.
    // The area beyond the ends is filled with visual-only terrain padding.
    const pad = C.GAME_WIDTH / 2;
    this.cameras.main.setBounds(
      -pad,
      0,
      levelWidth + 2 * pad,
      Math.max(this.levelHeight, C.GAME_HEIGHT),
    );
    this.cameras.main.setZoom(C.CAMERA_ZOOM);
    this.addEdgePadding(rows, theme, levelWidth);
    if (theme === 'woods') {
      this.addWoodsGroundCover(rows, levelWidth);
    }

    for (const spawn of enemySpawns) {
      const enemy = this.enemies.create(spawn.x, spawn.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
      enemy.setSize(26, 22).setOffset(2, 4);
      enemy.setVelocityX(-C.ENEMY_SPEED);
    }
    for (const spawn of sparkySpawns) {
      const sparky = this.sparkies.create(spawn.x, spawn.y, 'sparky-0') as Phaser.Physics.Arcade.Sprite;
      // Hitbox stays one tile wide so it walks through gaps its spikes overhang
      sparky.setSize(30, 32).setOffset(9, 16).setDepth(7);
      sparky.setVelocityX(-C.SPARKY_SPEED);
      sparky.play('sparky-walk');
    }

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.logs);
    this.physics.add.collider(this.player, this.blocks, (playerObj, blockObj) =>
      this.hitBlock(
        playerObj as Phaser.Physics.Arcade.Sprite,
        blockObj as Phaser.Physics.Arcade.Sprite,
      ),
    );
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.enemies, this.blocks);
    this.physics.add.collider(this.sparkies, this.solids);
    this.physics.add.collider(this.sparkies, this.blocks);
    this.physics.add.overlap(this.player, this.coins, (_playerObj, coinObj) =>
      this.collectCoin(coinObj as Phaser.Physics.Arcade.Sprite),
    );
    this.physics.add.overlap(this.player, this.enemies, (_playerObj, enemyObj) =>
      this.touchEnemy(enemyObj as Phaser.Physics.Arcade.Sprite),
    );
    // Spiders, bats, flies, fish, and Sparky cannot be stomped — any contact is deadly
    this.physics.add.overlap(this.player, this.spiders, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.bats, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.flies, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.fishes, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.sparkies, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.fliegis, () => this.touchHazard());
    if (flagZone) {
      this.physics.add.overlap(this.player, flagZone, () => this.reachFlag());
    }

    this.createHud();
    this.controls = new Controls(this);
    if (isDevMode()) {
      this.addPauseControl();
    }
    startMusic(this);
    this.startIntro();
  }

  // Entering a level: the camera looks ahead into the level while the
  // character walks in from the left screen edge. Only when it reaches the
  // middle of the screen do the controls appear and the timer start.
  private startIntro(): void {
    const halfView = C.GAME_WIDTH / (2 * C.CAMERA_ZOOM);
    this.introTargetX = this.player.x + halfView + C.INTRO_LEAD_IN;
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(this.introTargetX, this.player.y);
    this.player.setFlipX(false);
  }

  private endIntro(): void {
    this.phase = 'play';
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.controls.reveal();
  }

  // Continues '#' terrain rows as non-physical images half a screen past both
  // level ends, so the extended camera range never shows a void.
  private addEdgePadding(rows: string[], theme: LevelTheme, levelWidth: number): void {
    const padTiles = C.GAME_WIDTH / 2 / C.TILE;
    const maxCols = levelWidth / C.TILE;
    const texFor = (above: boolean): string =>
      theme === 'cave' ? 'rock' : above ? 'dirt' : 'ground';
    rows.forEach((row, r) => {
      const solidAbove = r > 0 && rows[r - 1];
      for (const [edgeCol, dir] of [
        [0, -1],
        [maxCols - 1, 1],
      ] as const) {
        if (row[edgeCol] !== '#') continue;
        const texture = texFor(!!solidAbove && rows[r - 1][edgeCol] === '#');
        for (let i = 1; i <= padTiles; i++) {
          const x = (edgeCol + dir * i) * C.TILE + C.TILE / 2;
          this.add.image(x, r * C.TILE + C.TILE / 2, texture).setDepth(1);
        }
      }
    });
  }

  // A repeatable pseudo-random value for a column, so the scattered forest
  // decoration looks natural but comes out the same on every playthrough.
  private static noise(n: number): number {
    const value = Math.sin(n * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  // The woods: layer after layer of trees. Three parallax bands of trunks
  // and crowns, sunbeams falling through the canopy, undergrowth along the
  // ground line, and a few near trunks passing in front of the player.
  private addWoodsBackdrop(from: number, to: number): void {
    const surfaceY = this.levelHeight - 2 * C.TILE;
    const trees = ['woods-tree-0', 'woods-tree-1', 'woods-tree-2'];
    const layers = [
      { step: 82, factor: 0.3, scale: 0.42, alpha: 0.6, tint: 0x9dc0a6, depth: -6 },
      { step: 116, factor: 0.55, scale: 0.62, alpha: 0.85, tint: 0xc5dcbf, depth: -5 },
      { step: 166, factor: 0.82, scale: 0.88, alpha: 1, tint: 0xffffff, depth: -4 },
    ];
    layers.forEach((layer, l) => {
      for (let x = from + l * 41, i = 0; x < to; x += layer.step, i++) {
        const n = GameScene.noise(x + l * 100);
        this.add
          .image(x + n * 24, surfaceY + 6 + (i % 3) * 4, trees[(i + l) % trees.length])
          .setOrigin(0.5, 1)
          .setScale(layer.scale * (0.85 + n * 0.35))
          .setScrollFactor(layer.factor, 1)
          .setDepth(layer.depth)
          .setAlpha(layer.alpha)
          .setTint(layer.tint);
      }
    });

    // Sunlight breaking through the leaves
    for (let x = from + 120, i = 0; x < to; x += 430, i++) {
      this.add
        .image(x, -40, 'sunbeam')
        .setOrigin(0.5, 0)
        .setScale(1 + (i % 2) * 0.5, 1.6)
        .setScrollFactor(0.7, 1)
        .setDepth(-3);
    }

    // Undergrowth right along the tree line
    for (let x = from + 60, i = 0; x < to; x += 104, i++) {
      const n = GameScene.noise(x * 0.5);
      this.add
        .image(x, surfaceY + 4, n > 0.5 ? 'woods-bush' : 'woods-fern')
        .setOrigin(0.5, 1)
        .setScale(0.7 + n * 0.5)
        .setScrollFactor(0.82, 1)
        .setDepth(-4);
    }

    // The leaf roof overhead: the level is played under the canopy, not in
    // an open field.
    for (let x = from, i = 0; x < to; x += 250, i++) {
      this.add
        .image(x, 236 + (i % 3) * 16, i % 2 === 0 ? 'canopy-0' : 'canopy-1')
        .setOrigin(0.5, 1)
        .setScale(1.1, 1.4)
        .setScrollFactor(0.45, 1)
        .setDepth(-6)
        .setTint(0xdff0d8);
    }
    for (let x = from + 90, i = 0; x < to; x += 300, i++) {
      this.add
        .image(x, 268 + (i % 2) * 20, i % 2 === 0 ? 'canopy-1' : 'canopy-0')
        .setOrigin(0.5, 1)
        .setScale(1, 1.5)
        .setScrollFactor(0.72, 1)
        .setDepth(-3);
    }

    // A handful of trunks passing in front of the player for depth. They are
    // translucent so the character always stays readable, and they stop well
    // before the end of the level so nothing stands in front of the goal.
    for (let x = from + 260, i = 0; x < to - 1080; x += 700, i++) {
      this.add
        .image(x, surfaceY + 10, 'woods-trunk-near')
        .setOrigin(0.5, 1)
        .setScale(0.75 + (i % 2) * 0.2)
        .setScrollFactor(1.14, 1)
        .setDepth(20)
        .setAlpha(0.7)
        .setTint(0x9c8f76);
    }
  }

  // Forest floor: mushrooms, flowers, grass and pebbles on every ground
  // surface, plus ants and beetles going about their business. None of it is
  // solid or dangerous — it is there to make the woods feel alive.
  private addWoodsGroundCover(rows: string[], levelWidth: number): void {
    const surfaceRow = new Map<number, number>();
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '#' && (r === 0 || rows[r - 1][c] !== '#') && !surfaceRow.has(c)) {
          surfaceRow.set(c, r);
        }
      }
    });

    const padTiles = C.GAME_WIDTH / 2 / C.TILE;
    const maxCols = levelWidth / C.TILE;
    const plants = [
      'grass-tuft',
      'flower-0',
      'mushroom-red',
      'grass-tuft',
      'flower-1',
      'mushroom-brown',
      'grass-tuft',
      'flower-2',
      'pebble',
      'woods-fern',
    ];

    // The decoration continues into the terrain padding beyond both level
    // ends, which is what the camera shows during the walk-in and walk-off.
    const surfaceAt = (c: number): number | undefined =>
      surfaceRow.get(Phaser.Math.Clamp(c, 0, maxCols - 1));

    for (let c = -padTiles; c < maxCols + padTiles; c++) {
      const row = surfaceAt(c);
      if (row === undefined) continue;
      const y = row * C.TILE + 2;
      const n = GameScene.noise(c);
      if (n < 0.34) continue;
      const count = n > 0.88 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const m = GameScene.noise(c * 3 + i * 7);
        this.add
          .image(c * C.TILE + 6 + m * 20, y, plants[Math.floor(m * plants.length)])
          .setOrigin(0.5, 1)
          .setScale(0.8 + m * 0.4)
          .setDepth(2);
      }
    }

    this.addWoodsCritters(surfaceRow, maxCols);
  }

  // Ants and beetles crawling to and fro on the forest floor
  private addWoodsCritters(surfaceRow: Map<number, number>, maxCols: number): void {
    for (let c = 6; c < maxCols; c += 11) {
      const row = surfaceRow.get(c);
      if (row === undefined) continue;
      const n = GameScene.noise(c * 5);
      if (n < 0.45) continue;
      const ant = n < 0.78;
      const x = c * C.TILE + 16;
      const range = ant ? 60 : 40;
      // Both critters are drawn facing left, so they are flipped while
      // crawling to the right.
      const critter = this.add
        .sprite(x, row * C.TILE + 3, ant ? 'ant-0' : 'beetle-0')
        .setOrigin(0.5, 1)
        .setDepth(3)
        .setScale(ant ? 0.9 : 1)
        .setFlipX(true);
      critter.play(ant ? 'ant-crawl' : 'beetle-crawl');
      this.tweens.add({
        targets: critter,
        x: x + range,
        duration: (range / (ant ? 22 : 14)) * 1000,
        yoyo: true,
        repeat: -1,
        hold: 400,
        repeatDelay: 700,
        delay: (c * 137) % 2600,
        onYoyo: () => critter.setFlipX(false),
        onRepeat: () => critter.setFlipX(true),
      });
    }
  }

  private addBackdrop(levelWidth: number, theme: LevelTheme): void {
    // Cover the camera's full range, including the edge padding on both sides
    const from = -C.GAME_WIDTH / 2;
    const to = levelWidth + C.GAME_WIDTH / 2;
    if (theme === 'woods') {
      this.addWoodsBackdrop(from, to);
      return;
    }
    if (theme === 'forest') {
      for (let x = from + 70, i = 0; x < to; x += 220, i++) {
        this.add
          .image(x, this.levelHeight - 2 * C.TILE, 'tree')
          .setOrigin(0.5, 1)
          .setScale(0.8 + (i % 3) * 0.25)
          .setScrollFactor(0.5, 1)
          .setDepth(0)
          .setAlpha(0.55);
      }
      for (let x = from + 160, i = 0; x < to; x += 260, i++) {
        this.add
          .image(x, this.levelHeight - 2 * C.TILE, i % 3 === 2 ? 'bush' : 'tree')
          .setOrigin(0.5, 1)
          .setScrollFactor(0.7, 1)
          .setDepth(0);
      }
      // Swamp mist: a low veil hanging above the ground line. Anchored by its
      // bottom edge to the terrain surface, so it never sinks into the ground
      // or settles on the water; the strips overlap into one drifting band.
      const surfaceY = this.levelHeight - 2 * C.TILE;
      for (let x = from + 100, i = 0; x < to; x += 200, i++) {
        this.add
          .image(x, surfaceY - 6 - (i % 3) * 18, 'mist')
          .setOrigin(0.5, 1)
          .setScale(1 + (i % 2) * 0.3, 1)
          .setScrollFactor(0.85, 1)
          .setDepth(9)
          .setAlpha(0.4 - (i % 3) * 0.08);
      }
      return;
    }
    if (theme === 'cave') {
      for (let x = from + 40, i = 0; x < to; x += 180, i++) {
        this.add
          .image(x, 2 * C.TILE, 'stalactite')
          .setOrigin(0.5, 0)
          .setScale(0.7 + (i % 3) * 0.35)
          .setScrollFactor(0.6, 1)
          .setDepth(0);
      }
      for (let x = from + 120; x < to; x += 300) {
        this.add
          .image(x, this.levelHeight - 2 * C.TILE, 'crystal')
          .setOrigin(0.5, 1)
          .setScrollFactor(0.6, 1)
          .setDepth(0)
          .setAlpha(0.7);
      }
      return;
    }
    for (let x = from + 60, i = 0; x < to; x += 260, i++) {
      this.add
        .image(x, 70 + (i % 3) * 45, 'cloud')
        .setScrollFactor(0.25, 1)
        .setDepth(0);
    }
    for (let x = from + 90; x < to; x += 340) {
      this.add
        .image(x, this.levelHeight - 2 * C.TILE, 'hill')
        .setOrigin(0.5, 1)
        .setScrollFactor(0.5, 1)
        .setDepth(0);
    }
  }

  // Spider: hangs below the ceiling and bobs up and down on its thread
  private spawnSpider(x: number, anchorRow: number): void {
    const anchorY = anchorRow * C.TILE;
    const thread = this.add.image(x, anchorY, 'thread').setOrigin(0.5, 0).setDepth(5);
    const spider = this.spiders.create(x, anchorY + 24, 'spider') as Phaser.Physics.Arcade.Sprite;
    spider.setSize(20, 16).setDepth(6);
    spider.setData('thread', thread);
    spider.setData('anchorY', anchorY);
    this.tweens.add({
      targets: spider,
      y: anchorY + C.SPIDER_DROP,
      duration: C.SPIDER_SPEED_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: (x * 7) % 1300,
    });
  }

  // Bat: patrols horizontally with a slight vertical wobble
  private spawnBat(x: number, y: number): void {
    const bat = this.bats.create(x, y, 'bat') as Phaser.Physics.Arcade.Sprite;
    bat.setSize(24, 12).setDepth(6);
    bat.setData('prevX', x);
    this.tweens.add({
      targets: bat,
      x: { from: x - C.BAT_RANGE_X, to: x + C.BAT_RANGE_X },
      duration: C.BAT_SPEED_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: (x * 3) % 900,
    });
    this.tweens.add({
      targets: bat,
      y: y + C.BAT_RANGE_Y,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // Giant fly: buzzes around its spawn point, faster and wider than a bat
  private spawnFly(x: number, y: number): void {
    const fly = this.flies.create(x, y, 'fly-0') as Phaser.Physics.Arcade.Sprite;
    fly.setSize(30, 18).setDepth(6);
    fly.setData('prevX', x);
    fly.play('fly-buzz');
    this.tweens.add({
      targets: fly,
      x: { from: x - C.FLY_RANGE_X, to: x + C.FLY_RANGE_X },
      duration: C.FLY_SPEED_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: (x * 5) % 1100,
    });
    this.tweens.add({
      targets: fly,
      y: y + C.FLY_RANGE_Y,
      duration: C.FLY_SPEED_MS * 0.37,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // Fish: leaps out of its pool, arcs, and dives back in on a fixed rhythm
  private spawnFish(x: number, surfaceY: number): void {
    const fish = this.fishes.create(x, surfaceY + 28, 'fish') as Phaser.Physics.Arcade.Sprite;
    fish.setSize(16, 26).setDepth(4);
    fish.setData('prevY', fish.y);
    this.tweens.add({
      targets: fish,
      y: surfaceY - C.FISH_JUMP_HEIGHT,
      duration: C.FISH_RISE_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeOut',
      loopDelay: C.FISH_PAUSE_MS,
      delay: (x * 3) % 1400,
    });
  }

  // Floating log: a trunk drifting on the water that the player rides across.
  // Its deck sits exactly at bank height, so stepping on and off is seamless.
  private spawnFloatLog(x: number, surfaceY: number): void {
    const log = this.logs.create(x, surfaceY + 9, 'float-log') as Phaser.Physics.Arcade.Sprite;
    log.setSize(94, 14).setOffset(2, 6).setDepth(9);
    log.setData('homeX', x);
    log.setData('dx', 0);
  }

  // Every log follows the same sine, so neighbouring logs keep their spacing
  // and drift as one raft of stepping stones.
  private updateLogs(delta: number): void {
    const logs = this.logs.getChildren();
    if (logs.length === 0) return;
    this.logPhase += (delta / C.LOG_PERIOD_MS) * Math.PI * 2;
    const offset = Math.sin(this.logPhase) * C.LOG_RANGE_X;
    for (const child of logs) {
      const log = child as Phaser.Physics.Arcade.Sprite;
      const previous = log.x;
      log.x = (log.getData('homeX') as number) + offset;
      log.setData('dx', log.x - previous);
    }
  }

  // Arcade physics does not move riders along with a platform, so a player
  // standing on a log is shifted by the same amount as the log itself.
  private carryOnLog(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down && !body.touching.down) return;
    for (const child of this.logs.getChildren()) {
      const log = child as Phaser.Physics.Arcade.Sprite;
      const deck = log.body as Phaser.Physics.Arcade.Body;
      if (body.bottom < deck.top - 2 || body.bottom > deck.top + 16) continue;
      if (body.right < deck.left || body.left > deck.right) continue;
      this.player.x += log.getData('dx') as number;
      return;
    }
  }

  // Fliegi: flies one continuous figure-eight around its spawn point
  private spawnFliegi(x: number, y: number): void {
    const fliegi = this.fliegis.create(x, y, 'fliegi-0') as Phaser.Physics.Arcade.Sprite;
    fliegi.setSize(28, 26).setOffset(17, 14).setDepth(6);
    fliegi.play('fliegi-fly');
    // A single phase drives both axes. Because the horizontal position is a
    // sine of that phase, Fliegi slows to a stop at each side and accelerates
    // back out — no hard turn — and the vertical sine simply keeps running,
    // so the wave continues instead of being mirrored on the way back.
    const state = { phase: (x * 0.017) % (Math.PI * 2) };
    this.tweens.add({
      targets: state,
      phase: state.phase + Math.PI * 2,
      duration: C.FLIEGI_LOOP_MS,
      repeat: -1,
      ease: 'Linear',
      onUpdate: () => {
        fliegi.x = x + Math.sin(state.phase) * C.FLIEGI_RANGE_X;
        fliegi.y = y + Math.sin(state.phase * C.FLIEGI_WAVE_CYCLES) * C.FLIEGI_WAVE_Y;
      },
    });
  }

  private touchHazard(): void {
    if (this.dead || this.phase !== 'play') return;
    this.playerDie();
  }

  // Keep spider threads attached and flyers facing their flight direction
  private updateHazards(): void {
    for (const child of this.spiders.getChildren()) {
      const spider = child as Phaser.Physics.Arcade.Sprite;
      const thread = spider.getData('thread') as Phaser.GameObjects.Image;
      thread.displayHeight = spider.y - (spider.getData('anchorY') as number);
    }
    // Bats and flies are drawn in profile, so they turn with their flight
    // direction. Fliegi faces the viewer head-on — mirroring it would swap
    // its feelers and grin from side to side, so it is never flipped.
    for (const child of [...this.bats.getChildren(), ...this.flies.getChildren()]) {
      const flyer = child as Phaser.Physics.Arcade.Sprite;
      const prevX = flyer.getData('prevX') as number;
      if (Math.abs(flyer.x - prevX) > 0.3) flyer.setFlipX(flyer.x > prevX);
      flyer.setData('prevX', flyer.x);
    }
    // Fish look up while rising and down while falling
    for (const child of this.fishes.getChildren()) {
      const fish = child as Phaser.Physics.Arcade.Sprite;
      const prevY = fish.getData('prevY') as number;
      if (fish.y !== prevY) fish.setFlipY(fish.y > prevY);
      fish.setData('prevY', fish.y);
    }
  }

  private createHud(): void {
    const style = {
      fontFamily: 'monospace',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    };
    this.scoreText = this.add
      .text(0, 0, `SCORE ${this.score}`, style)
      .setScrollFactor(0)
      .setDepth(100);
    placeOnHud(this.scoreText, 16, 12);
    const levelText = this.add
      .text(0, 0, `LEVEL ${this.levelIndex + 1}`, style)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);
    placeOnHud(levelText, C.GAME_WIDTH * 0.38, 12);
    this.timeText = this.add
      .text(0, 0, `TIME ${this.timeLeft}`, style)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);
    placeOnHud(this.timeText, C.GAME_WIDTH * 0.62, 12);
    const livesText = this.add
      .text(0, 0, `LIVES ${isDevMode() ? '\u221e' : this.lives}`, style)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
    placeOnHud(livesText, C.GAME_WIDTH - 16, 12);
  }

  // Developer mode: pause via P/ESC or an on-screen button (for touch devices)
  private addPauseControl(): void {
    const button = this.add
      .image(0, 0, 'btn-pause')
      .setScrollFactor(0)
      .setDepth(210)
      .setInteractive({ useHandCursor: true });
    placeOnHud(button, 34, 62);
    button.on('pointerdown', () => this.pauseGame());
    this.input.keyboard!.on('keydown-P', () => this.pauseGame());
    this.input.keyboard!.on('keydown-ESC', () => this.pauseGame());
  }

  private pauseGame(): void {
    if (this.dead || this.finished || this.scene.isPaused()) return;
    this.scene.launch('Pause');
    this.scene.pause();
  }

  private addScore(points: number): void {
    this.score += points;
    this.scoreText.setText(`SCORE ${this.score}`);
  }

  update(time: number, delta: number): void {
    this.updateHazards();
    this.updateLogs(delta);
    if (this.dead || this.phase === 'done') return;

    if (this.phase === 'intro') {
      this.updateIntro();
      return;
    }
    if (this.phase === 'outro') {
      this.updateOutro(time);
      return;
    }

    this.controls.update();
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Level timer: running out costs a life
    this.timeLeft -= delta / 1000;
    const seconds = Math.max(0, Math.ceil(this.timeLeft));
    this.timeText.setText(`TIME ${seconds}`);
    this.timeText.setColor(seconds <= 10 ? '#ff5544' : '#ffffff');
    if (this.timeLeft <= 0) {
      const timeUp = this.add
        .text(0, 0, 'TIME UP!', {
          fontFamily: 'monospace',
          fontSize: '56px',
          fontStyle: 'bold',
          color: '#ff5544',
          stroke: '#000000',
          strokeThickness: 8,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(150);
      placeOnHud(timeUp, C.GAME_WIDTH / 2, C.GAME_HEIGHT / 2 - 60);
      this.playerDie();
      return;
    }

    // Horizontal movement
    if (this.controls.left) {
      this.player.setVelocityX(-C.PLAYER_SPEED);
      this.player.setFlipX(true);
    } else if (this.controls.right) {
      this.player.setVelocityX(C.PLAYER_SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Jumping with coyote time and a small input buffer
    const grounded = body.blocked.down || body.touching.down;

    this.animateCharacter(grounded, body.velocity.x !== 0);
    if (grounded) this.lastGrounded = time;
    if (this.controls.jumpPressed) this.lastJumpPress = time;

    const canJump = grounded || time - this.lastGrounded < C.COYOTE_MS;
    if (canJump && time - this.lastJumpPress < C.JUMP_BUFFER_MS) {
      this.player.setVelocityY(C.JUMP_VELOCITY);
      this.lastGrounded = -10000;
      this.lastJumpPress = -10000;
    }

    // Variable jump height: releasing jump early cuts the ascent
    if (!this.controls.jumpHeld && body.velocity.y < C.JUMP_CUT_VELOCITY) {
      this.player.setVelocityY(C.JUMP_CUT_VELOCITY);
    }

    // Fell out of the level
    if (this.player.y > this.levelHeight + C.TILE) {
      this.playerDie();
      return;
    }

    this.carryOnLog();
    this.updateEnemies();
  }

  // Walk cycle on the ground, jump pose in the air
  private animateCharacter(grounded: boolean, moving: boolean): void {
    if (!grounded) {
      this.player.stop();
      this.player.setTexture(this.character.jumpTexture);
    } else if (moving) {
      this.player.play(this.character.walkAnim, true);
    } else {
      this.player.stop();
      this.player.setTexture(this.character.idleTexture);
    }
  }

  // Walking into the level: the character strolls in from the left screen
  // edge and hands over to the player once it stands in the middle.
  private updateIntro(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setVelocityX(C.PLAYER_SPEED);
    this.animateCharacter(body.blocked.down || body.touching.down, true);
    // Failsafe: should the ground give way during the walk-in, hand over
    // right away instead of staying stuck in the intro.
    if (this.player.y > this.levelHeight) {
      this.endIntro();
      return;
    }
    if (this.player.x >= this.introTargetX) {
      this.player.x = this.introTargetX;
      this.player.setVelocityX(0);
      this.endIntro();
    }
  }

  // Walking out of the level: once the character has landed at the signpost it
  // carries on past the right screen edge — the terrain ends with the level,
  // so it walks on without colliding with anything.
  private updateOutro(time: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!this.outroWalking) {
      const landed = body.blocked.down || body.touching.down;
      if (!landed && time - this.outroStarted < 1500) {
        this.player.setVelocityX(0);
        this.animateCharacter(false, false);
        return;
      }
      this.outroWalking = true;
      body.setAllowGravity(false);
      body.checkCollision.none = true;
      this.player.setCollideWorldBounds(false);
      this.player.setVelocityY(0);
    }

    this.player.setVelocityX(C.PLAYER_SPEED);
    this.player.setFlipX(false);
    this.animateCharacter(true, true);
    if (this.player.x > this.cameras.main.worldView.right + C.OUTRO_MARGIN) {
      this.phase = 'done';
      this.scene.start('LevelComplete', {
        levelIndex: this.levelIndex,
        score: this.score,
        lives: this.lives,
        secondsLeft: this.secondsLeft,
        timeBonus: this.timeBonus,
      });
    }
  }

  private updateEnemies(): void {
    this.patrol(this.enemies, C.ENEMY_SPEED);
    this.patrol(this.sparkies, C.SPARKY_SPEED);
  }

  // Walk back and forth, turning around at walls and ledges
  private patrol(group: Phaser.Physics.Arcade.Group, speed: number): void {
    for (const child of group.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active || !enemy.body) continue;
      const body = enemy.body as Phaser.Physics.Arcade.Body;

      let vx = body.velocity.x;
      if (vx === 0) vx = -speed;
      if (body.blocked.left) vx = speed;
      else if (body.blocked.right) vx = -speed;

      // Turn around at ledges instead of walking off
      if (body.blocked.down) {
        const dir = Math.sign(vx);
        const aheadCol = Math.floor((enemy.x + dir * 18) / C.TILE);
        const belowRow = Math.floor((body.bottom + 4) / C.TILE);
        if (!this.solidTiles.has(`${aheadCol},${belowRow}`)) {
          vx = -vx;
        }
      }

      enemy.setVelocityX(vx);
      enemy.setFlipX(vx > 0);

      if (enemy.y > this.levelHeight + C.TILE * 4) {
        enemy.destroy();
      }
    }
  }

  private hitBlock(player: Phaser.Physics.Arcade.Sprite, block: Phaser.Physics.Arcade.Sprite): void {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    if (!playerBody.touching.up || block.getData('used')) return;

    block.setData('used', true);
    block.setTexture('block-used');

    const coin = this.add.image(block.x, block.y - C.TILE, 'coin').setDepth(6);
    this.tweens.add({
      targets: coin,
      y: coin.y - 40,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => coin.destroy(),
    });
    this.addScore(C.BLOCK_COIN_SCORE);
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
    coin.disableBody(true, true);
    const pop = this.add.image(coin.x, coin.y, 'coin').setDepth(6);
    this.tweens.add({
      targets: pop,
      y: pop.y - 30,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => pop.destroy(),
    });
    this.addScore(C.COIN_SCORE);
  }

  private touchEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    if (this.dead || this.phase !== 'play' || !enemy.active || !enemy.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
    const stomped = playerBody.velocity.y > 0 && playerBody.bottom < enemyBody.top + 12;

    if (stomped) {
      enemyBody.enable = false;
      this.tweens.add({
        targets: enemy,
        scaleY: 0.2,
        alpha: 0,
        duration: 250,
        onComplete: () => enemy.destroy(),
      });
      this.player.setVelocityY(C.STOMP_BOUNCE);
      this.addScore(C.ENEMY_SCORE);
    } else {
      this.playerDie();
    }
  }

  private playerDie(): void {
    if (this.dead) return;
    this.dead = true;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.checkCollision.none = true;
    this.player.setVelocity(0, -420);
    this.tweens.add({ targets: this.player, angle: 360, duration: 800 });
    this.cameras.main.shake(200, 0.008);

    this.time.delayedCall(900, () => {
      const lives = isDevMode() ? this.lives : this.lives - 1;
      if (lives > 0) {
        this.scene.restart({ levelIndex: this.levelIndex, score: this.startScore, lives });
      } else {
        this.scene.start('GameOver', { score: this.score });
      }
    });
  }

  // Reaching the goal hides the controls again and starts the walk-off
  private reachFlag(): void {
    if (this.finished || this.dead) return;
    this.finished = true;
    this.phase = 'outro';
    this.outroStarted = this.time.now;
    this.outroWalking = false;
    this.secondsLeft = Math.max(0, Math.ceil(this.timeLeft));
    this.timeBonus = this.secondsLeft * C.TIME_BONUS_PER_SECOND;
    this.addScore(C.FLAG_SCORE + this.timeBonus);
    this.controls.conceal();
    this.cameras.main.stopFollow();
    this.player.setVelocityX(0);
  }
}
