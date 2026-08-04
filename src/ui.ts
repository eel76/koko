import Phaser from 'phaser';
import { CAMERA_ZOOM, GAME_HEIGHT, GAME_WIDTH } from './config';

// The gameplay camera is zoomed in; zoom scales scrollFactor-0 UI around the
// viewport center. This places a HUD object so it appears at (x, y) at its
// normal size regardless of the zoom.
export function placeOnHud(
  obj: Phaser.GameObjects.Text | Phaser.GameObjects.Image,
  x: number,
  y: number,
): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT / 2;
  obj.setPosition(cx + (x - cx) / CAMERA_ZOOM, cy + (y - cy) / CAMERA_ZOOM);
  obj.setScale(1 / CAMERA_ZOOM);
}
