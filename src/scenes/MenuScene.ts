import Phaser from 'phaser';
import { CHARACTERS, getSelectedCharacter, setSelectedCharacter } from '../characters';
import { GAME_HEIGHT, GAME_WIDTH, START_LIVES } from '../config';
import { isDevMode } from '../devmode';
import { getHighscore } from '../highscore';
import { LEVELS } from '../levels';

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

    this.addCharacterSelect(cx);

    const start = this.add
      .text(cx, 385, 'TAP TO START', {
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
        .text(cx, 435, `BEST: ${highscore}`, {
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

    let started = false;
    const startGame = (levelIndex = 0): void => {
      if (started) return;
      started = true;
      this.scene.start('Game', { levelIndex, score: 0, lives: START_LIVES });
    };

    if (isDevMode()) {
      this.addLevelSelect(startGame);
    }
    // Only start on taps that miss the character (and dev level) buttons
    this.input.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length === 0) startGame();
      },
    );
    this.input.keyboard!.once('keydown-SPACE', () => startGame());
    this.input.keyboard!.once('keydown-ENTER', () => startGame());
  }

  private addCharacterSelect(cx: number): void {
    const y = 275;
    const spacing = 150;
    let selectedId = getSelectedCharacter().id;

    const ring = this.add.image(0, y, 'select-ring');
    const sprites = CHARACTERS.map((character, i) => {
      const x = cx + (i - 1) * spacing;
      const sprite = this.add
        .sprite(x, y, character.idleTexture)
        .setScale(2)
        .setInteractive({ useHandCursor: true });
      if (character.tintByTheme) sprite.setTint(0xf5f5f5);
      sprite.play(character.walkAnim);
      this.add
        .text(x, y + 58, character.name, {
          fontFamily: 'monospace',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#8899cc',
        })
        .setOrigin(0.5);
      sprite.on('pointerdown', () => {
        selectedId = character.id;
        setSelectedCharacter(character.id);
        refresh();
      });
      return sprite;
    });

    const refresh = (): void => {
      const index = CHARACTERS.findIndex((c) => c.id === selectedId);
      ring.setX(cx + (index - 1) * spacing);
      sprites.forEach((sprite, i) => sprite.setAlpha(CHARACTERS[i].id === selectedId ? 1 : 0.45));
    };
    refresh();
  }

  private addLevelSelect(startGame: (levelIndex: number) => void): void {
    this.add.text(16, 12, 'DEV MODE — LEVEL SELECT', {
      fontFamily: 'monospace',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ff6b6b',
    });
    LEVELS.forEach((_, i) => {
      this.add
        .text(24 + i * 56, 44, ` ${i + 1} `, {
          fontFamily: 'monospace',
          fontSize: '30px',
          fontStyle: 'bold',
          color: '#ffffff',
          backgroundColor: '#ff6b6b',
          padding: { x: 8, y: 4 },
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => startGame(i));
    });
  }
}
