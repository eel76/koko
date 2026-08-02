import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { getHighscore, submitScore } from '../highscore';

interface GameOverData {
  score: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    const cx = GAME_WIDTH / 2;
    const isBest = submitScore(data.score);

    this.add
      .text(cx, 160, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#e74c3c',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 250, `SCORE ${data.score}`, {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 310, isBest ? 'NEW BEST!' : `BEST ${getHighscore()}`, {
        fontFamily: 'monospace',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffd700',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, GAME_HEIGHT - 120, 'TAP TO CONTINUE', {
        fontFamily: 'monospace',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.time.delayedCall(400, () => {
      const proceed = (): void => {
        this.scene.start('Menu');
      };
      this.input.once('pointerdown', proceed);
      this.input.keyboard!.once('keydown-SPACE', proceed);
    });
  }
}
