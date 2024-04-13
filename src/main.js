import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./character-spritesheet.png", {
  sliceX: 24,
  sliceY: 3,
  anims: {
    "idle-down": { from: 42, to: 47, loop: true, speed: 8 },
    "walk-down": { from: 66, to: 71, loop: true, speed: 8 },
    "idle-right": { from: 24, to: 29, loop: true, speed: 8 },
    "walk-right": { from: 48, to: 53, loop: true, speed: 8 },
    "idle-left": { from: 36, to: 41, loop: true, speed: 8 },
    "walk-left": { from: 60, to: 65, loop: true, speed: 8 },
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
    k.area({ shape: new k.Rect(k.vec2(0, 4), 48, 48) }),
    k.body(),
    k.anchor("bot"),
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

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x + 100, player.pos.y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      console.log("moving up");
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      console.log("moving down");
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      if (player.curAnim() !== "walk-right") {
        player.play("walk-right");
        player.direction = "right";
        console.log("moving right");
        return;
      }
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      if (player.curAnim() !== "walk-left") {
        player.play("walk-left");
        player.direction = "left";
        console.log("moving left");
        return;
      }
    }
  });

  k.onMouseRelease(() => {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "right") {
      player.play("idle-right");
      return;
    }
    if (player.direction === "left") {
      player.play("idle-left");
      return;
    }
  });
});

k.go("main");
