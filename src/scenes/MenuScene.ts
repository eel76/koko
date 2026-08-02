import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, START_LIVES } from '../config';
import { getHighscore } from '../highscore';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 150, 'KOKO RUN', {
        fontFamily: 'monospace',
        fontSize: '84px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    const bird = this.add.image(cx, 260, 'player').setScale(2);
    this.tweens.add({
      targets: bird,
      y: 240,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const start = this.add
      .text(cx, 360, 'TAP TO START', {
        fontFamily: 'monospace',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    const highscore = getHighscore();
    if (highscore > 0) {
      this.add
        .text(cx, 420, `BEST: ${highscore}`, {
          fontFamily: 'monospace',
          fontSize: '28px',
          color: '#ffd700',
        })
        .setOrigin(0.5);
    }

    const hint = this.sys.game.device.input.touch
      ? 'MOVE WITH ◀ ▶  ·  TAP RIGHT BUTTON TO JUMP'
      : 'ARROWS / WASD TO MOVE  ·  SPACE TO JUMP';
    this.add
      .text(cx, GAME_HEIGHT - 40, hint, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#8899cc',
      })
      .setOrigin(0.5);

    const startGame = (): void => {
      this.scene.start('Game', { levelIndex: 0, score: 0, lives: START_LIVES });
    };
    this.input.once('pointerdown', startGame);
    this.input.keyboard!.once('keydown-SPACE', startGame);
    this.input.keyboard!.once('keydown-ENTER', startGame);
  }
}
