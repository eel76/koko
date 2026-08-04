// Playable characters. Textures and walk animations are generated in
// BootScene; the selection is made on the menu screen and persisted locally.
export type CharacterId = 'stick' | 'koko' | 'dog';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  idleTexture: string;
  walkAnim: string;
  jumpTexture: string;
  // The stick figure is drawn white and tinted to contrast the level theme
  tintByTheme: boolean;
  bodySize: [number, number];
  bodyOffset: [number, number];
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'stick',
    name: 'STICK',
    idleTexture: 'player-idle',
    walkAnim: 'player-walk',
    jumpTexture: 'player-jump',
    tintByTheme: true,
    bodySize: [16, 34],
    bodyOffset: [6, 2],
  },
  {
    id: 'koko',
    name: 'KOKO',
    idleTexture: 'koko-idle',
    walkAnim: 'koko-walk',
    jumpTexture: 'koko-jump',
    tintByTheme: false,
    bodySize: [24, 30],
    bodyOffset: [4, 2],
  },
  {
    id: 'dog',
    name: 'PUP',
    idleTexture: 'dog-idle',
    walkAnim: 'dog-walk',
    jumpTexture: 'dog-jump',
    tintByTheme: false,
    bodySize: [36, 24],
    bodyOffset: [6, 6],
  },
];

const KEY = 'koko-run.character';

export function getSelectedCharacter(): CharacterDef {
  try {
    const id = localStorage.getItem(KEY);
    const found = CHARACTERS.find((c) => c.id === id);
    if (found) return found;
  } catch {
    // localStorage unavailable — fall through to the default
  }
  return CHARACTERS[0];
}

export function setSelectedCharacter(id: CharacterId): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // not persisted, selection still applies for this session
  }
}
