import Phaser from 'phaser';
import * as C from '../config';
import { Controls } from '../controls';
import { LEVELS, LevelTheme } from '../levels';

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
  private controls!: Controls;
  private scoreText!: Phaser.GameObjects.Text;

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
  }

  create(): void {
    const { map: rows, theme } = LEVELS[this.levelIndex];
    const levelWidth = Math.max(...rows.map((r) => r.length)) * C.TILE;
    this.levelHeight = rows.length * C.TILE;

    this.cameras.main.setBackgroundColor(theme === 'cave' ? C.CAVE_BG_COLOR : C.SKY_COLOR);
    this.addBackdrop(levelWidth, theme);

    this.solids = this.physics.add.staticGroup();
    this.blocks = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.spiders = this.physics.add.group({ allowGravity: false });
    this.bats = this.physics.add.group({ allowGravity: false });

    let spawnX = 64;
    let spawnY = 64;
    const enemySpawns: { x: number; y: number }[] = [];
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
            this.solids.create(x, y, 'brick');
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
          case 'S':
            this.spawnSpider(x, r);
            break;
          case 'V':
            this.spawnBat(x, y);
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

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
    this.player.setSize(24, 30).setOffset(4, 2);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    this.physics.world.setBounds(0, -320, levelWidth, this.levelHeight + 640);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, levelWidth, Math.max(this.levelHeight, C.GAME_HEIGHT));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    for (const spawn of enemySpawns) {
      const enemy = this.enemies.create(spawn.x, spawn.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
      enemy.setSize(26, 22).setOffset(2, 4);
      enemy.setVelocityX(-C.ENEMY_SPEED);
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
    this.physics.add.overlap(this.player, this.coins, (_playerObj, coinObj) =>
      this.collectCoin(coinObj as Phaser.Physics.Arcade.Sprite),
    );
    this.physics.add.overlap(this.player, this.enemies, (_playerObj, enemyObj) =>
      this.touchEnemy(enemyObj as Phaser.Physics.Arcade.Sprite),
    );
    // Spiders and bats cannot be stomped — any contact is deadly
    this.physics.add.overlap(this.player, this.spiders, () => this.touchHazard());
    this.physics.add.overlap(this.player, this.bats, () => this.touchHazard());
    if (flagZone) {
      this.physics.add.overlap(this.player, flagZone, () => this.reachFlag());
    }

    this.createHud();
    this.controls = new Controls(this);
  }

  private addBackdrop(levelWidth: number, theme: LevelTheme): void {
    if (theme === 'cave') {
      for (let x = 40; x < levelWidth; x += 180) {
        this.add
          .image(x, 2 * C.TILE, 'stalactite')
          .setOrigin(0.5, 0)
          .setScale(0.7 + ((x / 180) % 3) * 0.35)
          .setScrollFactor(0.6, 1)
          .setDepth(0);
      }
      for (let x = 120; x < levelWidth; x += 300) {
        this.add
          .image(x, this.levelHeight - 2 * C.TILE, 'crystal')
          .setOrigin(0.5, 1)
          .setScrollFactor(0.6, 1)
          .setDepth(0)
          .setAlpha(0.7);
      }
      return;
    }
    for (let x = 60; x < levelWidth; x += 260) {
      this.add
        .image(x, 70 + ((x / 260) % 3) * 45, 'cloud')
        .setScrollFactor(0.25, 1)
        .setDepth(0);
    }
    for (let x = 90; x < levelWidth; x += 340) {
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
    for (const child of this.bats.getChildren()) {
      const bat = child as Phaser.Physics.Arcade.Sprite;
      const prevX = bat.getData('prevX') as number;
      if (bat.x !== prevX) bat.setFlipX(bat.x > prevX);
      bat.setData('prevX', bat.x);
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
      .text(16, 12, `SCORE ${this.score}`, style)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(C.GAME_WIDTH / 2, 12, `LEVEL ${this.levelIndex + 1}`, style)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .text(C.GAME_WIDTH - 16, 12, `LIVES ${this.lives}`, style)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private addScore(points: number): void {
    this.score += points;
    this.scoreText.setText(`SCORE ${this.score}`);
  }

  update(time: number): void {
    this.updateHazards();
    if (this.dead) return;

    this.controls.update();
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.finished) {
      this.player.setVelocityX(0);
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
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active || !enemy.body) continue;
      const body = enemy.body as Phaser.Physics.Arcade.Body;

      let vx = body.velocity.x;
      if (vx === 0) vx = -C.ENEMY_SPEED;
      if (body.blocked.left) vx = C.ENEMY_SPEED;
      else if (body.blocked.right) vx = -C.ENEMY_SPEED;

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
    this.addScore(C.FLAG_SCORE);
    this.player.setVelocityX(0);

    this.time.delayedCall(900, () => {
      this.scene.start('LevelComplete', {
        levelIndex: this.levelIndex,
        score: this.score,
        lives: this.lives,
      });
    });
  }
}
