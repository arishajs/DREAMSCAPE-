
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// DREAMSCAPE — Interactive 3D World
const container = document.getElementById("scene-container");

const promptForm = document.getElementById("promptForm");
const promptInput = document.getElementById("worldPrompt");
const createBtn = document.getElementById("createBtn");
const notice = document.getElementById("notice");

const worldLabel = document.getElementById("worldLabel");
const sceneTitle = document.getElementById("sceneTitle");
const sceneDescription = document.getElementById("sceneDescription");
const breadcrumbName = document.getElementById("breadcrumbName");

const themes = {
  fantasy: {
    name: "MYSTIC VALLEY",
    title: "The Floating Isles",
    description: "A hidden paradise beyond the clouds.",
    background: 0x090817,
    primary: 0x9b62ff,
    secondary: 0x54e5ff,
    planet: 0xc39aff,
    ground: 0x39265f,
    cloud: 0x6d4ba6
  },

  cyberpunk: {
    name: "NEON HORIZON",
    title: "Neon City",
    description: "A futuristic city glowing in the night.",
    background: 0x100717,
    primary: 0xff43ca,
    secondary: 0x38eaff,
    planet: 0xff7bd8,
    ground: 0x32143f,
    cloud: 0x873b87
  },

  space: {
    name: "COSMIC DREAMS",
    title: "Beyond the Stars",
    description: "An unknown planet in a distant galaxy.",
    background: 0x050c20,
    primary: 0x608dff,
    secondary: 0x8df4ff,
    planet: 0x83aaff,
    ground: 0x1b315d,
    cloud: 0x405a9d
  },

  ocean: {
    name: "LOST ATLANTIS",
    title: "The Sunken Kingdom",
    description: "An ancient world hidden beneath the ocean.",
    background: 0x03151e,
    primary: 0x27e5ce,
    secondary: 0x69baff,
    planet: 0x7fffe7,
    ground: 0x164c57,
    cloud: 0x247e8b
  }
};

let currentTheme = "fantasy";
let currentPrompt = "";
let autoRotate = true;
let dragging = false;
let previousX = 0;
let previousY = 0;
let rotationX = 0;
let rotationY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(themes.fantasy.background);
scene.fog = new THREE.FogExp2(themes.fantasy.background, 0.018);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);

camera.position.set(0, 1.4, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// All world objects live inside this group.
const world = new THREE.Group();
scene.add(world);

const ambientLight = new THREE.AmbientLight(0xb9aaff, 1.8);
scene.add(ambientLight);

const mainLight = new THREE.PointLight(0xa879ff, 100, 30);
mainLight.position.set(3, 4, 5);
scene.add(mainLight);

const blueLight = new THREE.PointLight(0x48dfff, 70, 25);
blueLight.position.set(-4, -1, 3);
scene.add(blueLight);

// Materials
function glowingMaterial(color, intensity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.45,
    metalness: 0.15
  });
}

function standardMaterial(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.12
  });
}

// Floating islands
const islandGroup = new THREE.Group();
world.add(islandGroup);

function createIsland(x, y, z, scale) {
  const island = new THREE.Group();
  island.position.set(x, y, z);
  island.scale.setScalar(scale);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 0.9, 0.42, 7, 1),
    standardMaterial(themes.fantasy.ground)
  );
  top.position.y = 0;
  island.add(top);

  const rock = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 1.9, 7),
    standardMaterial(0x241a43)
  );
  rock.position.y = -1.0;
  island.add(rock);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.15, 0.1, 7),
    standardMaterial(0x56417c)
  );
  grass.position.y = 0.23;
  island.add(grass);

  // Small glowing crystal on each island.
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.15, 0),
    glowingMaterial(themes.fantasy.secondary, 1.5)
  );
  crystal.position.set(0.25, 0.65, 0.1);
  island.add(crystal);

  // Tiny trees or magical structures.
  for (let i = 0; i < 3; i++) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, 0.38, 5),
      standardMaterial(0x44315a)
    );

    trunk.position.set(
      Math.sin(i * 2.1) * 0.6,
      0.4,
      Math.cos(i * 2.1) * 0.55
    );

    island.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.19, 0.55, 6),
      glowingMaterial(themes.fantasy.primary, 0.45)
    );

    leaves.position.copy(trunk.position);
    leaves.position.y += 0.35;
    island.add(leaves);
  }

  islandGroup.add(island);
  return island;
}

const islands = [
  createIsland(0, -0.65, 0, 1.05),
  createIsland(-2.7, 0.2, -1.0, 0.57),
  createIsland(2.7, 0.45, -1.8, 0.65),
  createIsland(-3.4, -1.1, -2.4, 0.4),
  createIsland(3.5, -0.9, -2.7, 0.45)
];

// Main glowing planet
const planetGeometry = new THREE.SphereGeometry(0.85, 48, 48);
const planetMaterial = new THREE.MeshStandardMaterial({
  color: themes.fantasy.planet,
  emissive: themes.fantasy.primary,
  emissiveIntensity: 0.7,
  roughness: 0.25,
  metalness: 0.2
});

const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(0, 2.3, -2.8);
world.add(planet);

// Planet ring
const ringGeometry = new THREE.TorusGeometry(1.25, 0.025, 8, 100);
const ringMaterial = glowingMaterial(themes.fantasy.secondary, 2);

const planetRing = new THREE.Mesh(ringGeometry, ringMaterial);
planetRing.position.copy(planet.position);
planetRing.rotation.x = 1.15;
planetRing.rotation.y = 0.2;
world.add(planetRing);

// Tiny orbiting moons
const moons = [];

for (let i = 0; i < 3; i++) {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.09 + i * 0.025, 16, 16),
    glowingMaterial(themes.fantasy.secondary, 1.6)
  );

  world.add(moon);
  moons.push(moon);
}

// Star field
const starCount = 1800;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  starPositions[i * 3] = (Math.random() - 0.5) * 35;
  starPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
  starPositions[i * 3 + 2] = -Math.random() * 22;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xd8d0ff,
  size: 0.035,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Background nebula particles
const glowPositions = new Float32Array(250 * 3);

for (let i = 0; i < 250; i++) {
  glowPositions[i * 3] = (Math.random() - 0.5) * 15;
  glowPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
  glowPositions[i * 3 + 2] = -Math.random() * 12 - 2;
}

const glowGeometry = new THREE.BufferGeometry();
glowGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(glowPositions, 3)
);

const glowParticles = new THREE.Points(
  glowGeometry,
  new THREE.PointsMaterial({
    color: themes.fantasy.primary,
    size: 0.075,
    transparent: true,
    opacity: 0.55
  })
);

scene.add(glowParticles);

// Ground glow
const groundRing = new THREE.Mesh(
  new THREE.TorusGeometry(3.8, 0.015, 6, 120),
  glowingMaterial(themes.fantasy.primary, 0.8)
);

groundRing.rotation.x = Math.PI / 2;
groundRing.position.y = -2.1;
world.add(groundRing);

// Update the whole world when a theme changes.
function applyTheme(themeKey, prompt = "") {
  const theme = themes[themeKey];
  if (!theme) return;

  currentTheme = themeKey;
  currentPrompt = prompt;

  scene.background.setHex(theme.background);
  scene.fog.color.setHex(theme.background);

  mainLight.color.setHex(theme.primary);
  blueLight.color.setHex(theme.secondary);

  planet.material.color.setHex(theme.planet);
  planet.material.emissive.setHex(theme.primary);
  planetRing.material.color.setHex(theme.secondary);

  groundRing.material.color.setHex(theme.primary);
  glowParticles.material.color.setHex(theme.primary);

  islandGroup.children.forEach((island) => {
    island.children.forEach((part, index) => {
      // Top, rock, grass, crystals, trunks and leaves.
      if (index === 0 || index === 2) {
        part.material.color.setHex(theme.ground);
      }

      if (index === 1) {
        part.material.color.setHex(theme.ground);
        part.material.color.multiplyScalar(0.65);
      }

      if (index === 3 || index === 6 || index === 8 || index === 10) {
        part.material.color.setHex(theme.secondary);
        part.material.emissive.setHex(theme.secondary);
      }

      if (index === 5 || index === 7 || index === 9) {
        part.material.color.setHex(theme.primary);
        part.material.emissive.setHex(theme.primary);
      }
    });
  });

  worldLabel.textContent = theme.name;
  sceneTitle.textContent = prompt
    ? makeTitle(prompt)
    : theme.title;

  sceneDescription.textContent = prompt
    ? "Your imagination, brought to life in a creative 3D demo."
    : theme.description;

  breadcrumbName.textContent = prompt
    ? "Custom world"
    : theme.name.toLowerCase();

  document.querySelectorAll(".saved-world").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.theme === themeKey
    );
  });

  document.querySelectorAll(".side-button").forEach((button) => {
    button.classList.remove("active");
  });

  notice.textContent = `Creative demo · Current theme: ${theme.name}.`;
}

function makeTitle(prompt) {
  const clean = prompt.trim().replace(/[.!?]+$/, "");
  if (!clean) return "Your Dream World";

  const words = clean.split(/\s+/).slice(0, 7);
  return words.join(" ").replace(/^./, (letter) => letter.toUpperCase());
}

// Select a theme from a prompt.
function detectTheme(prompt) {
  const text = prompt.toLowerCase();

  if (/cyber|neon|futur|robot|technology|hologram|city/.test(text)) {
    return "cyberpunk";
  }

  if (/space|planet|galaxy|alien|cosmic|star|universe|moon/.test(text)) {
    return "space";
  }

  if (/ocean|underwater|water|sea|atlantis|coral|aquatic/.test(text)) {
    return "ocean";
  }

  return "fantasy";
}

// Prompt form.
promptForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const prompt = promptInput.value.trim();

  if (!prompt) {
    notice.textContent = "Please describe your dream world first.";
    promptInput.focus();
    return;
  }

  if (prompt.length > 180) {
    notice.textContent = "Please keep your prompt under 180 characters.";
    return;
  }

  const theme = detectTheme(prompt);
  applyTheme(theme, prompt);

  createBtn.innerHTML = "World created ✓";
  notice.textContent =
    "Demo world updated! Try another prompt or select a theme.";

  setTimeout(() => {
    createBtn.innerHTML = 'Create world <span>↗</span>';
  }, 1400);
});

// Suggested prompt chips.
document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt;
    promptForm.requestSubmit();
  });
});

// Saved-world buttons.
document.querySelectorAll(".saved-world").forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
  });
});

// Rotate toggle.
document.getElementById("rotateBtn").addEventListener("click", () => {
  autoRotate = !autoRotate;

  notice.textContent = autoRotate
    ? "Automatic rotation enabled."
    : "Automatic rotation paused. Drag to explore.";
});

// Reset camera rotation.
document.getElementById("resetViewBtn").addEventListener("click", () => {
  targetRotationX = 0;
  targetRotationY = 0;
  rotationX = 0;
  rotationY = 0;
  camera.position.set(0, 1.4, 10);
  camera.lookAt(0, 0, 0);
});

// Fullscreen mode.
document.getElementById("fullscreenBtn").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.getElementById("worldStage").requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    notice.textContent = "Fullscreen is not available in this browser.";
  }
});

// New world.
document.getElementById("newWorldBtn").addEventListener("click", () => {
  promptInput.value = "";
  applyTheme("fantasy");
  promptInput.focus();
});

// Explore universe.
document.getElementById("exploreBtn").addEventListener("click", () => {
  const options = ["fantasy", "cyberpunk", "space", "ocean"];
  const currentIndex = options.indexOf(currentTheme);
  const nextTheme = options[(currentIndex + 1) % options.length];
  applyTheme(nextTheme);
});

// Mouse drag controls.
renderer.domElement.addEventListener("pointerdown", (event) => {
  dragging = true;
  previousX = event.clientX;
  previousY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging) return;

  const deltaX = event.clientX - previousX;
  const deltaY = event.clientY - previousY;

  targetRotationY += deltaX * 0.006;
  targetRotationX += deltaY * 0.003;

  targetRotationX = THREE.MathUtils.clamp(
    targetRotationX,
    -0.65,
    0.65
  );

  previousX = event.clientX;
  previousY = event.clientY;
});

renderer.domElement.addEventListener("pointerup", () => {
  dragging = false;
});

renderer.domElement.addEventListener("pointercancel", () => {
  dragging = false;
});

// Resize 3D canvas with the container.
const resizeObserver = new ResizeObserver(() => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

resizeObserver.observe(container);

// Animation loop.
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  if (autoRotate && !dragging) {
    targetRotationY += 0.0015;
  }

  rotationX += (targetRotationX - rotationX) * 0.06;
  rotationY += (targetRotationY - rotationY) * 0.06;

  world.rotation.x = rotationX;
  world.rotation.y = rotationY;

  // Floating island motion.
  islands.forEach((island, index) => {
    island.position.y +=
      Math.sin(time * 0.8 + index * 1.7) * 0.0009;
  });

  // Planet bobbing and ring movement.
  planet.position.y = 2.3 + Math.sin(time * 0.65) * 0.12;
  planet.rotation.y = time * 0.15;

  planetRing.position.copy(planet.position);
  planetRing.rotation.z = time * 0.1;

  // Moons orbit the planet.
  moons.forEach((moon, index) => {
    const angle = time * (0.45 + index * 0.1) + index * 2.1;
    const radius = 1.35 + index * 0.22;

    moon.position.set(
      planet.position.x + Math.cos(angle) * radius,
      planet.position.y + Math.sin(angle * 1.3) * 0.38,
      planet.position.z + Math.sin(angle) * radius
    );
  });

  // Slow-moving stars and nebula.
  stars.rotation.y = time * 0.008;
  glowParticles.rotation.y = -time * 0.012;

  renderer.render(scene, camera);
}

applyTheme("fantasy");
animate();
