import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue } from "./utils";

k.loadSprite("spritesheet", "./character-spritesheet.png", {
  sliceX: 24,
  sliceY: 3,
  anims: {
    "idle-down": { from: 42, to: 47, loop: true, speed: 8 },
    "walk-down": { from: 66, to: 71, loop: true, speed: 8 },
    "idle-side": { from: 24, to: 29, loop: true, speed: 8 },
    "walk-side": { from: 48, to: 53, loop: true, speed: 8 },
    "idle-up": { from: 30, to: 35, loop: true, speed: 8 },
    "walk-up": { from: 54, to: 59, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 32, 32) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue("test", () => (player.isInDialogue = false));
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoint") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  k.onUpdate(() => {
    k.camPos(player.pos.x + 100, player.pos.y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);
  });
});

k.go("main");
