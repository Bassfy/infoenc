/* ============================================================
   WEBGL-SCENE.JS — Three.js hero scene
   Floating crystal + particles + bloom + mouse interaction
   ============================================================ */

export class WebGLScene {
  constructor(containerId = 'hero-webgl') {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') return;

    this.mouse   = new THREE.Vector2(0, 0);
    this.target  = new THREE.Vector2(0, 0);
    this.clock   = new THREE.Clock();
    this.raf     = null;
    this.width   = 0;
    this.height  = 0;

    this._setup();
    this._createCrystal();
    this._createParticles();
    this._createLights();
    this._bindEvents();
    this._animate();
  }

  _setup() {
    this.width  = this.container.clientWidth;
    this.height = this.container.clientHeight;

    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({
      antialias:  true,
      alpha:      true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping           = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure   = 1.2;
    this.renderer.outputColorSpace      = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    /* Scene */
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060608, 0.03);

    /* Camera */
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 200);
    this.camera.position.set(0, 0, 6);

    /* Post-processing via simple RenderTarget bloom simulation */
    this._setupBloom();
  }

  _setupBloom() {
    /* Minimal glow using unlit additive spheres as halos */
    const geoGlow = new THREE.SphereGeometry(1.4, 32, 32);
    const matGlow = new THREE.MeshBasicMaterial({
      color:       0x7c5cfc,
      transparent: true,
      opacity:     0.06,
      depthWrite:  false,
    });
    this.glowMesh = new THREE.Mesh(geoGlow, matGlow);
    this.scene.add(this.glowMesh);

    const geoGlow2 = new THREE.SphereGeometry(2.0, 32, 32);
    const matGlow2 = new THREE.MeshBasicMaterial({
      color:       0xff3cac,
      transparent: true,
      opacity:     0.04,
      depthWrite:  false,
    });
    this.glowMesh2 = new THREE.Mesh(geoGlow2, matGlow2);
    this.scene.add(this.glowMesh2);
  }

  _createCrystal() {
    /* Icosahedron — subdivided for more facets */
    const geo = new THREE.IcosahedronGeometry(1.2, 1);

    /* Custom shader-like material using MeshPhysicalMaterial */
    const mat = new THREE.MeshPhysicalMaterial({
      color:            0x7c5cfc,
      emissive:         0x2a1a80,
      emissiveIntensity: 0.3,
      roughness:        0.05,
      metalness:        0.1,
      transmission:     0.8,
      thickness:        1.5,
      ior:              1.8,
      reflectivity:     1,
      transparent:      true,
      opacity:          0.9,
      side:             THREE.DoubleSide,
      envMapIntensity:  1,
    });

    this.crystal = new THREE.Mesh(geo, mat);
    this.scene.add(this.crystal);

    /* Wireframe overlay */
    const wireMat = new THREE.MeshBasicMaterial({
      color:       0xffffff,
      wireframe:   true,
      transparent: true,
      opacity:     0.04,
    });
    this.wireframe = new THREE.Mesh(geo, wireMat);
    this.wireframe.scale.setScalar(1.02);
    this.scene.add(this.wireframe);

    /* Inner glowing core */
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color:       0x00f0ff,
      transparent: true,
      opacity:     0.35,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.core);
  }

  _createParticles() {
    const COUNT = 1200;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);

    const palette = [
      new THREE.Color(0x7c5cfc),
      new THREE.Color(0xff3cac),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < COUNT; i++) {
      const r     = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    /* Custom shader for round particles */
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.3 + position.x * 0.5) * 0.15;
          pos.x += cos(uTime * 0.2 + position.z * 0.4) * 0.1;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.3, 0.5, d);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      vertexColors: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
    this.particleMat = mat;
  }

  _createLights() {
    /* Ambient */
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambient);

    /* Key light — accent purple */
    this.light1 = new THREE.PointLight(0x7c5cfc, 8, 20);
    this.light1.position.set(3, 3, 3);
    this.scene.add(this.light1);

    /* Fill light — pink */
    this.light2 = new THREE.PointLight(0xff3cac, 5, 20);
    this.light2.position.set(-3, -2, 2);
    this.scene.add(this.light2);

    /* Rim light — cyan */
    this.light3 = new THREE.PointLight(0x00f0ff, 4, 20);
    this.light3.position.set(0, -3, -3);
    this.scene.add(this.light3);

    /* Dim top */
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 5, 5);
    this.scene.add(topLight);
  }

  _bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.target.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      this.target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => this._onResize());
  }

  _onResize() {
    this.width  = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (this.particleMat) {
      this.particleMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
  }

  _animate() {
    this.raf = requestAnimationFrame(() => this._animate());
    const t = this.clock.getElapsedTime();

    /* Smooth mouse follow */
    this.mouse.x += (this.target.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.target.y - this.mouse.y) * 0.04;

    /* Crystal rotation */
    if (this.crystal) {
      this.crystal.rotation.x = t * 0.12 + this.mouse.y * 0.3;
      this.crystal.rotation.y = t * 0.18 + this.mouse.x * 0.3;
      this.crystal.position.y = Math.sin(t * 0.5) * 0.15;
    }

    if (this.wireframe) {
      this.wireframe.rotation.copy(this.crystal.rotation);
      this.wireframe.position.copy(this.crystal.position);
    }

    if (this.core) {
      this.core.rotation.x = -t * 0.3;
      this.core.rotation.z = t * 0.2;
      this.core.position.copy(this.crystal.position);
      const pulse = 0.95 + Math.sin(t * 2.5) * 0.05;
      this.core.scale.setScalar(pulse);
    }

    /* Glow halos */
    if (this.glowMesh) {
      this.glowMesh.position.copy(this.crystal.position);
      const s = 1 + Math.sin(t * 1.5) * 0.08;
      this.glowMesh.scale.setScalar(s);
    }
    if (this.glowMesh2) {
      this.glowMesh2.position.copy(this.crystal.position);
    }

    /* Particle drift */
    if (this.particles) {
      this.particles.rotation.y = t * 0.04;
      this.particles.rotation.x = t * 0.02;
      this.particleMat.uniforms.uTime.value = t;
    }

    /* Light orbit */
    if (this.light1) {
      this.light1.position.x = Math.sin(t * 0.7) * 4;
      this.light1.position.z = Math.cos(t * 0.7) * 4;
    }
    if (this.light2) {
      this.light2.position.x = Math.cos(t * 0.5) * 3;
      this.light2.position.y = Math.sin(t * 0.4) * 3;
    }

    /* Camera subtle drift following mouse */
    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.03;
    this.camera.position.y += (-this.mouse.y * 0.3 - this.camera.position.y) * 0.03;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
  }
}
