import Phaser from 'phaser';
import { CharacterDef, getSelectedCharacter } from '../characters';
import * as C from '../config';
import { Controls } from '../controls';
import { LEVELS, LevelTheme } from '../levels';
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
  private spikies!: Phaser.Physics.Arcade.Group;
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
    this.timeLeft = C.LEVEL_TIME_SECONDS;
  }

  create(): void {
    const { map: rows, theme } = LEVELS[this.levelIndex];
    const levelWidth = Math.max(...rows.map((r) => r.length)) * C.TILE;
    this.levelHeight = rows.length * C.TILE;

    const bgColors = { cave: C.CAVE_BG_COLOR, meadow: C.SKY_COLOR, forest: C.FOREST_BG_COLOR };
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
    this.spikies = this.physics.add.group();

    let spawnX = 64;
    let spawnY = 64;
    const enemySpawns: { x: number; y: number }[] = [];
    const spikySpawns: { x: number; y: number }[] = [];
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
          case 'B':
            this.solids.create(x, y, theme === 'forest' ? 'log' : 'brick');
            this.solidTiles.add(`${c},${r}`);
            break;
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
            spikySpawns.push({ x, y });
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
          case 'W': {
            const above = r > 0 && rows[r - 1][c] === 'W';
            this.add.image(x, y, above ? 'water-deep' : 'water').setDepth(8);
            break;
          }
          case 'X':
            this.spawnFish(x, (r + 1) * C.TILE);
            break;
          case 'P':
            spawnX = x;
            spawnY = y;
            break;
          case 'F': {
            this.add.image(x, (r + 1) * C.TILE, 'flag').setOrigin(0.5, 1).setDepth(5);
            flagZone = this.add.zone(x, (r + 1) * C.TILE - 76, 20, 152);
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
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(C.CAMERA_ZOOM);
    this.addEdgePadding(rows, theme, levelWidth);

    for (const spawn of enemySpawns) {
      const enemy = this.enemies.create(spawn.x, spawn.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
      enemy.setSize(26, 22).setOffset(2, 4);
      enemy.setVelocityX(-C.ENEMY_SPEED);
    }
    for (const spawn of spikySpawns) {
      const spiky = this.spikies.create(spawn.x, spawn.y, 'spiky-0') as Phaser.Physics.Arcade.Sprite;
      // Hitbox stays one tile wide so it walks through gaps its spikes overhang
      spiky.setSize(30, 34).setOffset(9, 18).setDepth(7);
      spiky.setVelocityX(-C.SPIKY_SPEED);
      spiky.play('spiky-walk');
    }

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.blocks, (playerObj, blockObj) =>
      this.hitBlock(
        playerObj as Phaser.Physics.Arcade.Sprite,
        blockObj as Phaser.Physics.Arcade.Sprite,
      ),
    );
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.enemies, this.blocks);
    this.physics.add.collider(this.spikies, this.solids);
    this.physics.add.collider(this.spikies, this.blocks);
    this.physics.add.overlap(this.player, this.coins, (_playerObj, coinObj) =>
      this.collectCoin(coinObj as Phaser.Physics.Arcade.Sprite),
    );
    this.physics.add.overlap(this.player, this.enemies, (_playerObj, enemyObj) =>
      this.touchEnemy(enemyObj as Phaser.Physics.Arcade.Sprite),
    );
    // Spiders, bats, flies, fish, and Spiky cannot be stomped — any contact is deadly
    this.physics.add.overlap(this.player, this.spiders, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.bats, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.flies, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.fishes, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.spikies, () => this.touchHazard());
    if (flagZone) {
      this.physics.add.overlap(this.player, flagZone, () => this.reachFlag());
    }

    this.createHud();
    this.controls = new Controls(this);
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

  private addBackdrop(levelWidth: number, theme: LevelTheme): void {
    // Cover the camera's full range, including the edge padding on both sides
    const from = -C.GAME_WIDTH / 2;
    const to = levelWidth + C.GAME_WIDTH / 2;
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
      // Swamp mist drifting over the ground
      for (let x = from + 100, i = 0; x < to; x += 320, i++) {
        this.add
          .image(x, this.levelHeight - C.TILE * (1.5 + (i % 3) * 0.6), 'mist')
          .setScrollFactor(0.85, 1)
          .setDepth(9)
          .setAlpha(0.35);
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

  private touchHazard(): void {
    if (this.dead || this.finished) return;
    this.playerDie();
  }

  // Keep spider threads attached and bats facing their flight direction
  private updateHazards(): void {
    for (const child of this.spiders.getChildren()) {
      const spider = child as Phaser.Physics.Arcade.Sprite;
      const thread = spider.getData('thread') as Phaser.GameObjects.Image;
      thread.displayHeight = spider.y - (spider.getData('anchorY') as number);
    }
    for (const child of [...this.bats.getChildren(), ...this.flies.getChildren()]) {
      const flyer = child as Phaser.Physics.Arcade.Sprite;
      const prevX = flyer.getData('prevX') as number;
      if (flyer.x !== prevX) flyer.setFlipX(flyer.x > prevX);
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
      .text(0, 0, `LIVES ${this.lives}`, style)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
    placeOnHud(livesText, C.GAME_WIDTH - 16, 12);
  }

  private addScore(points: number): void {
    this.score += points;
    this.scoreText.setText(`SCORE ${this.score}`);
  }

  update(time: number, delta: number): void {
    this.updateHazards();
    if (this.dead) return;

    this.controls.update();
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.finished) {
      this.player.setVelocityX(0);
      return;
    }

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

    // Character animation: walk cycle on the ground, jump pose in the air
    if (!grounded) {
      this.player.stop();
      this.player.setTexture(this.character.jumpTexture);
    } else if (body.velocity.x !== 0) {
      this.player.play(this.character.walkAnim, true);
    } else {
      this.player.stop();
      this.player.setTexture(this.character.idleTexture);
    }
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

    this.updateEnemies();
  }

  private updateEnemies(): void {
    this.patrol(this.enemies, C.ENEMY_SPEED);
    this.patrol(this.spikies, C.SPIKY_SPEED);
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
    if (this.dead || this.finished || !enemy.active || !enemy.body) return;

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
      const lives = this.lives - 1;
      if (lives > 0) {
        this.scene.restart({ levelIndex: this.levelIndex, score: this.startScore, lives });
      } else {
        this.scene.start('GameOver', { score: this.score });
      }
    });
  }

  private reachFlag(): void {
    if (this.finished || this.dead) return;
    this.finished = true;
    const secondsLeft = Math.max(0, Math.ceil(this.timeLeft));
    const timeBonus = secondsLeft * C.TIME_BONUS_PER_SECOND;
    this.addScore(C.FLAG_SCORE + timeBonus);
    this.player.setVelocityX(0);

    this.time.delayedCall(900, () => {
      this.scene.start('LevelComplete', {
        levelIndex: this.levelIndex,
        score: this.score,
        lives: this.lives,
        secondsLeft,
        timeBonus,
      });
    });
  }
}
