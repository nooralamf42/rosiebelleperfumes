"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Floating glass droplets rendered with Three.js, used as the hero backdrop.
 * Transparent canvas; physically based glass (transmission) picks up the
 * page colours through an environment built from the theme.
 * Mouse moves the camera a little (parallax); everything slowly breathes.
 * Skipped entirely for reduced-motion users and disposed on unmount.
 */
export function AromaScene({ className }: { className?: string }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const css = getComputedStyle(document.documentElement);
    const amber = new THREE.Color(css.getPropertyValue("--amber").trim() || "#c8842f");
    const primary = new THREE.Color(css.getPropertyValue("--primary").trim() || "#1e4d3a");

    // Opaque canvas in the page background colour: transmission (refraction)
    // needs something behind the glass to bend, and a transparent target
    // would render the droplets as flat white.
    const pageBg = new THREE.Color(css.getPropertyValue("--background").trim() || "#f6f2ea");
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(pageBg, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    // Environment: a soft gradient room so the glass has something to refract.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(20, 32, 32);
    const envMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { top: { value: new THREE.Color("#fff7ea") }, bottom: { value: primary.clone().lerp(new THREE.Color("#ffffff"), 0.55) } },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float t = clamp(vP.y/20.0*0.5+0.5,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, t),1.0); }`,
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), new THREE.MeshBasicMaterial({ color: amber.clone().lerp(new THREE.Color("#ffffff"), 0.4) }));
    sun.position.set(8, 10, -6);
    envScene.add(sun);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    // Soft colour fields behind the glass so there is something to refract.
    const blobMat = (c: THREE.Color, o: number) =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { color: { value: c }, opacity: { value: o } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 color; uniform float opacity; varying vec2 vUv;
          void main(){ float d = distance(vUv, vec2(0.5)); float a = smoothstep(0.5, 0.05, d) * opacity; gl_FragColor = vec4(color, a); }`,
      });
    const blobA = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), blobMat(amber.clone().lerp(pageBg, 0.45), 0.75));
    blobA.position.set(-4.5, 2.5, -8);
    const blobB = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), blobMat(primary.clone().lerp(pageBg, 0.6), 0.7));
    blobB.position.set(5, -3.5, -9);
    scene.add(blobA, blobB);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xfff1dc, 1.6);
    key.position.set(4, 6, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(amber, 0.9);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.08,
      transmission: 1,
      thickness: 1.6,
      ior: 1.42,
      attenuationColor: amber.clone().lerp(new THREE.Color("#ffffff"), 0.35),
      attenuationDistance: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.2,
    });
    const amberGlass = glass.clone();
    amberGlass.attenuationColor = amber.clone();
    amberGlass.attenuationDistance = 1.1;

    // Drop shape: a sphere pulled into a teardrop.
    const dropGeo = new THREE.SphereGeometry(1, 64, 64);
    const pos = dropGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + 1) / 2; // 0 bottom .. 1 top
      const pinch = 1 - 0.55 * Math.pow(t, 2.2);
      pos.setX(i, pos.getX(i) * pinch);
      pos.setZ(i, pos.getZ(i) * pinch);
      pos.setY(i, y * (1 + 0.25 * Math.pow(t, 2)));
    }
    dropGeo.computeVertexNormals();
    const sphereGeo = new THREE.SphereGeometry(1, 48, 48);

    type Body = { mesh: THREE.Mesh; base: THREE.Vector3; speed: number; phase: number; spin: number };
    const bodies: Body[] = [];
    const defs: [number, number, number, number, boolean][] = [
      // x, y, z, scale, isDrop
      [3.6, 1.4, -1, 1.25, true],
      [-3.9, -0.6, -2, 0.95, false],
      [2.4, -2.4, 0.5, 0.6, true],
      [-2.2, 2.6, -3, 0.5, false],
      [0.6, 3.1, -4, 0.42, true],
      [-0.4, -3.2, -1.5, 0.36, false],
      [4.6, -0.8, -4, 0.55, false],
      [-4.4, 2.2, -5, 0.7, true],
    ];
    defs.forEach(([x, y, z, s, isDrop], i) => {
      const mesh = new THREE.Mesh(isDrop ? dropGeo : sphereGeo, i % 3 === 0 ? amberGlass : glass);
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(s);
      mesh.rotation.z = isDrop ? (Math.random() - 0.5) * 0.4 : 0;
      scene.add(mesh);
      bodies.push({ mesh, base: new THREE.Vector3(x, y, z), speed: 0.4 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.3 });
    });

    // Fine golden dust.
    const dustCount = 180;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 16;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 2] = -Math.random() * 8;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: amber, size: 0.05, transparent: true, opacity: 0.55, sizeAttenuation: true }));
    scene.add(dust);

    const target = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      target.set((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      for (const b of bodies) {
        b.mesh.position.y = b.base.y + Math.sin(t * b.speed + b.phase) * 0.35;
        b.mesh.position.x = b.base.x + Math.cos(t * b.speed * 0.6 + b.phase) * 0.18;
        b.mesh.rotation.y += 0.003;
        b.mesh.rotation.x = Math.sin(t * 0.3 + b.phase) * 0.15 + b.spin;
      }
      dust.rotation.y = t * 0.02;
      blobA.position.x = -4.5 + Math.sin(t * 0.15) * 0.8;
      blobB.position.y = -3.5 + Math.cos(t * 0.12) * 0.8;
      dust.position.y = Math.sin(t * 0.2) * 0.2;
      camera.position.x += (target.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-target.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      dropGeo.dispose();
      sphereGeo.dispose();
      dustGeo.dispose();
      blobA.geometry.dispose();
      blobB.geometry.dispose();
      (blobA.material as THREE.Material).dispose();
      (blobB.material as THREE.Material).dispose();
      glass.dispose();
      amberGlass.dispose();
      envGeo.dispose();
      envMat.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className={className} aria-hidden />;
}
