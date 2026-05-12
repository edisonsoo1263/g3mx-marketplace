"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils/cn";

/**
 * HeroFiberBackground — interactive WebGL backdrop for the G3MX hero.
 *
 * Layers, back to front:
 *   1. Deep-navy clear color
 *   2. Floating cloud of instanced 3D crystals (octahedra) tinted cyan + hot
 *      pink, each rotating independently. Two colored point lights catch
 *      the facets so they read as faceted glass, not flat dots.
 *   3. Mouse-parallax camera that lerps toward the cursor for subtle depth
 *   4. Center pulsing glow with a glitch shader on a screen-facing plane
 *
 * Respects `prefers-reduced-motion`: drops parallax, freezes per-crystal
 * rotation, kills the glitch jitter (steady pulse remains).
 *
 * Performance:
 *   - InstancedMesh → 1 draw call regardless of crystal count
 *   - DPR capped at 1.5
 *   - antialias on (faceted edges look terrible without it)
 *   - Crystal count scales by viewport: 300 desktop / 150 mobile
 */

const COLOR_NAVY = "#0f172a";
const COLOR_CYAN = "#38bdf8";
const COLOR_PINK = "#f472b6";

interface Props {
  className?: string;
}

export function HeroFiberBackground({ className }: Props) {
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const crystalCount = isMobile ? 150 : 300;

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 -z-10", className)}
      style={{ background: COLOR_NAVY }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        frameloop={reduced ? "demand" : "always"}
      >
        <color attach="background" args={[COLOR_NAVY]} />

        {/* Lighting: cool ambient + two colored key lights so the facets
            catch cyan on one side and pink on the other. */}
        <ambientLight intensity={0.45} color="#1c2747" />
        <pointLight
          position={[9, 5, 5]}
          color={COLOR_CYAN}
          intensity={3.2}
          distance={28}
        />
        <pointLight
          position={[-9, -3, 5]}
          color={COLOR_PINK}
          intensity={3.2}
          distance={28}
        />
        <directionalLight
          position={[0, 10, 10]}
          intensity={0.35}
          color="#ffffff"
        />

        {!reduced && <CameraParallax />}
        <CrystalCloud count={crystalCount} reduced={!!reduced} />
        <CenterPulse reduced={!!reduced} />
      </Canvas>
    </div>
  );
}

// ── Camera mouse-parallax ───────────────────────────────────────

function CameraParallax() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const targetX = pointer.x * 0.45;
    const targetY = pointer.y * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Crystal cloud (InstancedMesh of octahedra) ──────────────────

interface CrystalInstance {
  pos: THREE.Vector3;
  rot: THREE.Quaternion;
  rotVel: THREE.Vector3; // per-axis radians/sec
  scale: number;
  color: THREE.Color;
}

function CrystalCloud({
  count,
  reduced,
}: {
  count: number;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Build per-instance state once, deterministic per count for stability
  const instances = useMemo<CrystalInstance[]>(() => {
    const arr: CrystalInstance[] = [];
    const cyan = new THREE.Color(COLOR_CYAN);
    const pink = new THREE.Color(COLOR_PINK);
    for (let i = 0; i < count; i++) {
      // Spherical-shell distribution, biased slightly behind origin so the
      // center pulse stays the eye-target.
      const r = 4 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi) - 2,
      );

      arr.push({
        pos,
        rot: new THREE.Quaternion().random(),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.4,
        ),
        // Slim crystal sizes — most small, a few larger for interest
        scale: 0.06 + Math.random() * Math.random() * 0.18,
        color: Math.random() > 0.7 ? pink : cyan,
      });
    }
    return arr;
  }, [count]);

  // Hoist scratch objects so we don't allocate per-frame
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpEuler = useMemo(() => new THREE.Euler(), []);

  // Initial: paint matrices + colors once after mount
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    instances.forEach((inst, i) => {
      dummy.position.copy(inst.pos);
      dummy.quaternion.copy(inst.rot);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, inst.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instances, dummy]);

  // Per-frame: spin each crystal a tiny bit. Skipped on reduced-motion.
  useFrame((_, delta) => {
    if (!meshRef.current || reduced) return;
    const mesh = meshRef.current;
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      tmpEuler.set(
        inst.rotVel.x * delta,
        inst.rotVel.y * delta,
        inst.rotVel.z * delta,
      );
      tmpQuat.setFromEuler(tmpEuler);
      inst.rot.multiply(tmpQuat);

      dummy.position.copy(inst.pos);
      dummy.quaternion.copy(inst.rot);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        metalness={0.55}
        roughness={0.18}
        emissive="#0a1530"
        emissiveIntensity={0.25}
      />
    </instancedMesh>
  );
}

// ── Center pulse + glitch shader ────────────────────────────────

function CenterPulse({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCyan: { value: new THREE.Color(COLOR_CYAN) },
      uPink: { value: new THREE.Color(COLOR_PINK) },
      uReduced: { value: reduced ? 1 : 0 },
    }),
    [reduced],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, 0]} scale={[3.5, 3.5, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </mesh>
  );
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCyan;
  uniform vec3 uPink;
  uniform float uReduced;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 center = vec2(0.5);
    vec2 uv = vUv;

    float pulse = sin(uTime * 1.2) * 0.5 + 0.5;

    float glitchTrigger = step(0.992, random(vec2(floor(uTime * 14.0), 0.0)));
    float glitchAmt = glitchTrigger * (random(vec2(uTime, vUv.y * 48.0)) - 0.5) * 0.10;
    uv.x += glitchAmt * (1.0 - uReduced);

    float dist = distance(uv, center);
    float core = smoothstep(0.5, 0.0, dist) * (0.55 + pulse * 0.45);
    float ring = smoothstep(0.46, 0.42, dist) * 0.35 * pulse;

    vec3 color = mix(uCyan, uPink, pulse * 0.55 + 0.2);
    float alpha = clamp((core + ring) * 0.85, 0.0, 1.0);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;
