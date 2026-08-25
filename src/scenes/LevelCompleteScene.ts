import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { submitScore } from '../highscore';
import { playableLevelCount } from '../levels';

interface CompleteData {
  levelIndex: number;
  score: number;
  lives: number;
  secondsLeft: number;
  timeBonus: number;
}

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  create(data: CompleteData): void {
    const cx = GAME_WIDTH / 2;
    const hasNext = data.levelIndex + 1 < playableLevelCount();

    this.add
      .text(cx, 160, hasNext ? `LEVEL ${data.levelIndex + 1} COMPLETE!` : 'YOU WIN!', {
        fontFamily: 'monospace',
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#2ecc71',
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

    if (data.timeBonus > 0) {
      this.add
        .text(cx, 300, `TIME BONUS +${data.timeBonus} (${data.secondsLeft} s left)`, {
          fontFamily: 'monospace',
          fontSize: '26px',
          color: '#7fc4b4',
        })
        .setOrigin(0.5);
    }

    if (!hasNext && submitScore(data.score)) {
      this.add
        .text(cx, 350, 'NEW BEST!', {
          fontFamily: 'monospace',
          fontSize: '32px',
          fontStyle: 'bold',
          color: '#ffd700',
        })
        .setOrigin(0.5);
    }

    const prompt = this.add
      .text(cx, GAME_HEIGHT - 120, hasNext ? 'TAP FOR NEXT LEVEL' : 'TAP FOR MENU', {
        fontFamily: 'monospace',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.time.delayedCall(400, () => {
      const proceed = (): void => {
        if (hasNext) {
          this.scene.start('Game', {
            levelIndex: data.levelIndex + 1,
            score: data.score,
            lives: data.lives,
          });
        } else {
          this.scene.start('Menu');
        }
      };
      this.input.once('pointerdown', proceed);
      this.input.keyboard!.once('keydown-SPACE', proceed);
    });
  }
}
