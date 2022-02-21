import { audio } from "./audio.js";
import { images } from "./images.js";
import {
  isOnTopOfPlatform,
  collisonTop,
  isOnTopOfPlatformCircle,
  createImage,
  createImageAsync,
  hitBottomOfPlatform,
  hitSideOfPlatform,
  ObjectsTouch,
} from "./util.js";
  
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

var gravity = 2.0;

class Player {
  constructor() {
    this.shooting = false;
    this.speed = 10;
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.scale = 0.3;
    this.width = 398 * this.scale;
    this.height = 353 * this.scale;

    this.image = createImage(images.levels[1].spriteStandRight);
    this.frames = 0;
    this.sprites = {
      stand: {
        right: createImage(images.levels[1].spriteStandRight),
        left: createImage(images.levels[1].spriteStandLeft),
        fireFlower: {
          right: createImage(images.levels[1].spriteFireFlowerStandRight),
          left: createImage(images.levels[1].spriteFireFlowerStandLeft),
        },
      },
      run: {
        right: createImage(images.levels[1].spriteRunRight),
        left: createImage(images.levels[1].spriteRunLeft),
        fireFlower: {
          right: createImage(images.levels[1].spriteFireFlowerRunRight),
          left: createImage(images.levels[1].spriteFireFlowerRunLeft),
        },
      },
      jump: {
        right: createImage(images.levels[1].spriteJumpRight),
        left: createImage(images.levels[1].spriteJumpLeft),
        fireFlower: {
          right: createImage(images.levels[1].spriteFireFlowerJumpRight),
          left: createImage(images.levels[1].spriteFireFlowerJumpLeft),
        },
      },
      shoot: {
        fireFlower: {
          left: createImage(images.levels[1].spriteFireFlowerShootLeft),
          right: createImage(images.levels[1].spriteFireFlowerShootRight),
        },
      },
    };

    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = 398;
    this.powerUps = {
      fireFlower: false,
    };
    this.invincible = false;
    this.opacity = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = "rgba(255,0,0,0.2)";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      353,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    c.restore();
  }

  update() {
    this.frames++;
    const { currentSprite, sprites } = this;
    if (
      this.frames > 58 &&
      currentSprite === (sprites.stand.right || sprites.stand.left)
    )
      this.frames = 0;
    else if (
      this.frames > 28 &&
      (currentSprite === sprites.run.right ||
        sprites.run.left ||
        currentSprite === sprites.run.fireFlower.right ||
        sprites.run.fireFlower.left)
    ) {
      this.frames = 0;
    } else if (
      currentSprite === sprites.jump.right ||
      currentSprite === sprites.jump.left ||
      currentSprite === sprites.jump.fireFlower.right ||
      currentSprite === sprites.jump.fireFlower.left ||
      currentSprite === sprites.shoot.fireFlower.left ||
      currentSprite === sprites.shoot.fireFlower.right
    ) {
      this.frames = 0;
    }
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //Adding Gravity
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
    if (player.invincible) {
      if (this.opacity === 1) this.opacity = 0;
      else this.opacity = 1;
    } else {
      this.opacity = 1;
    }
  }
}

class Platform {
  constructor({ x, y, image, block }) {
    this.position = {
      x,
      y,
    };

    this.velocity = {
      x: 0,
    };

    this.image = image;

    this.width = image.width;
    this.height = image.height;
    this.block = block;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: 0,
    };

    this.image = image;

    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class Goomba {
  constructor({
    position,
    velocity,
    distance = {
      limit: 50,
      traveled: 0,
    },
  }) {
    this.position = {
      x: position.x,
      y: position.y,
    };
    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };

    this.width = 43.33;
    this.height = 50;

    this.image = createImage(images.levels[1].spriteGoomba);
    this.frames = 0;

    this.distance = distance;
  }

  draw() {
    c.drawImage(
      this.image,
      130 * this.frames,
      0,
      130,
      150,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frames++;
    if (this.frames >= 58) this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }

    //walk the goomba back and forth
    this.distance.traveled += Math.abs(this.velocity.x);
    if (this.distance.traveled > this.distance.limit) {
      this.distance.traveled = 0;
      this.velocity.x = -this.velocity.x;
    }
  }
}

class FireFlower {
  constructor({ position, velocity }) {
    this.position = {
      x: position.x,
      y: position.y,
    };
    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };

    this.width = 56;
    this.height = 60;

    this.image = createImage(images.levels[1].spriteFireFlower);
    this.frames = 0;
  }

  draw() {
    c.drawImage(
      this.image,
      56 * this.frames,
      0,
      56,
      60,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frames++;
    if (this.frames >= 75) this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class Particle {
  constructor({
    position,
    velocity,
    radius,
    color = "#654428",
    fireball = false,
    fades = false,
  }) {
    this.position = {
      x: position.x,
      y: position.y,
    };
    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };
    this.ttl = 300;
    this.radius = radius;
    this.color = color;
    this.fireball = fireball;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.ttl--;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.radius + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity * 0.1;
    }
    if (this.fades && this.opacity > 0) {
      this.opacity -= 0.01;
    }
    if (this.opacity < 0) {
      this.opacity = 0;
    }
  }
}

let platformImage;
let platformSmallTallImage;
let blockTriImage;
let lgPlatformImage;
let mdPlatformImage;
let tPlatformImage;
let xtPlatformImage;
let blockImage;
let flagPoleImage;

let player = new Player();
let platforms = [];
let genericObjects = [];
let goombas = [];
let particles = [];
let fireFlowers = [];

let keys = {};
let lastKey;
let scrollOffset = 0;
let flagPole;
let game;
let currentLevel = 1;

function selectLevel(currentLevel) {
  if (!audio.musicLevel1.play()) audio.musicLevel1.play();
  switch (currentLevel) {
    case 1:
      init();
      break;
    case 2:
      initLevel2();
      break;
  }
}

async function init() {
  player = new Player();
  keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };
  scrollOffset = 0;
  game = {
    disableUserInput: false,
  };
  platformImage = await createImageAsync(images.levels[1].platform);
  platformSmallTallImage = await createImageAsync(
    images.levels[1].platformSmallTall
  );
  blockTriImage = await createImageAsync(images.levels[1].blockTri);
  blockImage = await createImageAsync(images.levels[1].block);
  lgPlatformImage = await createImageAsync(images.levels[1].lgPlatform);
  tPlatformImage = await createImageAsync(images.levels[1].tPlatform);
  xtPlatformImage = await createImageAsync(images.levels[1].xtPlatform);
  flagPoleImage = await createImageAsync(images.levels[1].flagPoleSprite);

  flagPole = new GenericObject({
    x: 6968 + 600,
    y: canvas.height - lgPlatformImage.height - flagPoleImage.height,
    image: flagPoleImage,
  });

  fireFlowers = [
    new FireFlower({
      position: {
        x: 400,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 0,
      },
    }),
  ];
  player = new Player();
  const goombaWidth = 43.33;
  goombas = [
    new Goomba({
      position: { x: 908 + lgPlatformImage.width - goombaWidth, y: 100 },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 400, traveled: 0 },
    }),
    new Goomba({
      position: {
        x: 3249 + lgPlatformImage.width - goombaWidth - goombaWidth,
        y: 100,
      },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 400, traveled: 0 },
    }),
    new Goomba({
      position: {
        x:
          3249 +
          lgPlatformImage.width -
          goombaWidth -
          goombaWidth -
          goombaWidth,
        y: 100,
      },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 400, traveled: 0 },
    }),
    new Goomba({
      position: {
        x:
          3249 +
          lgPlatformImage.width -
          goombaWidth -
          goombaWidth -
          goombaWidth -
          goombaWidth,
        y: 100,
      },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 400, traveled: 0 },
    }),
    new Goomba({
      position: {
        x:
          3249 +
          lgPlatformImage.width -
          goombaWidth -
          goombaWidth -
          goombaWidth -
          goombaWidth -
          goombaWidth,
        y: 100,
      },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 400, traveled: 0 },
    }),
    new Goomba({
      position: {
        x: 5135 + xtPlatformImage.width / 2 + goombaWidth,
        y: 100,
      },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 100, traveled: 0 },
    }),
    new Goomba({
      position: {
        x: 6968,
        y: 0,
      },
      velocity: { x: -0.3, y: 0 },
      distance: { limit: 100, traveled: 0 },
    }),
  ];
  particles = [];

  platforms = [
    new Platform({
      x: 908 + 100,
      y: 300,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 908 + 100 + blockImage.width,
      y: 100,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width,
      y: canvas.height - lgPlatformImage.height - tPlatformImage.height,
      image: tPlatformImage,
      block: true,
    }),
    new Platform({
      x: 1991 + lgPlatformImage.width - tPlatformImage.width - 100,
      y:
        canvas.height -
        lgPlatformImage.height -
        tPlatformImage.height +
        blockImage.height,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 5712 + xtPlatformImage.width + 175,
      y: canvas.height - xtPlatformImage.height,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 6116 + 190,
      y: canvas.height - xtPlatformImage.height,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 6116 + 190 * 2,
      y: canvas.height - xtPlatformImage.height,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 6116 + 190 * 3,
      y: canvas.height - xtPlatformImage.height - 100,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 6116 + 190 * 4,
      y: canvas.height - xtPlatformImage.height - 200,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 6116 + 190 * 4 + blockTriImage.width,
      y: canvas.height - xtPlatformImage.height - 200,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 6968 + 400,
      y: canvas.height - lgPlatformImage.height,
      image: lgPlatformImage,
      block: true,
    }),
    new Platform({
      x: 6968 + 400 + lgPlatformImage.width,
      y: canvas.height - lgPlatformImage.height,
      image: lgPlatformImage,
      block: true,
    }),
  ];

  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(images.levels[1].background),
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(images.levels[1].hills),
    }),
  ];

  scrollOffset = 0;

  const platformsMap = [
    "lg",
    "lg",
    "gap",
    "lg",
    "gap",
    "gap",
    "lg",
    "gap",
    "t",
    "gap",
    "xt",
    "gap",
    "xt",
    "gap",
    "gap",
    "xt",
  ];
  let platformDistance = 0;
  platformsMap.forEach((symbol) => {
    switch (symbol) {
      case "lg":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - lgPlatformImage.height,
            image: lgPlatformImage,
            block: true,
          })
        );
        platformDistance += lgPlatformImage.width - 2;
        break;

      case "gap":
        platformDistance += 175;
        break;

      case "t":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - tPlatformImage.height,
            image: tPlatformImage,
            block: true,
          })
        );
        platformDistance += tPlatformImage.width - 2;
        break;
      case "xt":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - xtPlatformImage.height,
            image: xtPlatformImage,
            block: true,
          })
        );
        platformDistance += xtPlatformImage.width - 2;
        break;

      default:
        break;
    }
  });
}

//Level 2
async function initLevel2() {
  player = new Player();
  keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };
  scrollOffset = 0;

  game = {
    disableUserInput: false,
  };

  blockTriImage = await createImageAsync(images.levels[1].blockTri);
  blockImage = await createImageAsync(images.levels[1].block);
  lgPlatformImage = await createImageAsync(images.levels[2].lgPlatform);
  flagPoleImage = await createImageAsync(images.levels[1].flagPoleSprite);
  const mountains = await createImageAsync(images.levels[2].mountains);
  const mdPlatformImage = await createImageAsync(images.levels[2].mdPlatform);

  flagPole = new GenericObject({
    x: 7680,
    // x: 500,
    y: canvas.height - lgPlatformImage.height - flagPoleImage.height,
    image: flagPoleImage,
  });

  fireFlowers = [
    new FireFlower({
      position: {
        x: 4734 - 28,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 0,
      },
    }),
  ];

  player = new Player();

  const goombaWidth = 43.33;
  goombas = [
    new Goomba({
      // single block goomba
      position: {
        x: 903 + mdPlatformImage.width - goombaWidth,
        y: 100,
      },
      velocity: {
        x: -2,
        y: 0,
      },
      distance: {
        limit: 700,
        traveled: 0,
      },
    }),
    new Goomba({
      // single block goomba
      position: {
        x:
          1878 +
          lgPlatformImage.width +
          155 +
          200 +
          200 +
          200 +
          blockImage.width / 2 -
          goombaWidth / 2,
        y: 100,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      distance: {
        limit: 0,
        traveled: 0,
      },
    }),
    new Goomba({
      position: {
        x: 3831 + lgPlatformImage.width - goombaWidth,
        y: 100,
      },
      velocity: {
        x: -1,
        y: 0,
      },
      distance: {
        limit: lgPlatformImage.width - goombaWidth,
        traveled: 0,
      },
    }),

    new Goomba({
      position: {
        x: 4734,
        y: 100,
      },
      velocity: {
        x: 1,
        y: 0,
      },
      distance: {
        limit: lgPlatformImage.width - goombaWidth,
        traveled: 0,
      },
    }),
  ];
  particles = [];
  platforms = [
    new Platform({
      x: 903 + mdPlatformImage.width + 115,
      y: 300,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 903 + mdPlatformImage.width + 115 + blockTriImage.width,
      y: 300,
      image: blockTriImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 175,
      y: 360,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200,
      y: 300,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200 + 200,
      y: 330,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 1878 + lgPlatformImage.width + 155 + 200 + 200 + 200,
      y: 240,
      image: blockImage,
      block: true,
    }),
    new Platform({
      x: 4734 - mdPlatformImage.width / 2,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 5987,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 5987,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 2,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 2,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787,
      y: canvas.height - lgPlatformImage.height - mdPlatformImage.height * 3,
      image: mdPlatformImage,
    }),
    new Platform({
      x: 6787 + lgPlatformImage.width,
      y: canvas.height - lgPlatformImage.height,
      image: lgPlatformImage,
      block: true,
    }),
  ];
  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(images.levels[2].background),
    }),
    new GenericObject({
      x: -1,
      y: canvas.height - mountains.height,
      image: mountains,
    }),
  ];

  scrollOffset = 0;

  const platformsMap = [
    "lg",
    "md",
    "gap",
    "gap",
    "gap",
    "lg",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "lg",
    "lg",
    "gap",
    "gap",
    "md",
    "gap",
    "gap",
    "md",
    "gap",
    "gap",
    "lg",
  ];

  let platformDistance = 0;

  platformsMap.forEach((symbol) => {
    switch (symbol) {
      case "md":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - mdPlatformImage.height,
            image: mdPlatformImage,
            block: true,
          })
        );

        platformDistance += mdPlatformImage.width - 3;

        break;
      case "lg":
        platforms.push(
          new Platform({
            x: platformDistance - 2,
            y: canvas.height - lgPlatformImage.height,
            image: lgPlatformImage,
            block: true,
          })
        );

        platformDistance += lgPlatformImage.width - 3;

        break;

      case "gap":
        platformDistance += 175;

        break;

      case "t":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - tPlatformImage.height,
            image: tPlatformImage,
            block: true,
          })
        );

        platformDistance += tPlatformImage.width - 2;

        break;

      case "xt":
        platforms.push(
          new Platform({
            x: platformDistance,
            y: canvas.height - xtPlatformImage.height,
            image: xtPlatformImage,
            block: true,
          })
        );

        platformDistance += xtPlatformImage.width - 2;

        break;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObjects) => {
    genericObjects.update();
    genericObjects.velocity.x = 0;
  });

  particles.forEach((particle, index) => {
    particle.update();
    if (
      (particle.fireball &&
        particle.position.x - particle.radius >= canvas.width) ||
      particle.position.x + particle.radius <= 0
    ) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    }
  });

  platforms.forEach((platform) => {
    platform.update();
    platform.velocity.x = 0;
  });
  if (flagPole) {
    flagPole.update();
    flagPole.velocity.x = 0;

    //mario touches flagpole
    //win condition
    // completes level
    if (
      !game.disableUserInput &&
      ObjectsTouch({
        object1: player,
        object2: flagPole,
      })
    ) {
      game.disableUserInput = true;
      player.velocity.x = 0;
      player.velocity.y = 0;
      gravity = 0;
      audio.completeLevel.play();
      audio.musicLevel1.stop();
      player.currentSprite = player.sprites.stand.right;
      if (player.powerUps.fireFlower) {
        player.currentSprite = player.sprites.stand.fireFlower.right;
      }

      //flagpole slide
      setTimeout(() => {
        audio.descend.play();
      }, 200);
      gsap.to(player.position, {
        y: canvas.height - lgPlatformImage.height - player.height,
        duration: 1,
        onComplete() {
          if (player.powerUps.fireFlower) {
            player.currentSprite = player.sprites.run.fireFlower.right;
          } else {
            player.currentSprite = player.sprites.run.right;
          }
        },
      });
      gsap.to(player.position, {
        delay: 1,
        x: canvas.width,
        duration: 1,
        ease: "power1.in",
      });

      //fireworks
      const particleCount = 300;
      const radians = (Math.PI * 2) / particleCount;
      const power = 8;
      let increment = 1;
      const intervalId = setInterval(() => {
        for (let i = 0; i < particleCount; i++) {
          particles.push(
            new Particle({
              position: {
                x: (canvas.width / 4) * increment,
                y: canvas.height / 2,
              },
              velocity: {
                x: Math.cos(radians * i) * power * Math.random(),
                y: Math.sin(radians * i) * power * Math.random(),
              },
              radius: 3 * Math.random(),
              color: `hsl(${Math.random() * 900},50%,50%)`,
              fades: true,
            })
          );
        }
        audio.fireworkBurst.play();
        audio.fireworkWhistle.play();
        if (increment === 3) clearInterval(intervalId);
        increment++;
      }, 1000);

      //switch to next level
      setTimeout(() => {
        currentLevel++;
        gravity = 2.0;
        selectLevel(currentLevel);
      }, 8000);
    }
  }

  //mario obtains powerup
  fireFlowers.forEach((fireFlower, index) => {
    if (
      ObjectsTouch({
        object1: player,
        object2: fireFlower,
      })
    ) {
      audio.obtainPower.play();
      player.powerUps.fireFlower = true;
      setTimeout(() => {
        fireFlowers.splice(index, 1);
      }, 0);
    } else {
      fireFlower.update();
    }
  });

  goombas.forEach((goomba, index) => {
    goomba.update();

    //remove goomba on fireball hit
    particles.forEach((particle, particleIndex) => {
      if (
        particle.fireball &&
        particle.position.x + particle.radius >= goomba.position.x &&
        particle.position.y + particle.radius >= goomba.position.y &&
        particle.position.x - particle.radius <=
          goomba.position.x + goomba.width &&
        particle.position.y - particle.radius <=
          goomba.position.y + goomba.height
      ) {
        for (let i = 0; i < 50; i++) {
          particles.push(
            new Particle({
              position: {
                x: goomba.position.x + goomba.width / 2,
                y: goomba.position.y + goomba.height / 2,
              },
              velocity: {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 4,
              },
              radius: Math.random() * 3,
            })
          );
        }
        setTimeout(() => {
          goombas.splice(index, 1);
          particles.splice(particleIndex, 1);
        }, 0);
      }
    });

    //goomba stomp squish
    if (collisonTop({ object1: player, object2: goomba })) {
      audio.goombaSquash.play();
      for (let i = 0; i < 50; i++) {
        particles.push(
          new Particle({
            position: {
              x: goomba.position.x + goomba.width / 2,
              y: goomba.position.y + goomba.height / 2,
            },
            velocity: {
              x: (Math.random() - 0.5) * 5,
              y: (Math.random() - 0.5) * 4,
            },
            radius: Math.random() * 3,
          })
        );
      }
      player.velocity.y -= 20;
      setTimeout(() => {
        goombas.splice(index, 1);
      }, 0);
    } else if (
      player.position.x + player.width >= goomba.position.x &&
      player.position.y + player.height >= goomba.position.y &&
      player.position.x <= goomba.position.x + goomba.width
    ) {
      //player hits goomba
      // lose fireflower / lose powerup
      if (player.powerUps.fireFlower) {
        player.invincible = true;
        player.powerUps.fireFlower = false;
        audio.losePowerUp.play();
        setTimeout(() => {
          player.invincible = false;
        }, 1000);
      } else if (!player.invincible) {
        audio.die.play();
        selectLevel(currentLevel);
      }
    }
  });

  player.update();

  if (game.disableUserInput) return;
  //scrolling code starts
  let hitSide = false;
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;

    //scrolling code
    if (keys.right.pressed) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        platform.velocity.x = -player.speed;

        if (platform.block && hitSideOfPlatform({ object: player, platform })) {
          platforms.forEach((platform) => {
            platform.velocity.x = 0;
          });

          hitSide = true;
          break;
        }
      }

      if (!hitSide) {
        scrollOffset += player.speed;
        flagPole.velocity.x = -player.speed;
        genericObjects.forEach((genericObject) => {
          genericObject.velocity.x = -player.speed * 0.66;
        });
        goombas.forEach((goomba) => {
          goomba.position.x -= player.speed;
        });
        particles.forEach((particle) => {
          particle.position.x -= player.speed;
        });
        fireFlowers.forEach((fireFlower) => {
          fireFlower.position.x -= player.speed;
        });
      }
    } else if (keys.left.pressed && scrollOffset > 0) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        platform.velocity.x = player.speed;
        if (platform.block && hitSideOfPlatform({ object: player, platform })) {
          platforms.forEach((platform) => {
            platform.velocity.x = 0;
          });

          hitSide = true;
        }
      }

      if (!hitSide) {
        scrollOffset -= player.speed;
        flagPole.velocity.x = +player.speed;
        genericObjects.forEach((genericObject) => {
          genericObject.velocity.x = player.speed * 0.66;
        });
        goombas.forEach((goomba) => {
          goomba.position.x += player.speed;
        });
        particles.forEach((particle) => {
          particle.position.x += player.speed;
        });
        fireFlowers.forEach((fireFlower) => {
          fireFlower.position.x += player.speed;
        });
      }
    }
  }

  // platform collusion detection
  platforms.forEach((platform) => {
    if (
      isOnTopOfPlatform({
        object: player,
        platform,
      })
    ) {
      player.velocity.y = 0;
    }

    if (platform.block && hitBottomOfPlatform({ object: player, platform })) {
      player.velocity.y = -player.velocity.y;
    }

    if (platform.block && hitSideOfPlatform({ object: player, platform })) {
      player.velocity.x = 0;
    }

    //particles bounce
    particles.forEach((particle, index) => {
      if (
        isOnTopOfPlatformCircle({
          object: particle,
          platform,
        })
      ) {
        const bounce = 0.99;
        particle.velocity.y = -particle.velocity.y * bounce;
        if (particle.radius - 0.4 < 0) particles.splice(index, 1);
        else particle.radius -= 0.4;
      }
      if (particle.ttl < 0) particles.splice(index, 1);
    });

    //platform collison with goomba
    goombas.forEach((goomba) => {
      if (
        isOnTopOfPlatform({
          object: goomba,
          platform,
        })
      ) {
        goomba.velocity.y = 0;
      }
    });
    //platform collison with fireflower
    fireFlowers.forEach((fireFlower) => {
      if (
        isOnTopOfPlatform({
          object: fireFlower,
          platform,
        })
      ) {
        fireFlower.velocity.y = 0;
      }
    });
  });

  //lose condition
  if (player.position.y > canvas.height) {
    audio.die.play();
    selectLevel(currentLevel);
  }

  //Sprite switching
  if (player.shooting) {
    if (lastKey == "left") {
      player.currentSprite = player.sprites.shoot.fireFlower.left;
    } else {
      player.currentSprite = player.sprites.shoot.fireFlower.right;
    }
    return;
  }
  //sprite jump
  if (player.velocity.y !== 0) return;

  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.run.right
  ) {
    player.currentSprite = player.sprites.run.right;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.currentSprite = player.sprites.run.left;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.stand.right
  ) {
    player.currentSprite = player.sprites.stand.right;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.stand.left
  ) {
    player.currentSprite = player.sprites.stand.left;
  }

  //fireFlower Sprite switching
  if (!player.powerUps.fireFlower) return;
  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.run.fireFlower.right
  ) {
    player.currentSprite = player.sprites.run.fireFlower.right;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.run.fireFlower.left
  ) {
    player.currentSprite = player.sprites.run.fireFlower.left;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.stand.fireFlower.right
  ) {
    player.currentSprite = player.sprites.stand.fireFlower.right;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.stand.fireFlower.left
  ) {
    player.currentSprite = player.sprites.stand.fireFlower.left;
  }
}
//end Animation loop ends

selectLevel(1);
animate();

window.addEventListener("keydown", ({ keyCode }) => {
  console.log(keyCode);
  if (game.disableUserInput) return;
  switch (keyCode) {
    case 65:
      //   console.log("left");
      keys.left.pressed = true;
      lastKey = "left";
      break;
    case 83:
      //   console.log("down");
      break;
    case 68:
      //   console.log("right");
      keys.right.pressed = true;
      lastKey = "right";
      break;
    case 87:
      //   console.log("up");
      player.velocity.y -= 25;
      audio.jump.play();
      if (lastKey === "right") {
        player.currentSprite = player.sprites.jump.right;
      } else {
        player.currentSprite = player.sprites.jump.left;
      }

      if (!player.powerUps.fireFlower) break;

      if (lastKey === "right") {
        player.currentSprite = player.sprites.jump.fireFlower.right;
      } else {
        player.currentSprite = player.sprites.jump.fireFlower.left;
      }

      break;
    case 32:
      // console.log('space')
      if (!player.powerUps.fireFlower) return;

      player.shooting = true;

      setTimeout(() => {
        player.shooting = false;
      }, 100);
      audio.fireFlowerShot.play();
      let velocity = 15;
      if (lastKey === "left") velocity = -velocity;
      particles.push(
        new Particle({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
          },
          velocity: {
            x: velocity,
            y: 0,
          },
          radius: 5,
          color: "red",
          fireball: true,
        })
      );
    default:
      break;
  }
});

window.addEventListener("keyup", ({ keyCode }) => {
  if (game.disableUserInput) return;

  switch (keyCode) {
    case 65:
      //   console.log("left");
      keys.left.pressed = false;
      break;
    case 83:
      //   console.log("down");
      break;
    case 68:
      //   console.log("right");
      keys.right.pressed = false;
      break;
    case 87:
      //   console.log("up");
      break;
    default:
      break;
  }
});
