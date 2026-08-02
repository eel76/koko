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

    // Player (Koko — a plucky orange bird)
    g.fillStyle(0xff8c42);
    g.fillRoundedRect(0, 4, 28, 28, 8);
    g.fillStyle(0xe86a17);
    g.fillRect(4, 28, 8, 4);
    g.fillRect(16, 28, 8, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(19, 13, 6);
    g.fillStyle(0x222222);
    g.fillCircle(21, 13, 3);
    g.fillStyle(0xffc93c);
    g.fillTriangle(26, 17, 34, 20, 26, 23);
    g.generateTexture('player', 34, 32);
    g.clear();

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

    this.scene.start('Menu');
  }
}
