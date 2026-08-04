import Phaser from 'phaser';

// Generates every texture at runtime — the game ships zero image assets.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const g = this.add.graphics();

    // Ground tile (dirt with grass top)
    g.fillStyle(0x8a5a2b);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x6b421f);
    g.fillRect(6, 16, 5, 4);
    g.fillRect(20, 24, 6, 4);
    g.fillRect(13, 27, 4, 3);
    g.fillStyle(0x3fae4a);
    g.fillRect(0, 0, 32, 8);
    g.fillStyle(0x2f8c3a);
    g.fillRect(0, 6, 32, 2);
    g.generateTexture('ground', 32, 32);
    g.clear();

    // Plain dirt tile (ground below the surface)
    g.fillStyle(0x8a5a2b);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x6b421f);
    g.fillRect(4, 6, 6, 4);
    g.fillRect(22, 12, 5, 4);
    g.fillRect(10, 22, 5, 4);
    g.generateTexture('dirt', 32, 32);
    g.clear();

    // Brick block
    g.fillStyle(0xc2571f);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x8f3d12);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 15, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(15, 2, 2, 13);
    g.fillRect(7, 17, 2, 13);
    g.fillRect(23, 17, 2, 13);
    g.generateTexture('brick', 32, 32);
    g.clear();

    // Cave rock tile
    g.fillStyle(0x4a4257);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x5d5470);
    g.fillRect(0, 0, 32, 4);
    g.fillStyle(0x352f42);
    g.fillRect(5, 10, 7, 5);
    g.fillRect(20, 18, 8, 5);
    g.fillRect(10, 25, 6, 4);
    g.generateTexture('rock', 32, 32);
    g.clear();

    // Spider (hangs from a thread)
    g.lineStyle(2, 0x2b2b35);
    g.lineBetween(13, 10, 2, 4);
    g.lineBetween(13, 12, 1, 12);
    g.lineBetween(13, 14, 2, 19);
    g.lineBetween(13, 10, 24, 4);
    g.lineBetween(13, 12, 25, 12);
    g.lineBetween(13, 14, 24, 19);
    g.fillStyle(0x2b2b35);
    g.fillCircle(13, 12, 8);
    g.fillStyle(0xff5544);
    g.fillCircle(10, 10, 2);
    g.fillCircle(16, 10, 2);
    g.generateTexture('spider', 26, 20);
    g.clear();

    // Spider thread (stretched to the current thread length at runtime)
    g.fillStyle(0xdddddd, 0.7);
    g.fillRect(0, 0, 2, 8);
    g.generateTexture('thread', 2, 8);
    g.clear();

    // Bat
    g.fillStyle(0x3a2f52);
    g.fillTriangle(0, 2, 12, 6, 6, 14);
    g.fillTriangle(30, 2, 18, 6, 24, 14);
    g.fillStyle(0x241c38);
    g.fillCircle(15, 8, 6);
    g.fillStyle(0xffd700);
    g.fillCircle(12, 7, 1.5);
    g.fillCircle(18, 7, 1.5);
    g.generateTexture('bat', 30, 16);
    g.clear();

    // Giant fly, two frames for the wing flap (faces left, flipped at runtime)
    const flyFrame = (name: string, wingY: number, wingRy: number): void => {
      g.fillStyle(0xcfe8ff, 0.55);
      g.fillEllipse(16, wingY, 20, wingRy * 2);
      g.fillEllipse(32, wingY, 20, wingRy * 2);
      g.fillStyle(0x33303c);
      g.fillEllipse(24, 20, 28, 18);
      g.lineStyle(2, 0x33303c);
      g.lineBetween(16, 28, 12, 32);
      g.lineBetween(24, 29, 22, 32);
      g.lineBetween(32, 28, 36, 32);
      g.fillStyle(0xe23b3b);
      g.fillCircle(11, 16, 5);
      g.fillStyle(0xff8f8f);
      g.fillCircle(9, 14, 2);
      g.generateTexture(name, 44, 32);
      g.clear();
    };
    flyFrame('fly-0', 8, 5);
    flyFrame('fly-1', 13, 3);

    // Wood log tile (forest bricks)
    g.fillStyle(0x8a6035);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x6b4527);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 10, 32, 2);
    g.fillRect(0, 21, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillStyle(0x75512c);
    g.fillRect(6, 4, 4, 4);
    g.fillRect(20, 14, 5, 4);
    g.fillRect(10, 25, 4, 3);
    g.generateTexture('log', 32, 32);
    g.clear();

    // Tree (forest backdrop)
    g.fillStyle(0x6b4a2b);
    g.fillRect(42, 85, 12, 65);
    g.fillStyle(0x2f7a3d);
    g.fillCircle(48, 58, 34);
    g.fillCircle(26, 80, 25);
    g.fillCircle(70, 80, 25);
    g.fillStyle(0x3f9a4f);
    g.fillCircle(38, 52, 16);
    g.generateTexture('tree', 96, 150);
    g.clear();

    // Bush (forest ground decoration)
    g.fillStyle(0x2f7a3d);
    g.fillCircle(12, 16, 11);
    g.fillCircle(28, 14, 13);
    g.fillCircle(42, 17, 10);
    g.generateTexture('bush', 52, 28);
    g.clear();

    // Stalactite (cave backdrop decoration)
    g.fillStyle(0x241d33);
    g.fillTriangle(0, 0, 24, 0, 12, 48);
    g.generateTexture('stalactite', 24, 48);
    g.clear();

    // Crystal (cave backdrop decoration)
    g.fillStyle(0x7de3ff, 0.9);
    g.fillTriangle(8, 0, 16, 14, 0, 14);
    g.fillTriangle(0, 14, 16, 14, 8, 22);
    g.fillStyle(0xd6f6ff, 0.9);
    g.fillTriangle(8, 4, 11, 12, 5, 12);
    g.generateTexture('crystal', 16, 22);
    g.clear();

    // Coin block ("?" style block, drawn as a glowing dot block)
    g.fillStyle(0xf7b32b);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xc78500);
    g.fillRect(0, 0, 32, 3);
    g.fillRect(0, 29, 32, 3);
    g.fillRect(0, 0, 3, 32);
    g.fillRect(29, 0, 3, 32);
    g.fillStyle(0xfff1c4);
    g.fillCircle(16, 14, 6);
    g.fillStyle(0xc78500);
    g.fillRect(14, 22, 4, 4);
    g.generateTexture('block', 32, 32);
    g.clear();

    // Used (empty) block
    g.fillStyle(0x9a8f80);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x776e62);
    g.fillRect(0, 0, 32, 3);
    g.fillRect(0, 29, 32, 3);
    g.fillRect(0, 0, 3, 32);
    g.fillRect(29, 0, 3, 32);
    g.generateTexture('block-used', 32, 32);
    g.clear();

    // Coin
    g.fillStyle(0xffd700);
    g.fillCircle(11, 11, 10);
    g.fillStyle(0xe0a800);
    g.fillCircle(11, 11, 6);
    g.fillStyle(0xfff3b0);
    g.fillCircle(8, 8, 2);
    g.generateTexture('coin', 22, 22);
    g.clear();

    // Player: stick figure, drawn in white so themes can tint it.
    // Far limbs are dimmed so the walk cycle reads clearly from the side.
    const stickFrame = (
      name: string,
      nearArm: number[],
      farArm: number[],
      nearLeg: number[],
      farLeg: number[],
    ): void => {
      g.lineStyle(3, 0xffffff, 0.5);
      g.lineBetween(14, 15, farArm[0], farArm[1]);
      g.lineBetween(14, 24, farLeg[0], farLeg[1]);
      g.lineStyle(3, 0xffffff, 1);
      g.lineBetween(14, 11, 14, 24);
      g.lineBetween(14, 15, nearArm[0], nearArm[1]);
      g.lineBetween(14, 24, nearLeg[0], nearLeg[1]);
      g.fillStyle(0xffffff);
      g.fillCircle(14, 6, 5);
      g.generateTexture(name, 28, 36);
      g.clear();
    };
    stickFrame('player-idle', [20, 22], [8, 22], [19, 35], [9, 35]);
    stickFrame('player-walk-0', [7, 21], [21, 21], [22, 34], [6, 34]);
    stickFrame('player-walk-1', [17, 22], [11, 22], [16, 35], [11, 34]);
    stickFrame('player-walk-2', [21, 21], [7, 21], [6, 34], [22, 34]);
    stickFrame('player-jump', [22, 7], [6, 7], [21, 30], [7, 31]);

    // Enemy (grumpy purple blob)
    g.fillStyle(0x7d4ce0);
    g.fillRoundedRect(0, 4, 30, 20, { tl: 14, tr: 14, bl: 4, br: 4 });
    g.fillStyle(0x5b32b0);
    g.fillRect(2, 22, 8, 4);
    g.fillRect(20, 22, 8, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(9, 12, 4);
    g.fillCircle(21, 12, 4);
    g.fillStyle(0x222222);
    g.fillCircle(9, 13, 2);
    g.fillCircle(21, 13, 2);
    g.generateTexture('enemy', 30, 26);
    g.clear();

    // Flag (pole + banner), origin will be bottom-center
    g.fillStyle(0xcfd8dc);
    g.fillRect(30, 0, 6, 150);
    g.fillStyle(0x90a4ae);
    g.fillRect(26, 146, 14, 6);
    g.fillCircle(33, 4, 6);
    g.fillStyle(0x2ecc71);
    g.fillTriangle(30, 8, 30, 40, 0, 24);
    g.generateTexture('flag', 40, 152);
    g.clear();

    // Cloud
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(26, 30, 18);
    g.fillCircle(52, 22, 22);
    g.fillCircle(80, 30, 18);
    g.fillRect(24, 28, 58, 20);
    g.generateTexture('cloud', 106, 50);
    g.clear();

    // Background hill
    g.fillStyle(0x2f8c3a, 0.85);
    g.fillEllipse(120, 100, 240, 160);
    g.generateTexture('hill', 240, 100);
    g.clear();

    // Touch buttons (directional + jump)
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(52, 52, 50);
    g.lineStyle(3, 0xffffff, 0.5);
    g.strokeCircle(52, 52, 50);
    g.fillStyle(0xffffff, 0.75);
    g.fillTriangle(66, 28, 66, 76, 30, 52);
    g.generateTexture('btn-dir', 104, 104);
    g.clear();

    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(60, 60, 58);
    g.lineStyle(3, 0xffffff, 0.5);
    g.strokeCircle(60, 60, 58);
    g.fillStyle(0xffffff, 0.75);
    g.fillTriangle(60, 30, 88, 70, 32, 70);
    g.generateTexture('btn-jump', 120, 120);
    g.clear();

    // Particle
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 6, 6);
    g.generateTexture('particle', 6, 6);

    g.destroy();

    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'player-walk-0' },
        { key: 'player-walk-1' },
        { key: 'player-walk-2' },
        { key: 'player-walk-1' },
      ],
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: 'fly-buzz',
      frames: [{ key: 'fly-0' }, { key: 'fly-1' }],
      frameRate: 20,
      repeat: -1,
    });

    this.scene.start('Menu');
  }
}
