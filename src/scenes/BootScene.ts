import Phaser from 'phaser';
import * as C from '../config';

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

    // Giant mosquito, two frames for the wing flap (faces left, flipped at runtime)
    const flyFrame = (name: string, wingY: number, wingRy: number): void => {
      g.fillStyle(0xdcebf2, 0.5);
      g.fillEllipse(26, wingY, 22, wingRy * 2);
      g.fillEllipse(33, wingY + 4, 18, wingRy * 2);
      g.fillStyle(0x5a4f47);
      g.fillEllipse(30, 20, 18, 8);
      g.fillStyle(0x4a4340);
      g.fillCircle(19, 16, 5);
      g.fillCircle(12, 13, 4);
      g.fillStyle(0xe23b3b);
      g.fillCircle(10, 12, 1.5);
      g.lineStyle(2, 0x2f2a26);
      g.lineBetween(9, 15, 0, 22);
      g.lineStyle(1.5, 0x2f2a26);
      g.lineBetween(15, 19, 8, 27);
      g.lineBetween(18, 20, 14, 29);
      g.lineBetween(21, 21, 20, 30);
      g.lineBetween(24, 21, 28, 30);
      g.generateTexture(name, 44, 32);
      g.clear();
    };
    flyFrame('fly-0', 6, 4);
    flyFrame('fly-1', 12, 3);

    // Fliegi (from a hand-drawn design): a round blue body with two yellow
    // eyes, two fangs, feelers ending in little loops, white wings that beat,
    // and two red feet. Drawn facing the viewer head-on, so it is never
    // flipped at runtime — its feelers and grin keep their sides.
    const FLIEGI_FRAMES = 4;
    // Ellipses have to be rotated, which Graphics cannot do directly, so the
    // outline points are computed and filled as a polygon.
    const ellipsePoints = (
      ex: number,
      ey: number,
      rx: number,
      ry: number,
      angle: number,
    ): Phaser.Types.Math.Vector2Like[] => {
      const pts: Phaser.Types.Math.Vector2Like[] = [];
      for (let i = 0; i < 28; i++) {
        const t = (i / 28) * Math.PI * 2;
        const px = Math.cos(t) * rx;
        const py = Math.sin(t) * ry;
        pts.push({
          x: ex + px * Math.cos(angle) - py * Math.sin(angle),
          y: ey + px * Math.sin(angle) + py * Math.cos(angle),
        });
      }
      return pts;
    };
    const curvePoints = (
      x0: number,
      y0: number,
      cxp: number,
      cyp: number,
      x1: number,
      y1: number,
    ): Phaser.Types.Math.Vector2Like[] => {
      const pts: Phaser.Types.Math.Vector2Like[] = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const u = 1 - t;
        pts.push({
          x: u * u * x0 + 2 * u * t * cxp + t * t * x1,
          y: u * u * y0 + 2 * u * t * cyp + t * t * y1,
        });
      }
      return pts;
    };

    const fliegiFrame = (index: number): void => {
      const beat = (index + 1) / FLIEGI_FRAMES;
      const lift = Math.sin(beat * Math.PI * 2);
      const cx = 31;
      const cy = 31;

      // Wings behind everything, hinged at the shoulders
      for (const side of [-1, 1]) {
        const a = side * (-0.55 - lift * 0.5);
        const hx = cx + side * 9;
        const hy = cy - 3;
        const ox = side * 9;
        const oy = -2;
        const wing = ellipsePoints(
          hx + ox * Math.cos(a) - oy * Math.sin(a),
          hy + ox * Math.sin(a) + oy * Math.cos(a),
          10.5,
          5.5,
          a,
        );
        g.fillStyle(0xf7fbff, 0.82);
        g.fillPoints(wing, true);
        g.lineStyle(1.6, 0x8fa6b8);
        g.strokePoints(wing, true);
      }

      // Feelers, each ending in a little loop
      const sway = lift * 1.2;
      g.lineStyle(1.8, 0x26323d);
      g.strokePoints(
        curvePoints(cx - 6, cy - 11, cx - 11, cy - 18, cx - 12 + sway, cy - 23),
        false,
      );
      g.strokeCircle(cx - 13 + sway, cy - 25.5, 2.6);
      g.strokePoints(
        curvePoints(cx + 6, cy - 11, cx + 10, cy - 15, cx + 12 - sway, cy - 19),
        false,
      );
      g.strokeCircle(cx + 13 - sway, cy - 21, 2.1);

      // Feet
      for (const side of [-1, 1]) {
        const foot = ellipsePoints(cx + side * 7, cy + 14, 5.5, 4.5, side * 0.2);
        g.fillStyle(0xe05a4a);
        g.fillPoints(foot, true);
        g.lineStyle(1.8, 0x9c3527);
        g.strokePoints(foot, true);
      }

      // Body
      g.fillStyle(0x6ea8e0);
      g.fillEllipse(cx, cy, 26, 28);
      g.lineStyle(2, 0x3f6b9e);
      g.strokeEllipse(cx, cy, 26, 28);

      // Eyes
      for (const side of [-1, 1]) {
        g.fillStyle(0xf2c53d);
        g.fillEllipse(cx + side * 5, cy - 3, 8.4, 12.8);
        g.lineStyle(1.5, 0xa8790f);
        g.strokeEllipse(cx + side * 5, cy - 3, 8.4, 12.8);
      }

      // Mouth line with two fangs
      g.lineStyle(1.8, 0x26323d);
      g.lineBetween(cx - 8, cy + 6, cx + 8, cy + 5);
      g.fillStyle(0x26323d);
      for (const side of [-1, 1]) {
        g.fillTriangle(
          cx + side * 2.5,
          cy + 5.5,
          cx + side * 6.5,
          cy + 5.5,
          cx + side * 4.5,
          cy + 11,
        );
      }

      g.generateTexture(`fliegi-${index}`, 62, 54);
      g.clear();
    };
    for (let i = 0; i < FLIEGI_FRAMES; i++) {
      fliegiFrame(i);
    }

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

    // Jungle tree (swampy forest backdrop) with hanging vines
    g.fillStyle(0x5d4023);
    g.fillRect(42, 85, 12, 65);
    g.fillStyle(0x2a5d34);
    g.fillCircle(48, 58, 34);
    g.fillCircle(26, 80, 25);
    g.fillCircle(70, 80, 25);
    g.fillStyle(0x35743f);
    g.fillCircle(38, 52, 16);
    g.lineStyle(3, 0x2a5d34);
    g.lineBetween(14, 92, 14, 128);
    g.lineBetween(80, 94, 80, 124);
    g.fillStyle(0x35743f);
    g.fillCircle(14, 130, 4);
    g.fillCircle(80, 126, 4);
    g.generateTexture('tree', 96, 150);
    g.clear();

    // Bush (swamp ground decoration)
    g.fillStyle(0x2a5d34);
    g.fillCircle(12, 16, 11);
    g.fillCircle(28, 14, 13);
    g.fillCircle(42, 17, 10);
    g.generateTexture('bush', 52, 28);
    g.clear();

    // ---------------------------------------------------------------
    // Woods theme: an ordinary forest that grows darker with every step into
    // its depth — proper trees, ferns, mushrooms, flowers and the little
    // critters crawling between them.
    // ---------------------------------------------------------------

    // Trunk with a slight taper and a hint of bark
    const trunk = (
      cx: number,
      bottom: number,
      top: number,
      halfBottom: number,
      halfTop: number,
      bark: number,
      grain: number,
    ): void => {
      g.fillStyle(bark);
      g.fillPoints(
        [
          { x: cx - halfBottom, y: bottom },
          { x: cx - halfTop, y: top },
          { x: cx + halfTop, y: top },
          { x: cx + halfBottom, y: bottom },
        ],
        true,
      );
      g.fillStyle(grain);
      g.fillRect(cx - halfTop * 0.5, top + 8, 2, bottom - top - 16);
      g.fillRect(cx + halfTop * 0.2, top + 20, 2, (bottom - top) * 0.5);
    };

    // Leafy canopy: overlapping blobs in three greens so it reads as foliage
    const canopy = (blobs: [number, number, number][], dark: number, mid: number, light: number): void => {
      g.fillStyle(dark);
      for (const [bx, by, br] of blobs) g.fillCircle(bx, by, br);
      g.fillStyle(mid);
      for (const [bx, by, br] of blobs) g.fillCircle(bx - br * 0.15, by - br * 0.2, br * 0.78);
      g.fillStyle(light);
      for (const [bx, by, br] of blobs) g.fillCircle(bx - br * 0.35, by - br * 0.4, br * 0.34);
    };

    // Broad-leaved tree (oak-like)
    trunk(70, 210, 96, 13, 8, 0x6b4a2c, 0x543823);
    g.lineStyle(7, 0x6b4a2c);
    g.lineBetween(68, 128, 44, 106);
    g.lineBetween(72, 136, 96, 112);
    canopy(
      [
        [70, 70, 44],
        [30, 92, 28],
        [110, 90, 30],
        [52, 46, 26],
        [92, 44, 24],
      ],
      0x2f6b2f,
      0x3d8b3a,
      0x5cae4c,
    );
    g.generateTexture('woods-oak', 140, 210);
    g.clear();
    // The crown once more on its own, so a beetle can climb in behind it
    canopy(
      [
        [70, 70, 44],
        [30, 92, 28],
        [110, 90, 30],
        [52, 46, 26],
        [92, 44, 24],
      ],
      0x2f6b2f,
      0x3d8b3a,
      0x5cae4c,
    );
    g.generateTexture('woods-oak-crown', 140, 210);
    g.clear();

    // Beech: the tree of a closed, dark forest — a smooth grey column that
    // carries no branch until well up, then spreads into one broad crown.
    // (A birch stood here before; birches are pioneers of open, light ground
    // and looked out of place under a canopy this dense.)
    trunk(58, 260, 74, 13, 9, 0x8a887f, 0x6f6d66);
    g.fillStyle(0xa3a199);
    g.fillRect(48, 96, 5, 150);
    g.fillStyle(0x6f6d66);
    g.fillEllipse(66, 150, 7, 22);
    g.fillEllipse(52, 196, 5, 16);
    // Two limbs leaving the trunk upwards, as a beech carries its crown
    g.lineStyle(8, 0x8a887f);
    g.lineBetween(56, 104, 30, 74);
    g.lineBetween(60, 112, 88, 78);
    g.lineStyle(5, 0x8a887f);
    g.lineBetween(30, 74, 20, 58);
    g.lineBetween(88, 78, 98, 60);
    canopy(
      [
        [58, 50, 40],
        [22, 66, 26],
        [94, 64, 27],
        [40, 26, 22],
        [78, 24, 21],
      ],
      0x24501f,
      0x2f6b2b,
      0x3d8437,
    );
    g.generateTexture('woods-beech', 120, 260);
    g.clear();
    canopy(
      [
        [58, 50, 40],
        [22, 66, 26],
        [94, 64, 27],
        [40, 26, 22],
        [78, 24, 21],
      ],
      0x24501f,
      0x2f6b2b,
      0x3d8437,
    );
    g.generateTexture('woods-beech-crown', 120, 260);
    g.clear();

    // Spruce: stacked needle tiers. Every tier is one dark triangle with a
    // mid tone and a highlight nested inside it — all three measured from the
    // tier's own width, so the lighter triangles stay within the tier's
    // outline instead of poking out of the narrow tiers near the top.
    trunk(55, 240, 190, 9, 7, 0x5a4028, 0x452f1d);
    for (let i = 0; i < 4; i++) {
      const y = 200 - i * 44;
      const half = 46 - i * 9;
      g.fillStyle(0x235c33);
      g.fillTriangle(55, y - 66, 55 - half, y, 55 + half, y);
      g.fillStyle(0x2e7540);
      g.fillTriangle(55, y - 58, 55 - half * 0.8, y - 4, 55 + half * 0.8, y - 4);
      g.fillStyle(0x3d8f4d);
      g.fillTriangle(55 - half * 0.1, y - 50, 55 - half * 0.5, y - 14, 55 + half * 0.2, y - 14);
    }
    g.generateTexture('woods-spruce', 110, 240);
    g.clear();

    // Undergrowth bush
    g.fillStyle(0x2f6b2f);
    g.fillCircle(16, 26, 15);
    g.fillCircle(38, 22, 18);
    g.fillCircle(60, 27, 14);
    g.fillStyle(0x3d8b3a);
    g.fillCircle(14, 24, 10);
    g.fillCircle(36, 19, 12);
    g.fillCircle(58, 25, 9);
    g.fillStyle(0x5cae4c);
    g.fillCircle(11, 20, 4);
    g.fillCircle(32, 14, 5);
    g.generateTexture('woods-bush', 76, 42);
    g.clear();

    // Fern: arching fronds with little leaflets
    for (const [tipX, tipY, thickness] of [
      [4, 8, 3],
      [22, 2, 3.5],
      [40, 10, 3],
    ] as const) {
      g.lineStyle(thickness, 0x35743f);
      const frond = curvePoints(22, 40, (22 + tipX) / 2, 8, tipX, tipY);
      g.strokePoints(frond, false);
      g.fillStyle(0x4a9b4a);
      for (const p of frond) g.fillCircle(p.x!, p.y!, 3);
    }
    g.generateTexture('woods-fern', 46, 42);
    g.clear();

    // Grass tuft
    g.lineStyle(2, 0x4a9b4a);
    g.lineBetween(4, 16, 1, 3);
    g.lineBetween(9, 16, 9, 0);
    g.lineBetween(14, 16, 18, 4);
    g.generateTexture('grass-tuft', 20, 16);
    g.clear();

    // Mushrooms: the classic red fly agaric and a small brown one
    const mushroom = (name: string, cap: number, capDark: number, w: number, h: number): void => {
      g.fillStyle(0xf0e6d2);
      g.fillRect(w / 2 - 2.5, h - 11, 5, 11);
      g.fillStyle(0xd8ccb4);
      g.fillRect(w / 2 + 0.5, h - 11, 2, 11);
      g.fillStyle(capDark);
      g.fillEllipse(w / 2, h - 11, w, 14);
      g.fillStyle(cap);
      g.fillEllipse(w / 2, h - 13, w - 2, 13);
      g.fillStyle(0xfff6e8);
      g.fillCircle(w / 2 - 3, h - 15, 1.8);
      g.fillCircle(w / 2 + 3, h - 13, 1.4);
      g.generateTexture(name, w, h);
      g.clear();
    };
    mushroom('mushroom-red', 0xd94a3d, 0xa8342a, 20, 22);
    mushroom('mushroom-brown', 0xb98a52, 0x8d663a, 14, 16);

    // Small flowers on a stem
    const flower = (name: string, petal: number, heart: number): void => {
      g.lineStyle(2, 0x4a9b4a);
      g.lineBetween(9, 22, 9, 9);
      g.fillStyle(0x4a9b4a);
      g.fillEllipse(4, 16, 7, 4);
      g.fillStyle(petal);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        g.fillCircle(9 + Math.cos(a) * 4.5, 8 + Math.sin(a) * 4.5, 3.2);
      }
      g.fillStyle(heart);
      g.fillCircle(9, 8, 2.6);
      g.generateTexture(name, 18, 22);
      g.clear();
    };
    flower('flower-0', 0xffffff, 0xffd54a);
    flower('flower-1', 0xffd54a, 0xe08a2a);
    flower('flower-2', 0xa98fe0, 0xfff0a8);

    // Pebble on the forest floor
    g.fillStyle(0x8d8a84);
    g.fillEllipse(9, 6, 18, 10);
    g.fillStyle(0xa8a49d);
    g.fillEllipse(7, 5, 11, 5);
    g.generateTexture('pebble', 18, 12);
    g.clear();

    // Falling leaf (drawn green, tinted to autumn colours at runtime)
    g.fillStyle(0x66b04a);
    g.fillEllipse(7, 5, 14, 9);
    g.lineStyle(1, 0x3f7d33);
    g.lineBetween(1, 5, 13, 5);
    g.generateTexture('leaf', 14, 10);
    g.clear();

    // A hint of sky over the treetops: a strip that fades from daylight blue
    // at the very top of the world down into the dark of the forest, so it
    // meets the background without an edge. Drawn behind everything and fixed
    // in the world, so jumping high brings more of it into view.
    for (let y = 0; y < C.WOODS_SKY_DEPTH; y++) {
      const t = y / (C.WOODS_SKY_DEPTH - 1);
      g.fillStyle(
        Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(C.WOODS_SKY_TOP_COLOR),
          Phaser.Display.Color.ValueToColor(C.WOODS_BG_COLOR),
          100,
          Math.round(t * 100),
        ).color,
      );
      g.fillRect(0, y, 8, 1);
    }
    g.generateTexture('woods-sky', 8, C.WOODS_SKY_DEPTH);
    g.clear();

    // Canopy: the foliage hanging into the top of the picture, in the one
    // plane in front of the character. Being the nearest thing on screen it is
    // drawn as what it really is — single leaves on thin twigs, never whole
    // tree shapes — thin enough to see the forest through it. The strip
    // repeats seamlessly: anything crossing a side is drawn again on the other
    // side. Its top and bottom rows stay empty, so the tiling can never blend
    // the two into a hairline across the screen.
    const canopyW = 640;
    const canopyH = 280;
    let canopySeed = 20260826;
    const rnd = (): number => {
      canopySeed = (canopySeed * 1103515245 + 12345) % 2147483648;
      return canopySeed / 2147483648;
    };
    const between = (lo: number, hi: number): number => lo + rnd() * (hi - lo);
    // Almost black: this foliage hangs closest to the eye, in the shadow of
    // everything above it, and it must never compete with the character.
    const canopyGreens = [0x080f09, 0x0c150d, 0x101c12, 0x152317];
    // One leaf: a pointed oval that can lie at any angle on its twig
    const leaf = (cx: number, cy: number, len: number, wide: number, angle: number): void => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const pts: Phaser.Types.Math.Vector2Like[] = [];
      const put = (t: number, side: number): void => {
        const lx = (t - 0.5) * len;
        const ly = side * Math.pow(Math.sin(Math.PI * t), 0.8) * wide * 0.5;
        pts.push({ x: cx + lx * cos - ly * sin, y: cy + lx * sin + ly * cos });
      };
      for (let i = 0; i <= 6; i++) put(i / 6, 1);
      for (let i = 6; i >= 0; i--) put(i / 6, -1);
      g.fillPoints(pts, true);
    };
    // A twig hanging out of the roof, with leaves along it at odd intervals
    // The deeper a leaf hangs the more it is seen through: what reaches into
    // the middle of the picture must never hide what happens behind it.
    const depthAlpha = (y: number): number => Phaser.Math.Clamp(1.05 - y / 340, 0.4, 1);
    // A branch leaves the roof in a direction of its own — level, slanted or
    // steep — and sags towards its tip under its own weight. Leaves fan off
    // both sides of it and hang a little towards the ground.
    const branch = (
      x0: number,
      y0: number,
      degrees: number,
      len: number,
      droop: number,
      grow = 1,
    ): void => {
      const a = Phaser.Math.DegToRad(degrees);
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      for (const offset of [-canopyW, 0, canopyW]) {
        const x = x0 + offset;
        const cx = x + dx * len * 0.5;
        const cy = y0 + dy * len * 0.5 + droop * 0.12;
        const ex = x + dx * len;
        const ey = y0 + dy * len + droop;
        const at = (t: number): { x: number; y: number } => {
          const u = 1 - t;
          return {
            x: u * u * x + 2 * u * t * cx + t * t * ex,
            y: u * u * y0 + 2 * u * t * cy + t * t * ey,
          };
        };
        // The wood itself stays quiet: a thin, slightly faded line. What the
        // eye should read is the foliage on it, not the stick underneath.
        g.lineStyle(
          between(1.6, 2.6) * grow,
          0x080f09,
          depthAlpha(y0 + dy * len * 0.5) * 0.8,
        );
        g.strokePoints(curvePoints(x, y0, cx, cy, ex, ey), false);
        // Leaves sit close together along the whole branch — sampled finely,
        // so a long branch carries foliage rather than reading as a bare wire.
        const steps = Math.max(8, Math.round(len / 8));
        for (let i = 2; i <= steps; i++) {
          if (rnd() < 0.12) continue;
          const p = at(i / steps);
          const side = rnd() < 0.5 ? -1 : 1;
          const size = between(16, 30) * grow;
          const out = between(3, 8) * grow;
          g.fillStyle(canopyGreens[Math.floor(rnd() * canopyGreens.length)], depthAlpha(p.y));
          leaf(
            // offset away from the branch, at right angles to it
            p.x - dy * side * out,
            p.y + dx * side * out,
            size,
            size * between(0.38, 0.52),
            a + side * between(0.45, 1.25) + between(0.05, 0.35),
          );
        }
      }
    };
    // Branches at every angle from level to steep, of very different lengths,
    // hanging from all along the top — so no eye finds the beat of the repeat.
    for (const [x0, y0, deg, len, droop] of [
      [10, 40, 12, 150, 46],
      [46, 8, 66, 104, 22],
      [88, 62, 168, 122, 38],
      [124, 22, 38, 168, 54],
      [168, 54, 96, 88, 12],
      [206, 12, 148, 136, 44],
      [246, 66, 24, 96, 30],
      [286, 30, 74, 148, 26],
      [330, 6, 160, 110, 40],
      [368, 48, 44, 130, 48],
      [412, 18, 118, 92, 20],
      [452, 58, 8, 128, 52],
      [498, 26, 88, 118, 18],
      [536, 60, 138, 104, 34],
      [576, 14, 56, 142, 44],
      [614, 46, 172, 96, 30],
    ] as const) {
      branch(x0, y0, deg, len, droop);
    }
    // Three heavy boughs per tile that reach right down into the picture. At
    // roughly one per screen they push across the view now and then, which is
    // what makes the plane read as being in front.
    for (const [x0, y0, deg, len, droop] of [
      [150, 16, 58, 176, 58],
      [372, 10, 112, 168, 62],
      [594, 20, 72, 158, 56],
    ] as const) {
      branch(x0, y0, deg, len, droop, 1.45);
    }

    // A few loose sprays of leaves, as if from branches out of frame
    for (const [cx, cy] of [
      [88, 122],
      [204, 158],
      [348, 104],
      [412, 170],
      [556, 132],
      [612, 96],
    ] as const) {
      for (const offset of [-canopyW, 0, canopyW]) {
        const count = Math.floor(between(2, 5));
        for (let i = 0; i < count; i++) {
          const size = between(14, 24);
          g.fillStyle(canopyGreens[Math.floor(rnd() * canopyGreens.length)], depthAlpha(cy));
          leaf(
            cx + offset + between(-22, 22),
            cy + between(-16, 16),
            size,
            size * between(0.38, 0.52),
            between(-1.4, 1.4),
          );
        }
      }
    }
    g.generateTexture('canopy-front', canopyW, canopyH);
    g.clear();

    // Woods platforms are boughs, not masonry: a branch that has grown out
    // over the path and flattened towards its end. Three tiles make any
    // length — a thick root end, straight middle, tapering tip — and each
    // only fills the upper half of its tile, so the branch stays slender
    // while the ground the player walks on is still the tile's top edge.
    const bough = (name: string, thick: number, thin: number, tip: boolean): void => {
      const body = [
        { x: 0, y: 0 },
        { x: 32, y: tip ? 6 : 0 },
        { x: 32, y: tip ? 6 + thin : thin },
        { x: 0, y: thick },
      ];
      g.fillStyle(0x4a3620);
      g.fillPoints(body, true);
      g.fillStyle(0x5f4629);
      g.fillRect(2, thick * 0.45, 26, 2);
      g.fillStyle(0x3a2a19);
      g.fillRect(8, thick * 0.7, 12, 2);
      // Moss along the top, where the light and the rain reach it
      g.fillStyle(0x2f6b2f);
      g.fillRect(0, 0, 32, 6);
      g.fillStyle(0x3d8b3a);
      g.fillRect(0, 0, 32, 3);
      g.fillCircle(7, 4, 3);
      g.fillCircle(22, 3, 4);
      if (tip) {
        g.fillStyle(0x4a3620);
        g.fillEllipse(30, 9, 8, 7);
      }
      g.generateTexture(name, 32, 32);
      g.clear();
    };
    bough('bough-root', 22, 20, false);
    bough('bough-mid', 20, 19, false);
    bough('bough-tip', 19, 9, true);

    // Ant hill: a mound of needles and twigs, as tall as the ants are small
    g.fillStyle(0x4a3520);
    g.fillEllipse(33, 40, 66, 26);
    g.fillStyle(0x5c4326);
    g.fillTriangle(33, 2, 4, 42, 62, 42);
    g.fillStyle(0x6b4f2c);
    g.fillTriangle(29, 8, 10, 42, 44, 42);
    g.fillStyle(0x3f2d1a);
    for (const [nx, ny, len] of [
      [16, 30, 9],
      [24, 20, 7],
      [40, 26, 8],
      [46, 34, 10],
      [33, 12, 6],
      [21, 38, 8],
      [45, 16, 7],
    ] as const) {
      g.fillRect(nx, ny, 2, len);
      g.fillRect(nx - len * 0.4, ny + len * 0.5, len, 2);
    }
    g.fillStyle(0x2f6b2f);
    g.fillEllipse(8, 40, 14, 7);
    g.fillEllipse(58, 41, 12, 6);
    g.generateTexture('ant-hill', 66, 44);
    g.clear();

    // Mossy log tile (woods platforms)
    g.fillStyle(0x8a6035);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x6b4527);
    g.fillRect(0, 12, 32, 2);
    g.fillRect(0, 24, 32, 2);
    g.fillStyle(0x75512c);
    g.fillRect(6, 17, 5, 4);
    g.fillRect(21, 28, 5, 3);
    g.fillStyle(0x4a9b4a);
    g.fillRect(0, 0, 32, 5);
    g.fillCircle(6, 5, 4);
    g.fillCircle(19, 5, 5);
    g.fillCircle(29, 4, 3);
    g.fillStyle(0x66b04a);
    g.fillRect(0, 0, 32, 2);
    g.generateTexture('log-moss', 32, 32);
    g.clear();

    // Floating log: a mossy trunk drifting on the water
    g.fillStyle(0x7a5230);
    g.fillRoundedRect(0, 6, 96, 20, 9);
    g.fillStyle(0x8f6539);
    g.fillRoundedRect(2, 8, 92, 10, 5);
    g.fillStyle(0x5f3f24);
    g.fillRect(24, 8, 2, 16);
    g.fillRect(58, 8, 2, 16);
    g.fillStyle(0x4a9b4a);
    g.fillEllipse(20, 8, 24, 8);
    g.fillEllipse(52, 7, 18, 7);
    g.fillEllipse(78, 8, 20, 8);
    g.fillStyle(0x66b04a);
    g.fillEllipse(20, 6, 14, 4);
    g.fillEllipse(78, 6, 12, 4);
    // Cut end with year rings
    g.fillStyle(0xb08a58);
    g.fillEllipse(92, 16, 10, 20);
    g.lineStyle(1.5, 0x8a6035);
    g.strokeEllipse(92, 16, 6, 12);
    g.generateTexture('float-log', 98, 30);
    g.clear();

    // Clear forest stream: surface tile and deeper fill
    g.fillStyle(0x4f9fd0);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xa9dcf0);
    g.fillRect(0, 0, 32, 3);
    g.fillRect(4, 7, 9, 2);
    g.fillRect(19, 11, 8, 2);
    g.generateTexture('stream', 32, 32);
    g.clear();
    g.fillStyle(0x35719c);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x2d5f85);
    g.fillRect(6, 9, 9, 3);
    g.fillRect(19, 20, 7, 3);
    g.generateTexture('stream-deep', 32, 32);
    g.clear();

    // Wooden signpost marking the end of the woods level. It points the one
    // way that matters — onwards, to the right — and carries a wanted poster
    // of what waits at the end of the woods. The poster is a drawing rather
    // than a word, so it needs no translating and everyone reads it at once.
    // The arm leads, the poster hangs high under it, well clear of the grass.
    const plank = (px: number, py: number, w: number, h: number): void => {
      const tip = px + w;
      const shape = [
        { x: px, y: py },
        { x: tip - 17, y: py },
        { x: tip, y: py + h / 2 },
        { x: tip - 17, y: py + h },
        { x: px, y: py + h },
      ];
      g.fillStyle(0xb08a58);
      g.fillPoints(shape, true);
      g.lineStyle(3, 0x5f3f24);
      g.strokePoints(shape, true);
      // A carved arrow pointing the way
      const ax = px + w / 2;
      const ay = py + h / 2;
      g.fillStyle(0x5f3f24);
      g.fillRect(ax - 34, ay - 5, 42, 10);
      g.fillTriangle(ax + 8, ay - 16, ax + 8, ay + 16, ax + 32, ay);
    };

    // Post
    g.fillStyle(0x7a5230);
    g.fillRect(62, 14, 16, 176);
    g.fillStyle(0x8f6539);
    g.fillRect(62, 14, 6, 176);
    g.lineStyle(3, 0x5f3f24);
    g.strokeRect(62, 14, 16, 176);
    // The arm reaches out on both sides of the post, not just towards its tip
    plank(10, 22, 124, 38);

    // Two cords holding the poster close under the arm
    g.lineStyle(2, 0x5f3f24);
    g.lineBetween(56, 60, 50, 78);
    g.lineBetween(86, 60, 92, 78);

    // The poster itself: weathered paper with two torn corners
    const paper = [
      { x: 47, y: 78 },
      { x: 98, y: 78 },
      { x: 98, y: 123 },
      { x: 93, y: 128 },
      { x: 42, y: 128 },
      { x: 42, y: 83 },
    ];
    g.fillStyle(0xf2e6c8);
    g.fillPoints(paper, true);
    g.lineStyle(2, 0x8a6b3f);
    g.strokePoints(paper, true);
    g.fillStyle(0x5f3f24);
    g.fillCircle(50, 83, 1.8);
    g.fillCircle(91, 83, 1.8);

    // The wanted face: the carnivorous plant that guards the end of the woods
    const jawCx = 70;
    const jawCy = 98;
    const jawR = 13;
    g.lineStyle(4, 0x3f7d33);
    g.strokePoints(curvePoints(70, 124, 65, 116, 69, 109), false);
    g.fillStyle(0x4a9b4a);
    g.fillEllipse(58, 118, 15, 7);
    g.fillEllipse(82, 116, 15, 7);
    g.fillStyle(0xa8324a);
    g.fillCircle(jawCx, jawCy, jawR - 1);
    // Both jaws are slices of the same head, leaving the mouth wide open
    // towards the left — the side the player comes walking from.
    for (const [from, to] of [
      [225, 360],
      [0, 135],
    ] as const) {
      g.fillStyle(0x3f7d33);
      g.slice(jawCx, jawCy, jawR, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to));
      g.fillPath();
    }
    g.fillStyle(0x66b04a);
    g.fillCircle(jawCx + 5, jawCy - 6, 2.4);
    g.fillCircle(jawCx - 2, jawCy - 9, 1.9);
    g.fillCircle(jawCx + 7, jawCy + 5, 2.1);
    // A row of teeth along each jaw rim, pointing into the open mouth
    const teeth = (angle: number, into: number): void => {
      const a = Phaser.Math.DegToRad(angle);
      const ex = Math.cos(a);
      const ey = Math.sin(a);
      g.fillStyle(0xfff6e8);
      for (const t of [0.5, 0.72, 0.94]) {
        const bx = jawCx + ex * t * jawR;
        const by = jawCy + ey * t * jawR;
        g.fillTriangle(
          bx - ex * 2,
          by - ey * 2,
          bx + ex * 2,
          by + ey * 2,
          bx - ey * into * 4.2,
          by + ex * into * 4.2,
        );
      }
    };
    teeth(225, -1);
    teeth(135, 1);

    // Ivy winding up the post below the poster
    g.lineStyle(2.5, 0x3f7d33);
    g.strokePoints(curvePoints(68, 188, 52, 176, 60, 156), false);
    g.strokePoints(curvePoints(60, 156, 40, 150, 46, 166), false);
    g.fillStyle(0x4a9b4a);
    for (const [lx, ly] of [
      [56, 180],
      [58, 165],
      [50, 155],
      [44, 164],
    ] as const) {
      g.fillEllipse(lx, ly, 14, 10);
    }
    g.fillStyle(0x66b04a);
    g.fillEllipse(59, 164, 7, 5);
    g.fillEllipse(51, 154, 7, 5);
    // Foot: grass and a mushroom
    g.lineStyle(2.5, 0x4a9b4a);
    g.lineBetween(52, 190, 46, 172);
    g.lineBetween(86, 190, 92, 174);
    g.lineBetween(94, 190, 100, 178);
    g.fillStyle(0xf0e6d2);
    g.fillRect(88, 178, 5, 12);
    g.fillStyle(0xa8342a);
    g.fillEllipse(90, 178, 20, 13);
    g.fillStyle(0xd94a3d);
    g.fillEllipse(90, 176, 18, 12);
    g.fillStyle(0xfff6e8);
    g.fillCircle(86, 175, 2);
    g.fillCircle(94, 177, 1.6);
    g.generateTexture('signpost', 140, 190);
    g.clear();

    // Ants and beetles crawling in the background — pure decoration
    const antFrame = (name: string, lift: number): void => {
      g.fillStyle(0x3a2a20);
      g.fillEllipse(4, 6, 6, 6);
      g.fillEllipse(9, 6, 5, 5);
      g.fillEllipse(15, 6, 9, 7);
      g.lineStyle(1, 0x3a2a20);
      g.lineBetween(3, 4, 0, 1);
      g.lineBetween(5, 4, 2, 0);
      for (const [lx, dir, step] of [
        [5, -1, 0],
        [9, 1, 1],
        [13, -1, 0],
      ] as const) {
        g.lineBetween(lx, 8, lx + dir * 3, 10 - (step ? lift : 0));
      }
      g.generateTexture(name, 20, 11);
      g.clear();
    };
    antFrame('ant-0', 0);
    antFrame('ant-1', 2);

    const beetleFrame = (name: string, lift: number): void => {
      g.fillStyle(0x2b2b33);
      for (const [lx, step] of [
        [6, 0],
        [11, 1],
        [16, 0],
      ] as const) {
        g.fillRect(lx, 10, 2, 3 - (step ? lift : 0));
      }
      g.fillEllipse(5, 7, 7, 7);
      g.fillStyle(0x4a3f6b);
      g.fillEllipse(14, 7, 18, 12);
      g.fillStyle(0x6b5c99);
      g.fillEllipse(12, 5, 12, 6);
      g.lineStyle(1, 0x2b2b33);
      g.lineBetween(14, 2, 14, 12);
      g.fillStyle(0xffd54a);
      g.fillCircle(3, 5, 1.2);
      g.generateTexture(name, 24, 14);
      g.clear();
    };
    beetleFrame('beetle-0', 0);
    beetleFrame('beetle-1', 2);

    // Swamp mist wisp: stacked ellipses of decreasing size, so the strip
    // fades out towards its edges instead of reading as one hard circle
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xffffff, 0.12);
      g.fillEllipse(130, 20, 254 - i * 46, 32 - i * 5);
    }
    g.generateTexture('mist', 260, 40);
    g.clear();

    // Water: surface tile (light ripple on top) and deep fill tile
    g.fillStyle(0x4a8c82);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x7fc4b4);
    g.fillRect(0, 0, 32, 3);
    g.fillRect(3, 6, 8, 2);
    g.fillRect(18, 9, 9, 2);
    g.generateTexture('water', 32, 32);
    g.clear();
    g.fillStyle(0x3a6e66);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x33615a);
    g.fillRect(5, 8, 8, 3);
    g.fillRect(20, 18, 7, 3);
    g.generateTexture('water-deep', 32, 32);
    g.clear();

    // Leaping fish (drawn nose-up; flipped vertically while falling)
    g.fillStyle(0xb86a2e);
    g.fillTriangle(11, 20, 3, 31, 19, 31);
    g.fillStyle(0xe08e45);
    g.fillEllipse(11, 13, 16, 24);
    g.fillStyle(0xb86a2e);
    g.fillTriangle(3, 12, 0, 18, 6, 16);
    g.fillTriangle(19, 12, 22, 18, 16, 16);
    g.fillStyle(0xf2b980);
    g.fillEllipse(13, 15, 7, 12);
    g.fillStyle(0xffffff);
    g.fillCircle(13, 6, 3);
    g.fillStyle(0x222222);
    g.fillCircle(14, 6, 1.5);
    g.generateTexture('fish', 22, 32);
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

    // Koko, the plucky orange bird — feet positions make the walk cycle
    const birdFrame = (name: string, feet: [number, number][], bodyY = 0): void => {
      g.fillStyle(0xe86a17);
      for (const [fx, fy] of feet) g.fillRect(fx, fy, 8, 32 - fy);
      g.fillStyle(0xff8c42);
      g.fillRoundedRect(0, 4 + bodyY, 28, 24, 8);
      g.fillStyle(0xffffff);
      g.fillCircle(19, 13 + bodyY, 6);
      g.fillStyle(0x222222);
      g.fillCircle(21, 13 + bodyY, 3);
      g.fillStyle(0xffc93c);
      g.fillTriangle(26, 17 + bodyY, 34, 20 + bodyY, 26, 23 + bodyY);
      g.generateTexture(name, 34, 32);
      g.clear();
    };
    birdFrame('koko-idle', [[4, 28], [16, 28]]);
    birdFrame('koko-walk-0', [[0, 28], [18, 28]]);
    birdFrame('koko-walk-1', [[10, 28], [12, 28]], 2);
    birdFrame('koko-walk-2', [[18, 28], [0, 28]]);
    birdFrame('koko-jump', [[7, 26], [14, 26]]);

    // Pup, a cuddly little dachshund — long body, stubby legs, red collar
    const dogFrame = (name: string, legs: number[], tailTip: [number, number]): void => {
      g.fillStyle(0x7d5631);
      g.fillTriangle(6, 16, tailTip[0], tailTip[1], 9, 12);
      g.fillStyle(0xb5854f);
      for (const lx of legs) g.fillRect(lx, 22, 4, 8);
      g.fillRoundedRect(4, 12, 34, 12, 6);
      g.fillCircle(38, 12, 8);
      g.fillRect(42, 11, 4, 5);
      g.fillStyle(0xd94a4a);
      g.fillRect(30, 12, 4, 11);
      g.fillStyle(0x7d5631);
      g.fillEllipse(34, 11, 8, 13);
      g.fillStyle(0x222222);
      g.fillCircle(40, 9, 2);
      g.fillCircle(46, 12, 3);
      g.fillStyle(0xff8fa3);
      g.fillRect(43, 16, 3, 4);
      g.generateTexture(name, 48, 30);
      g.clear();
    };
    dogFrame('dog-idle', [12, 18, 30, 36], [0, 6]);
    dogFrame('dog-walk-0', [8, 20, 28, 40], [0, 4]);
    dogFrame('dog-walk-1', [13, 17, 31, 35], [0, 10]);
    dogFrame('dog-walk-2', [14, 22, 26, 38], [0, 4]);
    dogFrame('dog-jump', [6, 12, 38, 44], [2, 2]);

    // Golden frame marking the selected character on the menu
    g.lineStyle(4, 0xffd700);
    g.strokeRoundedRect(2, 2, 108, 96, 16);
    g.generateTexture('select-ring', 112, 100);
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

    // Sparky (from a hand-drawn design): a spiky head standing straight on two
    // purple shoes — no body, no legs. The spikes are part of the head outline,
    // not a separate colour. Its googly eyes roll in opposite directions, and
    // the spikes make it un-stompable, so any contact is deadly.
    const SPARKY_FRAMES = 8;
    const sparkyFrame = (index: number): void => {
      const t = (index / SPARKY_FRAMES) * Math.PI * 2;
      const cx = 24;
      const cy = 23 + Math.round(Math.sin(t * 2));
      const outer = 22;
      const inner = 14;
      const spikes = 13;

      // Shoes first — the head is drawn over them and sits right on top,
      // so they peek out to the sides and below the lowest spikes. The step
      // is small and rounded to whole pixels: a wider swing would push a shoe
      // past the texture edge and clip it.
      const swing = Math.round(Math.cos(t) * 2.5);
      for (const sx of [7 + swing, 25 - swing]) {
        g.fillStyle(0x5b32b0);
        g.fillRoundedRect(sx, 37, 16, 11, 5);
        g.fillStyle(0x7d4ce0);
        g.fillRoundedRect(sx + 2, 38, 12, 7, 3);
      }

      // Head: a spiked star drawn in one piece, so the spikes read as its shape
      const pts: Phaser.Types.Math.Vector2Like[] = [];
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? outer : inner;
        const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
      }
      g.fillStyle(0xf2913d);
      g.fillPoints(pts, true);
      g.lineStyle(2, 0xc4701f);
      g.strokePoints(pts, true);

      // Googly eyes rolling in opposite directions
      const roll = 2.4;
      const eyes: [number, number, number][] = [
        [cx - 6, cy - 5, t],
        [cx + 6, cy - 5, -t],
      ];
      for (const [ex, ey, angle] of eyes) {
        g.fillStyle(0xffffff);
        g.fillCircle(ex, ey, 6);
        g.lineStyle(1, 0xc4701f);
        g.strokeCircle(ex, ey, 6);
        g.fillStyle(0x111111);
        g.fillCircle(ex + Math.cos(angle) * roll, ey + Math.sin(angle) * roll, 3.4);
      }

      // Grin: a half-moon mouth with just two teeth, as in the sketch
      const mouthY = cy + 3;
      g.fillStyle(0x2b2b2b);
      g.slice(cx, mouthY, 10, 0, Math.PI);
      g.fillPath();
      g.fillStyle(0xf5f5f5);
      g.fillRect(cx - 6, mouthY, 5, 5);
      g.fillRect(cx + 1, mouthY, 5, 5);

      g.generateTexture(`sparky-${index}`, 48, 48);
      g.clear();
    };
    for (let i = 0; i < SPARKY_FRAMES; i++) {
      sparkyFrame(i);
    }

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

    // Pause button (developer mode only)
    g.fillStyle(0x000000, 0.35);
    g.fillCircle(22, 22, 20);
    g.lineStyle(3, 0xff6b6b, 0.9);
    g.strokeCircle(22, 22, 20);
    g.fillStyle(0xff6b6b);
    g.fillRect(15, 13, 5, 18);
    g.fillRect(24, 13, 5, 18);
    g.generateTexture('btn-pause', 44, 44);
    g.clear();

    // Sound toggle (title screen)
    const speaker = (name: string, on: boolean): void => {
      g.fillStyle(0x000000, 0.35);
      g.fillCircle(20, 20, 19);
      g.lineStyle(2, 0xffd700, 0.8);
      g.strokeCircle(20, 20, 19);
      g.fillStyle(0xffd700);
      g.fillRect(11, 16, 5, 8);
      g.fillTriangle(16, 20, 22, 12, 22, 28);
      if (on) {
        g.lineStyle(2, 0xffd700);
        g.beginPath();
        g.arc(23, 20, 5, -0.9, 0.9);
        g.strokePath();
        g.beginPath();
        g.arc(23, 20, 9, -0.9, 0.9);
        g.strokePath();
      } else {
        g.lineStyle(2.5, 0xffd700);
        g.lineBetween(25, 15, 33, 25);
        g.lineBetween(33, 15, 25, 25);
      }
      g.generateTexture(name, 40, 40);
      g.clear();
    };
    speaker('btn-sound-on', true);
    speaker('btn-sound-off', false);

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
      key: 'koko-walk',
      frames: [
        { key: 'koko-walk-0' },
        { key: 'koko-walk-1' },
        { key: 'koko-walk-2' },
        { key: 'koko-walk-1' },
      ],
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: 'dog-walk',
      frames: [
        { key: 'dog-walk-0' },
        { key: 'dog-walk-1' },
        { key: 'dog-walk-2' },
        { key: 'dog-walk-1' },
      ],
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: 'sparky-walk',
      frames: Array.from({ length: 8 }, (_, i) => ({ key: `sparky-${i}` })),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'fliegi-fly',
      frames: Array.from({ length: 4 }, (_, i) => ({ key: `fliegi-${i}` })),
      frameRate: 11,
      repeat: -1,
    });
    this.anims.create({
      key: 'fly-buzz',
      frames: [{ key: 'fly-0' }, { key: 'fly-1' }],
      frameRate: 20,
      repeat: -1,
    });
    this.anims.create({
      key: 'ant-crawl',
      frames: [{ key: 'ant-0' }, { key: 'ant-1' }],
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: 'beetle-crawl',
      frames: [{ key: 'beetle-0' }, { key: 'beetle-1' }],
      frameRate: 6,
      repeat: -1,
    });

    this.scene.start('Menu');
  }
}
