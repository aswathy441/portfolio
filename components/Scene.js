"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../lib/state";

const damp = THREE.MathUtils.damp;
const ease = (k) => k * k * (3 - 2 * k);

// A building stage that "grows" upward from its base as S.build passes [from,to]
function Stage({ from, to, y = 0, children }) {
  const g = useRef();
  useFrame(() => {
    const k = Math.min(1, Math.max(0, (S.build - from) / (to - from)));
    g.current.scale.y = Math.max(ease(k), 0.0001);
    g.current.visible = k > 0.001;
  });
  return <group ref={g} position={[0, y, 0]}>{children}</group>;
}
const B = ({ p = [0, 0, 0], a, m }) => (
  <mesh position={p} castShadow receiveShadow material={m}><boxGeometry args={a} /></mesh>
);
const Tree = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 0.6, 8]} /><meshStandardMaterial color="#4a3020" /></mesh>
    <mesh position={[0, 1.1, 0]} castShadow><coneGeometry args={[0.55, 1.4, 9]} /><meshStandardMaterial color="#1f6b3d" roughness={0.9} /></mesh>
    <mesh position={[0, 1.7, 0]} castShadow><coneGeometry args={[0.38, 1, 9]} /><meshStandardMaterial color="#2a8a50" roughness={0.9} /></mesh>
  </group>
);

function House() {
  const g = useRef(), lA = useRef(), lB = useRef(), sun = useRef(), amb = useRef();
  const width = useThree((s) => s.size.width);
  const M = useMemo(() => ({
    concrete: new THREE.MeshStandardMaterial({ color: "#3b3b42", roughness: 0.85 }),
    white: new THREE.MeshStandardMaterial({ color: "#ebe7de", roughness: 0.5 }),
    wood: new THREE.MeshStandardMaterial({ color: "#8a5a3a", roughness: 0.7 }),
    gold: new THREE.MeshStandardMaterial({ color: "#e0b44c", metalness: 0.85, roughness: 0.25 }),
    dark: new THREE.MeshStandardMaterial({ color: "#15151a", metalness: 0.6, roughness: 0.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#a8d8ee", transparent: true, opacity: 0.38, roughness: 0.05, metalness: 0.2, emissive: "#ffb45a", emissiveIntensity: 0 }),
    pool: new THREE.MeshStandardMaterial({ color: "#2ac4e8", emissive: "#1aa0c8", emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.3 }),
  }), []);

  useFrame((state, dt) => {
    const t = S.t, mob = width < 900;
    S.build = damp(S.build, S.buildT, 2.5, dt);
    S.night = damp(S.night, t.n, 2, dt);
    S.spin += dt * 0.1;
    const o = g.current;
    o.position.x = damp(o.position.x, mob ? 0 : t.x, 3, dt);
    o.position.y = damp(o.position.y, -1.3 + (mob ? 1.9 : 0) + t.y, 3, dt);
    o.scale.setScalar(damp(o.scale.x, (mob ? 0.6 : 1) * t.s, 3, dt));
    o.rotation.y = damp(o.rotation.y, t.ry + S.spin + S.mx * 0.6, 2.2, dt);
    o.rotation.x = damp(o.rotation.x, S.my * 0.12, 3, dt);
    M.glass.emissiveIntensity = S.night * 1.6;
    M.pool.emissiveIntensity = 0.4 + S.night * 1.2;
    lA.current.intensity = S.night * 9 * Math.min(1, S.build * 1.2);
    lB.current.intensity = S.night * 7 * Math.min(1, S.build * 1.2);
    sun.current.intensity = 2.4 * (1 - 0.85 * S.night);
    amb.current.intensity = 0.55 - 0.3 * S.night;
    // camera drift with pointer
    state.camera.position.x = damp(state.camera.position.x, S.mx * 0.8, 2, dt);
    state.camera.position.y = damp(state.camera.position.y, 2.6 - S.my * 0.5, 2, dt);
    state.camera.lookAt(0, 0.2, 0);
  });

  return (
    <>
      <ambientLight ref={amb} />
      <hemisphereLight args={["#bcd6ff", "#2a1a10", 0.6]} />
      <directionalLight ref={sun} position={[6, 10, 6]} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
      <group ref={g}>
        {/* platform */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[7, 96]} /><meshStandardMaterial color="#101016" roughness={1} /></mesh>
        <gridHelper args={[14, 28, "#e0b44c", "#2c2c34"]} position={[0, 0.01, 0]} />
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}><ringGeometry args={[6.9, 7, 128]} /><meshBasicMaterial color="#e0b44c" /></mesh>

        <Stage from={0} to={0.18}><B p={[0, 0.15, 0]} a={[6.6, 0.3, 4.4]} m={M.concrete} /></Stage>
        <Stage from={0.18} to={0.45} y={0.3}>
          <B p={[-1.2, 0.75, 0]} a={[3, 1.5, 3.4]} m={M.concrete} />
          <B p={[1.9, 0.75, 0.2]} a={[2.3, 1.5, 3]} m={M.glass} />
          <B p={[0.75, 0.75, 1.6]} a={[0.12, 1.5, 0.12]} m={M.gold} />
          <B p={[3.0, 0.75, 1.6]} a={[0.12, 1.5, 0.12]} m={M.gold} />
        </Stage>
        <Stage from={0.45} to={0.56} y={1.8}><B p={[0.2, 0.1, 0]} a={[6.4, 0.2, 4.2]} m={M.wood} /></Stage>
        <Stage from={0.56} to={0.78} y={2}>
          <B p={[-0.5, 0.65, -0.2]} a={[3.6, 1.3, 2.8]} m={M.white} />
          <B p={[0.4, 0.65, 1.25]} a={[3.4, 0.9, 0.06]} m={M.glass} />
          <B p={[2.2, 0.65, -0.2]} a={[1.6, 1.3, 2.6]} m={M.glass} />
        </Stage>
        <Stage from={0.78} to={0.9} y={3.3}>
          <B p={[0.2, 0.09, 0]} a={[7, 0.18, 4.8]} m={M.dark} />
          <B p={[-0.4, 0.27, -0.1]} a={[7, 0.06, 4.8]} m={M.gold} />
        </Stage>
        <Stage from={0.9} to={1}>
          <mesh position={[-1.4, 0.04, 3.1]} receiveShadow material={M.pool}><boxGeometry args={[3.4, 0.08, 1.2]} /></mesh>
          <Tree p={[-5, 0, 2]} s={1.2} /><Tree p={[-4.6, 0, -2.2]} /><Tree p={[4.8, 0, 3]} s={1.1} /><Tree p={[5.2, 0, -2.4]} s={1.3} />
          <B p={[2.4, 0.05, 3.1]} a={[2.4, 0.1, 0.9]} m={M.wood} />
        </Stage>
        <pointLight ref={lA} position={[1.9, 1.2, 0.3]} color="#ffb45a" distance={7} />
        <pointLight ref={lB} position={[-0.5, 2.7, 1]} color="#ffcf90" distance={7} />
        <Orbs />
      </group>
    </>
  );
}

function Orbs() {
  const g = useRef();
  useFrame((st, dt) => {
    g.current.rotation.y += dt * 0.12;
    g.current.children.forEach((c, i) => { c.rotation.x += dt * 0.5; c.rotation.z += dt * 0.3; c.position.y = 2.5 + Math.sin(st.clock.elapsedTime + i) * 0.7; });
  });
  return (
    <group ref={g}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.2566) * 6.2, 2.5, Math.sin(i * 1.2566) * 6.2]}>
          <icosahedronGeometry args={[0.32, 0]} /><meshStandardMaterial color="#e0b44c" wireframe />
        </mesh>
      ))}
    </group>
  );
}

function Dust() {
  const ref = useRef();
  const pos = useMemo(() => { const a = new Float32Array(1200); for (let i = 0; i < 1200; i++) a[i] = (Math.random() - 0.5) * (i % 3 === 1 ? 10 : 26); return a; }, []);
  useFrame((st, dt) => { ref.current.rotation.y += dt * 0.02; ref.current.position.y = Math.sin(st.clock.elapsedTime * 0.3) * 0.3; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={400} array={pos} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.045} color="#e0b44c" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function Scene() {
  return (
    <div className="stage3d">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 2.6, 10], fov: 38 }} gl={{ antialias: true, alpha: true }}>
        <House />
        <Dust />
      </Canvas>
    </div>
  );
}
