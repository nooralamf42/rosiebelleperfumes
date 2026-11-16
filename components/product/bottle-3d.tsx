"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BottleStage } from "./bottle-stage";
import { bottleHeightRatio } from "./bottle-photo";
import { liquidColor } from "@/lib/perfume-colors";
import type { BottleSize } from "@/lib/sizes";

/*
 * A real 3D attar bottle (Three.js): glass body and thick base, coloured
 * perfume inside, black cap, and a paper label wrapped round the glass with
 * the product name printed on it. It rises into place and turns a full circle;
 * the name comes into view as the front comes round. Drag to turn it any way;
 * let go and it settles back to face you. Choosing another size lifts the
 * current bottle away and a new one rises in. If WebGL is not available the
 * photo version is shown instead.
 */

const H = 3.05; // bottle height in scene units (12 gm)
const R = 0.63; // body radius (corner to centre)
const LABEL_Y = 1.04;
const LABEL_H = 0.98;
const TAU = Math.PI * 2;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function labelTexture(name: string, brand: string, origin: string, maxAniso: number) {
  const W = 2048;
  const Hh = 540;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = Hh;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6f4ee";
  g.fillRect(0, 0, W, Hh);
  // faint paper edge lines
  g.fillStyle = "rgba(0,0,0,0.07)";
  g.fillRect(0, 14, W, 2);
  g.fillRect(0, Hh - 16, W, 2);

  const ink = "#1a1a1a";
  g.fillStyle = ink;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const cx = W / 2;
  const maxW = 640; // the part of the label that faces the camera

  // product name, shrunk to fit
  let size = 118;
  g.font = `700 ${size}px Arial, Helvetica, sans-serif`;
  while (g.measureText(name).width > maxW && size > 44) {
    size -= 4;
    g.font = `700 ${size}px Arial, Helvetica, sans-serif`;
  }
  g.fillText(name, cx, Hh * 0.3);

  const brandText = brand.toUpperCase().replace(/\s+/g, "");
  let bs = 46;
  g.font = `600 ${bs}px Arial, Helvetica, sans-serif`;
  while (g.measureText(brandText).width > maxW && bs > 20) {
    bs -= 2;
    g.font = `600 ${bs}px Arial, Helvetica, sans-serif`;
  }
  g.fillText(brandText, cx, Hh * 0.55);
  const bw = Math.min(g.measureText(brandText).width, maxW);
  g.fillRect(cx - bw / 2, Hh * 0.55 + bs * 0.62, bw, 5);

  g.font = "800 66px Arial, Helvetica, sans-serif";
  g.fillText(origin, cx, Hh * 0.8);

  // small repeat on the far side so the back of the label isn't blank
  g.font = "600 30px Arial, Helvetica, sans-serif";
  g.fillStyle = "rgba(26,26,26,0.55)";
  g.fillText(`${brand.toUpperCase()}  ·  PURE ATTAR  ·  KANNAUJ`, 200, Hh / 2);
  g.fillText(`${brand.toUpperCase()}  ·  PURE ATTAR  ·  KANNAUJ`, W - 200, Hh / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

type Built = { group: THREE.Group; dispose: () => void };

/*
 * Shape follows the studio photo of the real bottle: an eight-sided glass
 * body with a thick clear base, perfume inside, a paper band round the middle,
 * a glossy black neck with two grooves and a flat black lid. Units: 3.05 tall.
 */
const FLAT_FRONT = -Math.PI / 8; // eight sides, a flat face toward the camera
const BODY_TOP = 2.1;
const NECK_TOP = 2.76;

function buildBottle(size: BottleSize, accent: string, name: string, brand: string, maxAniso: number, shared: { glass: THREE.Material; cap: THREE.Material; ring: THREE.Material; env: THREE.Texture }): Built {
  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const keep = <T extends THREE.BufferGeometry>(g: T) => (geos.push(g), g);
  const prism = (r: number, h: number, y: number, mat: THREE.Material, order: number, open = false) => {
    const m = new THREE.Mesh(keep(new THREE.CylinderGeometry(r, r, h, 8, 1, open, FLAT_FRONT)), mat);
    m.position.y = y + h / 2;
    m.renderOrder = order;
    group.add(m);
    return m;
  };

  // glass body (clear) and a heavier, more visible block of glass at the base
  prism(R, BODY_TOP, 0, shared.glass, 3);
  prism(R + 0.004, 0.42, 0, shared.glass, 3);

  // perfume
  const liquidMat = new THREE.MeshPhysicalMaterial({
    // a little darker than the swatch: studio light brightens it on screen
    color: new THREE.Color(liquidColor(accent)).multiplyScalar(0.8),
    roughness: 0.25,
    clearcoat: 0.5,
    clearcoatRoughness: 0.12,
    transparent: true,
    opacity: 0.95,
    envMap: shared.env,
    envMapIntensity: 0.5,
  });
  mats.push(liquidMat);
  prism(R - 0.06, BODY_TOP - 0.12 - 0.5, 0.5, liquidMat, 1);

  // paper band, eight flat faces like the glass under it
  const labelGeo = keep(new THREE.CylinderGeometry(R + 0.014, R + 0.014, LABEL_H, 8, 1, true, FLAT_FRONT));
  const labelTex = labelTexture(name, brand, "KANNAUJ", maxAniso);
  labelTex.wrapS = THREE.RepeatWrapping;
  labelTex.offset.x = 0.5 - 1 / 16; // centre the printed part on the front face
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    envMap: shared.env,
    envMapIntensity: 0.35,
    roughness: 0.62,
    side: THREE.DoubleSide,
  });
  mats.push(labelMat);
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = LABEL_Y;
  label.renderOrder = 2;
  group.add(label);

  // black neck, two grooves, flat lid with a rounded edge
  const neck = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.365, 0.365, NECK_TOP - BODY_TOP, 48)), shared.cap);
  neck.position.y = BODY_TOP + (NECK_TOP - BODY_TOP) / 2;
  group.add(neck);
  for (const y of [2.29, 2.7]) {
    const g = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.378, 0.378, 0.05, 48)), shared.ring);
    g.position.y = y;
    group.add(g);
  }
  const lidPts = [
    new THREE.Vector2(0, NECK_TOP),
    new THREE.Vector2(0.4, NECK_TOP),
    new THREE.Vector2(0.4, H - 0.07),
    ...new THREE.QuadraticBezierCurve(new THREE.Vector2(0.4, H - 0.07), new THREE.Vector2(0.4, H), new THREE.Vector2(0.33, H)).getPoints(6),
    new THREE.Vector2(0, H),
  ];
  group.add(new THREE.Mesh(keep(new THREE.LatheGeometry(lidPts, 64)), shared.cap));

  // smaller sizes are smaller bottles, standing on the same floor
  group.scale.setScalar(bottleHeightRatio(size));

  return {
    group,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => {
        (m as THREE.MeshStandardMaterial).map?.dispose();
        m.dispose();
      });
    },
  };
}

type Item = { built: Built; born: number; leaving: number | null; baseY: number; spinFrom: number };

export function Bottle3D({ size, accent, name, brand }: { size: BottleSize; accent: string; name: string; brand: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{ show: (s: BottleSize) => void } | null>(null);
  const [failed, setFailed] = useState(false);
  const latest = useRef({ size, accent, name, brand });
  useEffect(() => {
    latest.current = { size, accent, name, brand };
  });

  // build the scene once
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setTimeout(() => setFailed(true), 0);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.domElement.className = "absolute inset-0 size-full touch-pan-y cursor-grab active:cursor-grabbing";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    const key = new THREE.DirectionalLight("#fff4e0", 1.1);
    key.position.set(3, 5, 4);
    scene.add(key);
    scene.add(new THREE.AmbientLight("#ffffff", 0.2));

    // soft shadow on the floor
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const sg = sc.getContext("2d")!;
    const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(40,22,10,0.38)");
    grad.addColorStop(1, "rgba(40,22,10,0)");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(sc);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    scene.add(shadow);

    const shared = {
      glass: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.03,
        metalness: 0,
        transparent: true,
        opacity: 0.2,
        envMap: envTex,
        envMapIntensity: 2.2,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      cap: new THREE.MeshPhysicalMaterial({ color: "#08080a", envMap: envTex, envMapIntensity: 1.4, roughness: 0.14, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06 }),
      env: envTex,
      ring: new THREE.MeshStandardMaterial({ color: "#2a2a2e", envMap: envTex, roughness: 0.35, metalness: 0.6 }),
    };

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const items: Item[] = [];
    const root = new THREE.Group();
    scene.add(root);

    // drag to turn
    let dragging = false;
    let lastX = 0;
    let vel = 0;
    let userYaw = 0; // extra turn from dragging
    let idleSince = performance.now();
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      vel = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      userYaw += dx * 0.012;
      vel = dx * 0.012;
      idleSince = performance.now();
    };
    const up = () => {
      dragging = false;
      idleSince = performance.now();
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", up);

    const fit = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const needH = H + 0.9;
      const needW = R * 2 + 1.1;
      const dist = Math.max(needH / 2 / Math.tan(fov / 2), needW / 2 / (Math.tan(fov / 2) * camera.aspect));
      camera.position.set(0, 1.9, dist);
      camera.lookAt(0, 1.48, 0);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const SPIN = reduce ? 0 : 1.9;
    const show = (s: BottleSize) => {
      const now = performance.now();
      items.forEach((it) => {
        if (it.leaving === null) it.leaving = now;
      });
      const l = latest.current;
      const built = buildBottle(s, l.accent, l.name, l.brand, maxAniso, shared);
      root.add(built.group);
      items.push({ built, born: now, leaving: null, baseY: 0, spinFrom: -TAU });
      userYaw = 0;
      idleSince = now + SPIN * 1000;
    };
    api.current = { show };
    show(latest.current.size);

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      if (!dragging) {
        vel *= 0.92;
        userYaw += vel;
        // after a pause, ease back to facing the front, with a slow sway
        if (now - idleSince > 1800) {
          const target = Math.round(userYaw / TAU) * TAU;
          userYaw += (target - userYaw) * 0.04;
        }
      }
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        const g = it.built.group;
        if (it.leaving !== null) {
          const t = Math.min((now - it.leaving) / 650, 1);
          g.position.y = ease(t) * 4.2;
          if (t >= 1) {
            root.remove(g);
            it.built.dispose();
            items.splice(i, 1);
          }
          continue;
        }
        const tIn = reduce ? 1 : Math.min((now - it.born) / 1000 / SPIN, 1);
        const rise = reduce ? 1 : ease(Math.min((now - it.born) / 800, 1));
        g.position.y = -3.6 * (1 - rise);
        const sway = tIn >= 1 && !dragging && now - idleSince > 1800 ? Math.sin(now / 1500) * 0.12 : 0;
        g.rotation.y = it.spinFrom * (1 - ease(tIn)) + userYaw + sway;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("pointercancel", up);
      items.forEach((it) => it.built.dispose());
      shared.glass.dispose();
      shared.cap.dispose();
      shared.ring.dispose();
      shadowTex.dispose();
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
    // built once per mount; size changes go through api.show below
  }, []);

  // another size: lift the current bottle away, raise a new one
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    api.current?.show(size);
  }, [size]);

  if (failed) return <BottleStage size={size} accent={accent} name={name} brand={brand} />;

  return (
    <div ref={mount} className="absolute inset-0" role="img" aria-label={`${name}, ${size} gm bottle. Drag to turn it.`}>
      <p className="pointer-events-none absolute inset-x-0 bottom-3 z-10 text-center text-[10px] uppercase tracking-[0.2em] text-foreground/40">Drag to turn</p>
    </div>
  );
}
