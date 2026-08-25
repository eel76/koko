import Phaser from 'phaser';
import { CONTROLS_FADE_MS, GAME_HEIGHT, GAME_WIDTH } from './config';
import { placeOnHud } from './ui';

interface TouchZone {
  x: number;
  y: number;
  r: number;
  kind: 'left' | 'right' | 'jump';
}

// Unified input: keyboard (arrows/WASD + space) and on-screen touch buttons
// both feed the same left/right/jump state polled by the game scene.
// The controls start hidden and inactive: they only appear once the character
// has walked into the level, which is what tells the player they are in charge.
export class Controls {
  left = false;
  right = false;
  jumpHeld = false;
  jumpPressed = false;

  private prevJump = false;
  private active = false;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;
  private zones: TouchZone[] = [];
  private display: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] = [];
  private hint?: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys('A,D,W') as Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;

    if (scene.sys.game.device.input.touch) {
      this.createTouchButtons();
    } else {
      this.createKeyboardHint();
    }
    for (const object of this.display) {
      object.setAlpha(0);
    }
  }

  private createTouchButtons(): void {
    const y = GAME_HEIGHT - 78;
    const buttons: { x: number; y: number; r: number; kind: TouchZone['kind']; texture: string; flip: boolean }[] = [
      { x: 84, y, r: 62, kind: 'left', texture: 'btn-dir', flip: false },
      { x: 210, y, r: 62, kind: 'right', texture: 'btn-dir', flip: true },
      { x: GAME_WIDTH - 96, y, r: 72, kind: 'jump', texture: 'btn-jump', flip: false },
    ];
    for (const b of buttons) {
      const image = this.scene.add
        .image(0, 0, b.texture)
        .setScrollFactor(0)
        .setDepth(200)
        .setFlipX(b.flip);
      // Compensate the camera zoom so the button appears at (x, y) full size;
      // hit zones use logical screen coordinates and stay unchanged.
      placeOnHud(image, b.x, b.y);
      this.zones.push({ x: b.x, y: b.y, r: b.r, kind: b.kind });
      this.display.push(image);
    }
  }

  // Without touch buttons there is nothing to fade in, so a short keyboard
  // reminder takes their place and disappears again after a few seconds.
  private createKeyboardHint(): void {
    this.hint = this.scene.add
      .text(0, 0, '◀ ▶ / A D  TO MOVE   ·   SPACE / W  TO JUMP', {
        fontFamily: 'monospace',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
    placeOnHud(this.hint, GAME_WIDTH / 2, GAME_HEIGHT - 130);
    this.display.push(this.hint);
  }

  // Fade the controls in and hand the character over to the player
  reveal(): void {
    this.active = true;
    if (this.display.length === 0) return;
    this.scene.tweens.add({
      targets: this.display,
      alpha: 1,
      duration: CONTROLS_FADE_MS,
      ease: 'Sine.easeOut',
    });
    if (this.hint) {
      this.scene.tweens.add({
        targets: this.hint,
        alpha: 0,
        delay: CONTROLS_FADE_MS + 2600,
        duration: 600,
      });
    }
  }

  // Fade the controls out again — the character takes over from here
  conceal(): void {
    this.active = false;
    this.left = this.right = this.jumpHeld = this.jumpPressed = false;
    if (this.display.length === 0) return;
    this.scene.tweens.killTweensOf(this.display);
    this.scene.tweens.add({
      targets: this.display,
      alpha: 0,
      duration: CONTROLS_FADE_MS,
      ease: 'Sine.easeIn',
    });
  }

  update(): void {
    if (!this.active) {
      this.left = this.right = this.jumpHeld = this.jumpPressed = false;
      this.prevJump = false;
      return;
    }

    let left = this.cursors.left.isDown || this.wasd.A.isDown;
    let right = this.cursors.right.isDown || this.wasd.D.isDown;
    let jump = this.cursors.up.isDown || this.cursors.space.isDown || this.wasd.W.isDown;

    for (const pointer of this.scene.input.manager.pointers) {
      if (!pointer.isDown) continue;
      for (const zone of this.zones) {
        if (Phaser.Math.Distance.Between(pointer.x, pointer.y, zone.x, zone.y) <= zone.r) {
          if (zone.kind === 'left') left = true;
          else if (zone.kind === 'right') right = true;
          else jump = true;
        }
      }
    }

    this.left = left;
    this.right = right;
    this.jumpHeld = jump;
    this.jumpPressed = jump && !this.prevJump;
    this.prevJump = jump;
  }
}
