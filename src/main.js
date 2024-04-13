import { k } from "./kaboomCtx";

k.loadSprite("spritesheet", "./character-spritesheet.png", {
  sliceX: 24,
  SliceY: 3,
  anims: {
    "idle-down": { from: 42, to: 47, loop: true, speed: 8 },
    "walk-down": { from: 66, to: 71, loop: true, speed: 8 },
    "idle-side": { from: 24, to: 29, loop: true, speed: 8 },
    "walk-side": { from: 48, to: 53, loop: true, speed: 8 },
    "idle-up": { from: 30, to: 35, loop: true, speed: 8 },
    "walk-up": { from: 54, to: 59, loop: true, speed: 8 },
  },
});
