import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface HeroPatisserie3DProps {
  fallbackImage: string;
  fallbackAlt: string;
}

function createMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F9F4ED';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(180, 165, 150, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      let x = (i * 41) % 512;
      let y = 0;
      ctx.moveTo(x, y);
      for (let s = 0; s < 10; s++) {
        x += Math.sin(i + s * 0.9) * 28;
        y += 52;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function HeroPatisserie3D({ fallbackImage, fallbackAlt }: HeroPatisserie3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return;
    }

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 440;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => setContextLost(false);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFF9F1');
    scene.fog = new THREE.Fog('#FFF9F1', 8, 18);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 2.55, 5.2);

    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 0.85, 0);
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;

    // 3-Point Warm Patisserie Studio Lighting
    const hemiLight = new THREE.HemisphereLight('#FFFDF9', '#D6C4B0', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF3E0', 1.65);
    keyLight.position.set(4, 6.5, 4.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#FFD9B8', 0.9);
    rimLight.position.set(-4, 3.5, -3.5);
    scene.add(rimLight);

    // Textures & Materials
    const marbleTexture = createMarbleTexture();
    marbleTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const marbleMat = new THREE.MeshStandardMaterial({
      map: marbleTexture,
      roughness: 0.28,
      metalness: 0.04,
    });
    const darkChocMat = new THREE.MeshPhysicalMaterial({
      color: '#3B2316',
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
    });
    const spongeMat = new THREE.MeshStandardMaterial({
      color: '#5A3422',
      roughness: 0.88,
      metalness: 0.0,
    });
    const caramelMat = new THREE.MeshPhysicalMaterial({
      color: '#D58438',
      roughness: 0.22,
      metalness: 0.04,
      clearcoat: 0.6,
    });
    const creamMat = new THREE.MeshStandardMaterial({
      color: '#FFF5E8',
      roughness: 0.65,
      metalness: 0.0,
    });
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: '#E5B45B',
      roughness: 0.18,
      metalness: 0.92,
    });
    const orangeAccentMat = new THREE.MeshStandardMaterial({
      color: '#F36B21',
      roughness: 0.45,
      metalness: 0.05,
    });
    const berryMat = new THREE.MeshPhysicalMaterial({
      color: '#A1273A',
      roughness: 0.35,
      clearcoat: 0.5,
    });

    const geometries: THREE.BufferGeometry[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };

    // Composite Cake & Pedestal Group (12 parts grounded at y=0)
    const showcaseGroup = new THREE.Group();
    scene.add(showcaseGroup);

    // 1. Pedestal Base
    const baseMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.85, 1.05, 0.14, 48)),
      marbleMat
    );
    baseMesh.position.y = 0.07;
    baseMesh.receiveShadow = true;
    showcaseGroup.add(baseMesh);

    // 2. Pedestal Stem
    const stemMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.24, 0.34, 0.34, 36)),
      marbleMat
    );
    stemMesh.position.y = 0.31;
    stemMesh.castShadow = true;
    showcaseGroup.add(stemMesh);

    // 3. Marble Cake Plate
    const plateMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.55, 1.48, 0.08, 64)),
      marbleMat
    );
    plateMesh.position.y = 0.52;
    plateMesh.receiveShadow = true;
    plateMesh.castShadow = true;
    showcaseGroup.add(plateMesh);

    // 4. Lower Chocolate Sponge Layer
    const lowerSponge = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.08, 1.1, 0.24, 56)),
      spongeMat
    );
    lowerSponge.position.y = 0.68;
    lowerSponge.castShadow = true;
    lowerSponge.receiveShadow = true;
    showcaseGroup.add(lowerSponge);

    // 5. Salted Caramel Filling Layer
    const caramelLayer = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.09, 1.09, 0.1, 56)),
      caramelMat
    );
    caramelLayer.position.y = 0.85;
    showcaseGroup.add(caramelLayer);

    // 6. Upper Ganache Sponge Layer
    const upperSponge = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.06, 1.08, 0.22, 56)),
      spongeMat
    );
    upperSponge.position.y = 1.01;
    upperSponge.castShadow = true;
    showcaseGroup.add(upperSponge);

    // 7. Mirror Chocolate Glaze Crown
    const glazeCrown = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.07, 1.07, 0.14, 56)),
      darkChocMat
    );
    glazeCrown.position.y = 1.19;
    glazeCrown.castShadow = true;
    showcaseGroup.add(glazeCrown);

    // 8. Ivory Cream Piping Ring (8 rosettes)
    const rosetteGeo = trackGeo(new THREE.SphereGeometry(0.09, 20, 16));
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rosette = new THREE.Mesh(rosetteGeo, creamMat);
      rosette.scale.set(1, 0.72, 1);
      rosette.position.set(Math.cos(angle) * 0.78, 1.29, Math.sin(angle) * 0.78);
      rosette.castShadow = true;
      showcaseGroup.add(rosette);
    }

    // 9. Berry & Gold Leaf Center Garnish
    const berryGeo = trackGeo(new THREE.SphereGeometry(0.085, 18, 16));
    const berryOffsets: Array<[number, number, number]> = [
      [0.14, 1.32, 0.08],
      [-0.12, 1.32, 0.12],
      [0.02, 1.33, -0.14],
    ];
    for (const [bx, by, bz] of berryOffsets) {
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.position.set(bx, by, bz);
      showcaseGroup.add(berry);
    }

    const goldRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.42, 0.015, 12, 48)),
      goldMat
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 1.27;
    showcaseGroup.add(goldRing);

    // 10. Three Floating French Macarons
    const macarons: Array<{ group: THREE.Group; baseY: number; phase: number }> = [];
    const shellGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.25, 0.08, 32));
    const fillGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 32));

    const macaronConfigs: Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      mat: THREE.Material;
      phase: number;
    }> = [
      { pos: [-1.75, 1.45, 0.45], rot: [0.22, 0.4, -0.18], mat: orangeAccentMat, phase: 0 },
      { pos: [1.82, 1.65, -0.2], rot: [-0.18, -0.5, 0.22], mat: creamMat, phase: 2.1 },
      { pos: [1.35, 0.85, 1.15], rot: [0.15, 0.8, 0.14], mat: caramelMat, phase: 4.2 },
    ];

    for (const cfg of macaronConfigs) {
      const mGroup = new THREE.Group();
      const topShell = new THREE.Mesh(shellGeo, cfg.mat);
      topShell.position.y = 0.06;
      const filling = new THREE.Mesh(fillGeo, darkChocMat);
      const bottomShell = new THREE.Mesh(shellGeo, cfg.mat);
      bottomShell.position.y = -0.06;
      mGroup.add(topShell, filling, bottomShell);
      mGroup.position.set(...cfg.pos);
      mGroup.rotation.set(...cfg.rot);
      scene.add(mGroup);
      macarons.push({ group: mGroup, baseY: cfg.pos[1], phase: cfg.phase });
    }

    // Ground Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(40, 35, 31, 0.24)');
      grad.addColorStop(1, 'rgba(40, 35, 31, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(4.2, 4.2)),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let userDragging = false;
    controls.addEventListener('start', () => {
      userDragging = true;
    });
    controls.addEventListener('end', () => {
      userDragging = false;
    });

    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext();
      const isWebGL2 =
        typeof WebGL2RenderingContext !== 'undefined' &&
        gl instanceof WebGL2RenderingContext &&
        typeof gl.fenceSync === 'function';
      if (!isWebGL2) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;

      if (!prefersReducedMotion) {
        if (!userDragging) {
          showcaseGroup.rotation.y += dt * 0.28;
        }
        for (const mac of macarons) {
          mac.group.position.y = mac.baseY + Math.sin(elapsed * 1.4 + mac.phase) * 0.075;
          mac.group.rotation.y += dt * 0.35;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (prefersReducedMotion) {
      controls.update();
      renderer.render(scene, camera);
    } else {
      tick();
    }

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      marbleTexture.dispose();
      shadowTex.dispose();
      envTexture.dispose();
      marbleMat.dispose();
      darkChocMat.dispose();
      spongeMat.dispose();
      caramelMat.dispose();
      creamMat.dispose();
      goldMat.dispose();
      orangeAccentMat.dispose();
      berryMat.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (contextLost) {
    return (
      <img
        src={fallbackImage}
        alt={fallbackAlt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="relative w-full h-full min-h-[340px] bg-[#FFF9F1]">
      <div ref={mountRef} className="w-full h-full" />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-medium text-[#81766D] bg-[#FFF9F1]/90 px-3 py-1 rounded-full border border-[#EEE7DF] whitespace-nowrap">
        Drag to rotate 3D patisserie centerpiece
      </p>
    </div>
  );
}
