import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

// Overlay shown while the game scene is paused (developer mode only).
// Runs as its own scene so it keeps receiving input while Game is frozen.
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setOrigin(0);

    this.add
      .text(cx, 180, 'PAUSED', {
        fontFamily: 'monospace',
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 245, 'DEV MODE', {
        fontFamily: 'monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ff6b6b',
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(cx, 330, 'TAP TO RESUME', {
        fontFamily: 'monospace',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    const quit = this.add
      .text(cx, 420, 'QUIT TO MENU', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#8899cc',
        backgroundColor: '#1a1a2e',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const resume = (): void => {
      this.scene.stop();
      this.scene.resume('Game');
    };

    quit.on('pointerdown', () => {
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Menu');
    });

    // Any tap that misses the quit button resumes
    this.input.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length === 0) resume();
      },
    );
    this.input.keyboard!.on('keydown-P', resume);
    this.input.keyboard!.on('keydown-ESC', resume);
  }
}
