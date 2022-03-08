import * as THREE from "three";
import gsap from "gsap";

let cubeSize = 1;

const getIntersects = (originPoint, cubes, direction) => {
  const intersectsResults = [];
  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);
  let rayDirection;

  switch (direction) {
    case "T":
      rayDirection = new THREE.Vector3(0, 2, 0).normalize();
      break;

    case "R":
      rayDirection = new THREE.Vector3(2, 0, 0).normalize();
      break;

    case "B":
      rayDirection = new THREE.Vector3(0, -2, 0).normalize();
      break;

    case "L":
      rayDirection = new THREE.Vector3(-2, 0, 0).normalize();
      break;

    default:
      break;
  }

  raycaster.set(rayOrigin, rayDirection);
  const instersects = raycaster.intersectObjects(cubes)
    .filter((mesh) => mesh.object.userData.color !== undefined);


  if (instersects.length > 0) {
    let distantIntersect = false;

    if (instersects[0].distance > 1) {
      distantIntersect = true
    }
    if (distantIntersect) {
      intersectsResults.push(false);
    } else {
      intersectsResults.push(true);
    }
  } else {
    intersectsResults.push(false);
  }

  return intersectsResults;
}

const getDraggableIntersectionsOfSelectedSq = (originPoint, cubes) => {
  const rayOrigin = new THREE.Vector3(originPoint.x, originPoint.y, 0);

  const raycasterLeft = new THREE.Raycaster();
  const raycasterTop = new THREE.Raycaster();
  const raycasterRight = new THREE.Raycaster();
  const raycasterBottom = new THREE.Raycaster();

  const rayDirectionLeft = new THREE.Vector3(-2, 0, 0).normalize();
  const rayDirectionTop = new THREE.Vector3(0, 2, 0).normalize();
  const rayDirectionRight = new THREE.Vector3(2, 0, 0).normalize();
  const rayDirectionBottom = new THREE.Vector3(0, -2, 0).normalize();

  raycasterLeft.set(rayOrigin, rayDirectionLeft);
  raycasterTop.set(rayOrigin, rayDirectionTop);
  raycasterRight.set(rayOrigin, rayDirectionRight);
  raycasterBottom.set(rayOrigin, rayDirectionBottom);

  const instersectsLeft = raycasterLeft
    .intersectObjects(cubes)
    .filter((mesh) => mesh.object.userData.color !== undefined);
  const instersectsTop = raycasterTop
    .intersectObjects(cubes)
    .filter((mesh) => mesh.object.userData.color !== undefined);
  const instersectsRight = raycasterRight
    .intersectObjects(cubes)
    .filter((mesh) => mesh.object.userData.color !== undefined);
  const instersectsBottom = raycasterBottom
    .intersectObjects(cubes)
    .filter((mesh) => mesh.object.userData.color !== undefined);

  let intersectsResults = [];


  if (instersectsTop.length > 0) {
    const closeIntersections = instersectsTop.filter(
      (intersect) => intersect.distance <= 0.5
    );

    if (closeIntersections.length > 0) {
      intersectsResults.push({ T: originPoint.y });
    } else {
      if (instersectsTop.length > 0) {
        intersectsResults.push({
          T: originPoint.y + instersectsTop[0].distance - cubeSize / 2,
        });
      } else {
        //
      }
    }
  }

  if (instersectsRight.length > 0) {
    const closeIntersections = instersectsRight.filter(
      (intersect) => intersect.distance <= 0.5
    );
    if (closeIntersections.length > 0) {
      intersectsResults.push({ R: originPoint.x });
    } else {
      if (instersectsRight.length > 0) {
        intersectsResults.push({
          R: originPoint.x + instersectsRight[0].distance - cubeSize / 2,
        });
      }
    }
  }

  if (instersectsBottom.length > 0) {
    const closeIntersections = instersectsBottom.filter(
      (intersect) => intersect.distance <= 0.5
    );

    if (closeIntersections.length > 0) {
      intersectsResults.push({ B: originPoint.y });
    } else {
      if (instersectsBottom.length > 0) {
        intersectsResults.push({
          B: originPoint.y - instersectsBottom[0].distance + cubeSize / 2,
        });
      }
    }
  }

  if (instersectsLeft.length > 0) {
    const closeIntersections = instersectsLeft.filter(
      (intersect) => intersect.distance <= 0.5
    );

    if (closeIntersections.length > 0) {
      intersectsResults.push({ L: originPoint.x });
    } else {
      if (instersectsLeft.length > 0) {
        intersectsResults.push({
          L: originPoint.x - instersectsLeft[0].distance + cubeSize / 2,
        });
      }
    }
  }

  return intersectsResults;
}

const getAvailableSqByDirection = (cubes, direction) => {
  cubes.filter(cube => {
    var originPoint = cube.position.clone();
    const intersects = getIntersects(originPoint, cubes, direction);
    var found = false;
    
    for (var i = 0; i < intersects.length; i++) {
      if (intersects[i]) {
        found = intersects[i];
        break;
      } else {

        const _duration = .1;
        const _delay = 0;
        const _easing = 'power2.out';

        switch (direction) {
          case "T":
            // cube.position.y = cube.position.y + 1;
            gsap.to(cube.position, { duration: _duration, delay: _delay, y: cube.position.y + 1, ease: _easing })
            break;

          case "R":
            gsap.to(cube.position, { duration: _duration, delay: _delay, x: cube.position.x + 1, ease: _easing })
            // cube.position.x = cube.position.x + 1;
            break;

          case "B":
            // cube.position.y = cube.position.y - 1;
            gsap.to(cube.position, { duration: _duration, delay: _delay, y: cube.position.y - 1, ease: _easing })
            break;

          case "L":
            // cube.position.x = cube.position.x - 1;
            gsap.to(cube.position, { duration: _duration, delay: _delay, x: cube.position.x - 1, ease: _easing })
            break;

          default:
            break;
        }

      }
    }

    if (!found) {
      return cube;
    }
  });
}

export { getDraggableIntersectionsOfSelectedSq, getAvailableSqByDirection };