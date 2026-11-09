"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { build } from "@/lib/progress";

/* ───────────────────────── constantes de projeto ───────────────────────── */

const R = 1; // raio médio da virola
const TH = 0.045; // espessura da chapa
const RW = R + TH / 2; // raio externo
const LC = 1.55; // comprimento de cada virola
const W = 2 * Math.PI * R; // largura da chapa = circunferência
const NU = 180; // divisões ao longo do arco
const Y0 = -1.3; // altura da chapa deitada
const FLOOR = -1.35;
const GAP = 0.55; // distância entre as duas chapas antes de juntar

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = THREE.MathUtils.lerp;

/* ───────────────────────────── materiais ───────────────────────────── */

const STEEL = new THREE.Color("#a3acb7");
const BLUE = new THREE.Color("#0b4aa8");

const mats = {
  paint: new THREE.MeshPhysicalMaterial({ color: STEEL, metalness: 0.92, roughness: 0.34, clearcoat: 0, clearcoatRoughness: 0.25 }),
  inner: new THREE.MeshStandardMaterial({ color: "#7e8793", metalness: 0.85, roughness: 0.42 }),
  edge: new THREE.MeshStandardMaterial({ color: "#d3d9e0", metalness: 1, roughness: 0.22, side: THREE.DoubleSide }),
  steel: new THREE.MeshStandardMaterial({ color: "#b4bcc6", metalness: 0.95, roughness: 0.3 }),
  dark: new THREE.MeshStandardMaterial({ color: "#161a21", metalness: 0.5, roughness: 0.6 }),
  bolt: new THREE.MeshStandardMaterial({ color: "#59606b", metalness: 1, roughness: 0.35 }),
};

const makeWeldMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: "#868d97",
    metalness: 0.8,
    roughness: 0.45,
    emissive: new THREE.Color("#ff7a18"),
    emissiveIntensity: 0,
  });

/* ───────────────────── chapa que dobra (geometria dinâmica) ───────────────────── */

const createPlate = (halfLength: number) => {
  const n = NU + 1;
  const vOuter = 0;
  const vInner = 2 * n;
  const vEz0 = 4 * n;
  const vEz1 = 6 * n;
  const vEs0 = 8 * n;
  const vEs1 = 8 * n + 4;
  const total = 8 * n + 8;
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const idx: number[] = [];

  const o = (i: number, j: number) => vOuter + i * 2 + j;
  const inn = (i: number, j: number) => vInner + i * 2 + j;

  for (let i = 0; i < NU; i++) {
    const a = o(i, 0), b = o(i, 1), c = o(i + 1, 0), d = o(i + 1, 1);
    idx.push(a, c, b, b, c, d);
  }
  const outerCount = idx.length;
  for (let i = 0; i < NU; i++) {
    const a = inn(i, 0), b = inn(i, 1), c = inn(i + 1, 0), d = inn(i + 1, 1);
    idx.push(a, b, c, b, d, c);
  }
  const innerCount = idx.length - outerCount;
  const edgeStart = idx.length;
  for (let i = 0; i < NU; i++) {
    const q0 = vEz0 + i * 2, q2 = q0 + 1, q1 = q0 + 2, q3 = q0 + 3;
    idx.push(q0, q2, q1, q1, q2, q3);
    const r0 = vEz1 + i * 2, r2 = r0 + 1, r1 = r0 + 2, r3 = r0 + 3;
    idx.push(r0, r1, r2, r1, r3, r2);
  }
  idx.push(vEs0, vEs0 + 1, vEs0 + 2, vEs0 + 1, vEs0 + 3, vEs0 + 2);
  idx.push(vEs1, vEs1 + 2, vEs1 + 1, vEs1 + 1, vEs1 + 2, vEs1 + 3);
  const edgeCount = idx.length - edgeStart;

  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3);
  const norAttr = new THREE.BufferAttribute(nor, 3);
  geometry.setAttribute("position", posAttr);
  geometry.setAttribute("normal", norAttr);
  geometry.setIndex(idx);
  geometry.addGroup(0, outerCount, 0);
  geometry.addGroup(outerCount, innerCount, 1);
  geometry.addGroup(edgeStart, edgeCount, 2);

  const set = (arr: Float32Array, v: number, x: number, y: number, z: number) => {
    arr[v * 3] = x;
    arr[v * 3 + 1] = y;
    arr[v * 3 + 2] = z;
  };

  const update = (bend: number, s0: number) => {
    const k = Math.max(bend, 0.0001) / R;
    const h = TH / 2;
    for (let i = 0; i <= NU; i++) {
      const s = s0 + (W * i) / NU;
      const th = k * s;
      const sin = Math.sin(th), cos = Math.cos(th);
      const px = sin / k, py = (1 - cos) / k;
      const nx = -sin, ny = cos; // normal para dentro
      const ox = px - h * nx, oy = py - h * ny;
      const ix = px + h * nx, iy = py + h * ny;
      for (let j = 0; j < 2; j++) {
        const z = j === 0 ? -halfLength : halfLength;
        set(pos, o(i, j), ox, oy, z);
        set(nor, o(i, j), -nx, -ny, 0);
        set(pos, inn(i, j), ix, iy, z);
        set(nor, inn(i, j), nx, ny, 0);
      }
      set(pos, vEz0 + i * 2, ox, oy, -halfLength);
      set(pos, vEz0 + i * 2 + 1, ix, iy, -halfLength);
      set(pos, vEz1 + i * 2, ox, oy, halfLength);
      set(pos, vEz1 + i * 2 + 1, ix, iy, halfLength);
      for (const v of [vEz0 + i * 2, vEz0 + i * 2 + 1]) set(nor, v, 0, 0, -1);
      for (const v of [vEz1 + i * 2, vEz1 + i * 2 + 1]) set(nor, v, 0, 0, 1);
      if (i === 0 || i === NU) {
        const base = i === 0 ? vEs0 : vEs1;
        const sign = i === 0 ? -1 : 1;
        const tx = Math.cos(th) * sign, ty = Math.sin(th) * sign;
        set(pos, base, ox, oy, -halfLength);
        set(pos, base + 1, ox, oy, halfLength);
        set(pos, base + 2, ix, iy, -halfLength);
        set(pos, base + 3, ix, iy, halfLength);
        for (let q = 0; q < 4; q++) set(nor, base + q, tx, ty, 0);
      }
    }
    posAttr.needsUpdate = true;
    norAttr.needsUpdate = true;
  };

  update(0, 0);
  return { geometry, update };
};

/* ───────────────────────── cordões de solda ───────────────────────── */

class CircleCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  constructor(radius: number) {
    super();
    this.radius = radius;
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    return target.set(Math.cos(a) * this.radius, Math.sin(a) * this.radius, 0);
  }
}

const TUBULAR = 160;
const RADIAL = 6;
const BEAD = 0.024;
const RB = RW + 0.004; // raio do cordão

type Seam = {
  id: string;
  start: number;
  end: number;
  geometry: THREE.TubeGeometry;
  material: THREE.MeshStandardMaterial;
  at: (frac: number, out: THREE.Vector3) => THREE.Vector3;
};

const lineSeam = (id: string, from: THREE.Vector3, to: THREE.Vector3, start: number, end: number): Seam => ({
  id,
  start,
  end,
  geometry: new THREE.TubeGeometry(new THREE.LineCurve3(from, to), TUBULAR, BEAD, RADIAL, false),
  material: makeWeldMaterial(),
  at: (f, out) => out.lerpVectors(from, to, f),
});

const ringSeam = (id: string, z: number, start: number, end: number): Seam => {
  const geometry = new THREE.TubeGeometry(new CircleCurve(RB), TUBULAR, BEAD, RADIAL, false);
  geometry.translate(0, 0, z);
  return {
    id,
    start,
    end,
    geometry,
    material: makeWeldMaterial(),
    at: (f, out) => out.set(Math.cos(f * Math.PI * 2) * RB, Math.sin(f * Math.PI * 2) * RB, z),
  };
};

/* estado da tocha (lido pelas faíscas) */
const torch = { local: new THREE.Vector3(), active: 0, world: new THREE.Vector3() };

/* ───────────────────────────── partes ───────────────────────────── */

const Driver = () => {
  useFrame((_, dt) => {
    build.smooth = THREE.MathUtils.damp(build.smooth, build.progress, 5, Math.min(dt, 0.05));
  });
  return null;
};

const Rig = () => {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = build.smooth;
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    // em tela larga o texto fica à esquerda: a máquina ocupa ~58% da direita
    const wide = aspect > 1.15;
    const f = wide ? 0.5 : 1;
    const d0 = Math.max(9, 3.5 / (tanHalf * aspect * f));
    const d1 = Math.max(9.2, 2.9 / (tanHalf * aspect * f));
    const c = easeInOut(seg(p, 0.08, 0.55));
    const dist = lerp(d0, d1, c);
    const y = lerp(4.2, 2.1, c);
    const shift = wide ? dist * tanHalf * aspect * 0.42 : 0;
    const ty = wide ? lerp(-0.6, -0.1, c) : lerp(1.9, 1.3, c);
    const sway = Math.sin(p * Math.PI * 2) * 0.35 * seg(p, 0.55, 1);
    cam.position.set(sway - shift, y, dist);
    target.set(-shift, ty, 0);
    cam.lookAt(target);
  });
  return null;
};

const Torch = () => {
  const light = useRef<THREE.PointLight>(null);
  const bulb = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!light.current || !bulb.current) return;
    light.current.position.copy(torch.local);
    light.current.intensity = torch.active * 6;
    bulb.current.position.copy(torch.local);
    bulb.current.visible = torch.active > 0.05;
    bulb.current.scale.setScalar(0.5 + torch.active * 0.8);
  });
  return (
    <>
      <pointLight ref={light} color="#ffa24a" distance={3.2} decay={2} intensity={0} />
      <mesh ref={bulb} visible={false}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#fff2d6" toneMapped={false} />
      </mesh>
    </>
  );
};

const SPARKS = 220;
const Sparks = ({ root }: { root: React.RefObject<THREE.Group | null> }) => {
  const data = useMemo(
    () => ({
      pos: new Float32Array(SPARKS * 3),
      col: new Float32Array(SPARKS * 3),
      vel: new Float32Array(SPARKS * 3),
      life: new Float32Array(SPARKS),
      max: new Float32Array(SPARKS),
    }),
    [],
  );
  const geo = useRef<THREE.BufferGeometry>(null);
  const budget = useRef(0);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const g = geo.current;
    const group = root.current;
    if (!g || !group) return;
    group.localToWorld(torch.world.copy(torch.local));
    budget.current += torch.active * dt * 160;
    for (let i = 0; i < SPARKS; i++) {
      const i3 = i * 3;
      if (data.life[i] <= 0) {
        if (budget.current >= 1) {
          budget.current -= 1;
          data.pos[i3] = torch.world.x;
          data.pos[i3 + 1] = torch.world.y;
          data.pos[i3 + 2] = torch.world.z;
          data.vel[i3] = (Math.random() - 0.5) * 2.6;
          data.vel[i3 + 1] = 1 + Math.random() * 2.6;
          data.vel[i3 + 2] = (Math.random() - 0.5) * 2.6;
          data.max[i] = data.life[i] = 0.35 + Math.random() * 0.6;
        } else {
          data.col[i3] = data.col[i3 + 1] = data.col[i3 + 2] = 0;
          continue;
        }
      }
      data.life[i] -= dt;
      data.vel[i3 + 1] -= 7 * dt;
      data.pos[i3] += data.vel[i3] * dt;
      data.pos[i3 + 1] += data.vel[i3 + 1] * dt;
      data.pos[i3 + 2] += data.vel[i3 + 2] * dt;
      if (data.pos[i3 + 1] < FLOOR) {
        data.pos[i3 + 1] = FLOOR;
        data.vel[i3 + 1] *= -0.3;
      }
      const f = Math.max(0, data.life[i] / data.max[i]);
      data.col[i3] = f;
      data.col[i3 + 1] = 0.55 * f * f;
      data.col[i3 + 2] = 0.12 * f * f * f;
    }
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
};

/* ─────────────────────────────── tampo ─────────────────────────────── */

const Head = ({ side }: { side: 1 | -1 }) => {
  const ref = useRef<THREE.Group>(null);
  const seamId = side === -1 ? "HL" : "HR";
  void seamId;
  const { outer, inner, rim } = useMemo(() => {
    const ro = RW;
    const ri = R - TH / 2;
    const steps = 40;
    const po: THREE.Vector2[] = [];
    const pi: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2);
      po.push(new THREE.Vector2(Math.max(ro * Math.cos(a), 0.0001), (ro / 2) * Math.sin(a)));
      pi.push(new THREE.Vector2(Math.max(ri * Math.cos(a), 0.0001), (ri / 2) * Math.sin(a)));
    }
    pi.reverse();
    return {
      outer: new THREE.LatheGeometry(po, 96),
      inner: new THREE.LatheGeometry(pi, 96),
      rim: new THREE.RingGeometry(ri, ro, 96),
    };
  }, []);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const e = easeInOut(seg(build.smooth, 0.5, 0.62));
    g.visible = e > 0.001;
    g.position.z = side * (LC + (1 - e) * 3.8);
    g.position.y = (1 - e) * 0.35;
  });

  return (
    <group ref={ref} visible={false}>
      <group rotation-x={(side * Math.PI) / 2}>
        <mesh geometry={outer} material={mats.paint} />
        <mesh geometry={inner} material={mats.inner} />
        <mesh geometry={rim} material={mats.edge}  rotation-x={Math.PI / 2} />
      </group>
    </group>
  );
};

/* ─────────────────────────────── bocais ─────────────────────────────── */

type NozzleSpec = { alpha: number; z: number; r: number; len: number; manway?: boolean };

const nozzles: NozzleSpec[] = [
  { alpha: 38, z: -0.95, r: 0.13, len: 0.5 },
  { alpha: -38, z: -0.45, r: 0.11, len: 0.42 },
  { alpha: 60, z: 0.35, r: 0.1, len: 0.38 },
  { alpha: 38, z: 1.15, r: 0.085, len: 0.34 },
  { alpha: 0, z: 0.8, r: 0.3, len: 0.3, manway: true },
];

const Nozzle = ({ spec, index }: { spec: NozzleSpec; index: number }) => {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const ring = useMemo(makeWeldMaterial, []);
  const a = THREE.MathUtils.degToRad(spec.alpha);
  const start = 0.66 + index * 0.022;
  const end = start + 0.07;
  const bolts = spec.manway ? 12 : 8;
  const fr = spec.r * (spec.manway ? 1.4 : 1.65);

  useFrame(() => {
    const p = build.smooth;
    const t = easeOut(seg(p, start, end));
    if (group.current) group.current.visible = t > 0.001;
    if (body.current) body.current.scale.set(1, Math.max(t, 0.0001), 1);
    ring.emissiveIntensity = t > 0.95 ? (1 - seg(p, end, end + 0.05)) * 3 : 0;
  });

  return (
    <group
      ref={group}
      position={[Math.sin(a) * (RW - 0.012), Math.cos(a) * (RW - 0.012), spec.z]}
      rotation-z={-a}
      visible={false}
    >
      <group ref={body}>
        <mesh position-y={spec.len / 2 - 0.02} material={mats.paint}>
          <cylinderGeometry args={[spec.r, spec.r, spec.len + 0.04, 32, 1, true]} />
        </mesh>
        <mesh position-y={spec.len} material={mats.steel}>
          <cylinderGeometry args={[fr, fr, 0.05, 40]} />
        </mesh>
        <mesh position-y={spec.len + 0.03} material={mats.edge}>
          <cylinderGeometry args={[fr * 0.78, fr * 0.78, 0.014, 40]} />
        </mesh>
        {Array.from({ length: bolts }, (_, i) => {
          const b = (i / bolts) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(b) * fr * 0.88, spec.len + 0.05, Math.sin(b) * fr * 0.88]} material={mats.bolt}>
              <cylinderGeometry args={[0.014, 0.014, 0.06, 6]} />
            </mesh>
          );
        })}
      </group>
      <mesh rotation-x={Math.PI / 2} position-y={0.005} material={ring}>
        <torusGeometry args={[spec.r + 0.012, 0.02, 8, 48]} />
      </mesh>
    </group>
  );
};

/* ─────────────────────────────── selas ─────────────────────────────── */

const Saddle = ({ z }: { z: number }) => {
  const web = useMemo(() => {
    const s = new THREE.Shape();
    const rr = RW + 0.012;
    const hw = 0.82;
    const bottom = FLOOR + 0.05;
    s.moveTo(-hw, bottom);
    s.lineTo(hw, bottom);
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const x = hw - (2 * hw * i) / steps;
      s.lineTo(x, -Math.sqrt(rr * rr - x * x));
    }
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false });
  }, []);

  return (
    <group position-z={z}>
      <mesh geometry={web} position-z={-0.12} material={mats.dark} />
      <mesh geometry={web} position-z={0.08} material={mats.dark} />
      <mesh position={[0, FLOOR + 0.025, 0]} material={mats.steel}>
        <boxGeometry args={[1.95, 0.05, 0.56]} />
      </mesh>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, FLOOR + 0.28, -0.02]} material={mats.dark}>
          <boxGeometry args={[0.04, 0.45, 0.2]} />
        </mesh>
      ))}
      {[-0.82, 0.82].flatMap((x) =>
        [-0.2, 0.2].map((zz) => (
          <mesh key={`${x}${zz}`} position={[x, FLOOR + 0.07, zz]} material={mats.bolt}>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 8]} />
          </mesh>
        )),
      )}
    </group>
  );
};

const Saddles = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = easeOut(seg(build.smooth, 0.8, 0.9));
    g.visible = t > 0.001;
    g.position.y = -(1 - t) * 1.2;
  });
  return (
    <group ref={ref} visible={false}>
      <Saddle z={-0.95} />
      <Saddle z={0.95} />
    </group>
  );
};

/* ─────────────────────────── legendas técnicas ─────────────────────────── */

type TagDef = { pos: [number, number, number]; code: string; label: string };

const tagDefs: TagDef[] = [
  { pos: [0.62, 1.3, -0.95], code: "N1", label: "Entrada de produto" },
  { pos: [0, 1.5, 0.8], code: "BV", label: "Boca de visita" },
  { pos: [0, 0.2, -(LC + 0.6)], code: "T2", label: "Tampo elíptico 2:1" },
];

/** Legendas em DOM puro, projetadas a cada frame (evita criar um segundo root do React). */
const Tags = ({ root }: { root: React.RefObject<THREE.Group | null> }) => {
  const { gl, camera, size } = useThree();
  const els = useRef<HTMLDivElement[]>([]);
  const v = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const host = gl.domElement.parentElement;
    if (!host) return;
    const created = tagDefs.map((d) => {
      const el = document.createElement("div");
      el.className = "tag";
      el.style.cssText = "position:absolute;left:0;top:0;opacity:0;pointer-events:none;will-change:transform;z-index:5";
      el.innerHTML = `<span>${d.code}</span>${d.label}`;
      host.appendChild(el);
      return el;
    });
    els.current = created;
    return () => created.forEach((el) => el.remove());
  }, [gl]);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    const o = size.width < 700 ? 0 : easeOut(seg(build.smooth, 0.95, 0.99));
    els.current.forEach((el, i) => {
      el.style.opacity = String(o);
      if (o <= 0) return;
      group.localToWorld(v.set(...tagDefs[i].pos));
      v.project(camera);
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * size.width}px, ${(-v.y * 0.5 + 0.5) * size.height}px) translate(-50%, -50%)`;
    });
  });
  return null;
};

/* ─────────────────────────────── vaso ─────────────────────────────── */

const seams: Seam[] = [
  lineSeam("A", new THREE.Vector3(0, RB, -LC), new THREE.Vector3(0, RB, 0), 0.35, 0.41),
  lineSeam("B", new THREE.Vector3(RB, 0, 0), new THREE.Vector3(RB, 0, LC), 0.38, 0.44),
  ringSeam("C", 0, 0.42, 0.49),
  ringSeam("HL", -LC, 0.62, 0.645),
  ringSeam("HR", LC, 0.635, 0.66),
];

const Vessel = () => {
  const root = useRef<THREE.Group>(null);
  const groupA = useRef<THREE.Group>(null);
  const groupB = useRef<THREE.Group>(null);
  const seamMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const plateA = useMemo(() => createPlate(LC / 2), []);
  const plateB = useMemo(() => createPlate(LC / 2), []);
  const last = useRef({ a: -1, b: -1 });
  const plateMats = useMemo(() => [mats.paint, mats.inner, mats.edge], []);
  const s0A = -W / 2;
  const s0B = -W / 2 - W / 4;
  const offsetB = W / 4;

  useFrame(({ clock }) => {
    const p = build.smooth;
    const bendA = easeInOut(seg(p, 0.12, 0.25));
    const bendB = easeInOut(seg(p, 0.2, 0.33));
    const join = easeInOut(seg(p, 0.3, 0.36));

    if (Math.abs(bendA - last.current.a) > 1e-4) {
      plateA.update(bendA, s0A);
      last.current.a = bendA;
    }
    if (Math.abs(bendB - last.current.b) > 1e-4) {
      plateB.update(bendB, s0B);
      last.current.b = bendB;
    }

    const gap = GAP * (1 - join);
    groupA.current?.position.set(0, lerp(Y0, -R, bendA), -(LC / 2 + gap / 2));
    groupB.current?.position.set(offsetB * (1 - bendB), lerp(Y0, -R, bendB), LC / 2 + gap / 2);

    if (root.current) {
      const idle =
        Math.sin(clock.elapsedTime * 0.35) * 0.05 * (1 - seg(p, 0, 0.12)) +
        Math.sin(clock.elapsedTime * 0.45) * 0.14 * seg(p, 0.96, 1);
      root.current.rotation.y = -(easeInOut(seg(p, 0.08, 0.52)) * 1.0 + seg(p, 0.52, 1) * 0.38) + idle;
      root.current.rotation.x = (1 - seg(p, 0, 0.1)) * 0.0;
    }

    /* pintura */
    const paint = easeInOut(seg(p, 0.9, 0.97));
    mats.paint.color.lerpColors(STEEL, BLUE, paint);
    mats.paint.metalness = lerp(0.92, 0.35, paint);
    mats.paint.roughness = lerp(0.34, 0.3, paint);
    mats.paint.clearcoat = paint;

    /* soldas + tocha */
    let active = 0;
    seams.forEach((s, i) => {
      const frac = seg(p, s.start, s.end);
      const m = seamMeshes.current[i];
      if (!m) return;
      m.visible = frac > 0;
      s.geometry.setDrawRange(0, Math.floor(frac * TUBULAR) * RADIAL * 6);
      const sweeping = frac > 0 && frac < 1;
      s.material.emissiveIntensity = frac > 0 ? (sweeping ? 3 : (1 - seg(p, s.end, s.end + 0.05)) * 3) : 0;
      if (sweeping) {
        s.at(frac, torch.local);
        active = 1;
      }
    });
    torch.active = THREE.MathUtils.lerp(torch.active, active, 0.25);
  });

  return (
    <>
      <group ref={root}>
        <group ref={groupA}>
          <mesh geometry={plateA.geometry} material={plateMats} frustumCulled={false} />
        </group>
        <group ref={groupB}>
          <mesh geometry={plateB.geometry} material={plateMats} frustumCulled={false} />
        </group>

        {seams.map((s, i) => (
          <mesh
            key={s.id}
            ref={(el) => {
              seamMeshes.current[i] = el;
            }}
            geometry={s.geometry}
            material={s.material}
            visible={false}
            frustumCulled={false}
          />
        ))}

        <Head side={-1} />
        <Head side={1} />
        {nozzles.map((n, i) => (
          <Nozzle key={i} spec={n} index={i} />
        ))}
        <Saddles />
        <Torch />
      </group>
      <Sparks root={root} />
      <Tags root={root} />
    </>
  );
};

/* ─────────────────────────────── cena ─────────────────────────────── */

const VesselScene = ({ active = true }: { active?: boolean }) => (
  <Canvas
    frameloop={active ? "always" : "never"}
    dpr={[1, 1.6]}
    camera={{ fov: 32, near: 0.1, far: 80, position: [0, 4.2, 9] }}
    gl={{ antialias: true, powerPreference: "high-performance" }}
    onCreated={({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.25;
    }}
  >
    <color attach="background" args={["#07090c"]} />
    <Driver />
    <Rig />

    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3.6} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[14, 6, 1]} />
      <Lightformer form="rect" intensity={3} position={[0, 5, -9]} rotation-x={-0.5} scale={[22, 6, 1]} />
      <Lightformer form="rect" intensity={2} position={[-6, 2, 3]} rotation-y={Math.PI / 2.4} scale={[5, 5, 1]} color="#9dbcff" />
      <Lightformer form="rect" intensity={1.6} position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[4, 5, 1]} color="#ffd6a8" />
      <Lightformer form="rect" intensity={0.8} position={[0, -2, 6]} scale={[10, 2, 1]} color="#5b6b82" />
    </Environment>
    <ambientLight intensity={0.15} />
    <directionalLight position={[4, 7, 5]} intensity={1.2} color="#e8f0ff" />

    <Vessel />

    <Grid
      position={[0, FLOOR - 0.001, 0]}
      args={[40, 40]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#1b2a44"
      sectionSize={2.5}
      sectionThickness={1}
      sectionColor="#2a4a82"
      fadeDistance={16}
      fadeStrength={1.6}
      infiniteGrid
    />
    <ContactShadows position={[0, FLOOR + 0.002, 0]} opacity={0.65} scale={14} blur={2.6} far={3} resolution={512} color="#000000" />
  </Canvas>
);

export default VesselScene;
