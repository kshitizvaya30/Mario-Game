//Image functions
export function createImage(imageSrc) {
  var image = new Image();
  image.src = imageSrc;
  return image;
}

export function createImageAsync(imageSrc) {
  return new Promise((resolve) => {
    var image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = imageSrc;
  });
}

//Collision Functions
export function isOnTopOfPlatform({ object, platform }) {
  return (
    object.position.y + object.height <= platform.position.y &&
    object.position.y + object.height + object.velocity.y >=
      platform.position.y &&
    object.position.x + object.width >= platform.position.x &&
    object.position.x <= platform.position.x + platform.width
  );
}

export function isOnTopOfPlatformCircle({ object, platform }) {
  return (
    object.position.y + object.radius <= platform.position.y &&
    object.position.y + object.radius + object.velocity.y >=
      platform.position.y &&
    object.position.x + object.radius >= platform.position.x &&
    object.position.x <= platform.position.x + platform.width
  );
}

export function collisonTop({ object1, object2 }) {
  return (
    object1.position.y + object1.height <= object2.position.y &&
    object1.position.y + object1.height + object1.velocity.y >=
      object2.position.y &&
    object1.position.x + object1.width >= object2.position.x &&
    object1.position.x <= object2.position.x + object2.width
  );
}

export function hitBottomOfPlatform({ object, platform }) {
  return (
    object.position.y <= platform.position.y + platform.height &&
    object.position.y - object.velocity.y >=
      platform.position.y + platform.height &&
    object.position.x + object.width >= platform.position.x &&
    object.position.x <= platform.position.x + platform.width
  );
}

export function hitSideOfPlatform({ object, platform }) {
  return (
    object.position.x +
      object.width +
      object.velocity.x -
      platform.velocity.x >=
      platform.position.x &&
    object.position.x + object.velocity.x <=
      platform.position.x + platform.width &&
    object.position.y <= platform.position.y + platform.height &&
    object.position.y + object.height >= platform.position.y
  );
}


//Two Rectangles collide
export function ObjectsTouch({ object1, object2 }) {
  return (
    object1.position.x + object1.width >= object2.position.x &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.y + object1.height >= object2.position.y &&
    object1.position.y <= object2.position.y + object2.height
  );
}
