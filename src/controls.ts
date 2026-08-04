import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { placeOnHud } from './ui';

interface TouchZone {
  x: number;
  y: number;
  r: number;
  kind: 'left' | 'right' | 'jump';
}

// Unified input: keyboard (arrows/WASD + space) and on-screen touch buttons
// both feed the same left/right/jump state polled by the game scene.
export class Controls {
  left = false;
  right = false;
  jumpHeld = false;
  jumpPressed = false;

  private prevJump = false;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;
  private zones: TouchZone[] = [];

  constructor(private scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys('A,D,W') as Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;

    if (scene.sys.game.device.input.touch) {
      this.createTouchButtons();
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
    }
  }

  update(): void {
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
