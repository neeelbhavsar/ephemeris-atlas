import * as THREE from 'three'

/*
 * Custom shaders. Every hand-written ShaderMaterial includes the log-depth
 * chunks because the renderer uses `logarithmicDepthBuffer` — without them the
 * depth test would disagree with the built-in materials.
 *
 * The Sun is at the world origin and the solar system is only ever scaled
 * about it, so "direction to the Sun" is simply −worldPosition.
 */

const WORLD_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vObjNormal;
void main() {
  vUv = uv;
  vObjNormal = normal;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`

const NOISE = /* glsl */ `
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise3(p); p *= 2.03; a *= 0.5; }
  return v;
}
`

const FRAG_HEAD = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vObjNormal;
`

const FRAG_TAIL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`

/** Animated photosphere: churning granulation over the real Sun map, with limb darkening. HDR so it blooms. */
export function createSunMaterial(map: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uTime: { value: 0 },
      uIntensity: { value: 1.9 },
    },
    vertexShader: WORLD_VERT,
    fragmentShader: /* glsl */ `
      ${FRAG_HEAD}
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uIntensity;
      ${NOISE}
      void main() {
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vObjNormal);
        vec3 warp = vec3(fbm3(n * 5.0 + uTime * 0.04), fbm3(n * 5.0 - uTime * 0.03 + 7.1), 0.0);
        vec3 tex = texture2D(uMap, vUv + (warp.xy - 0.5) * 0.01).rgb;
        float gran = fbm3(n * 38.0 + warp * 3.0 + uTime * 0.12);
        vec3 col = tex * (0.7 + 0.6 * gran);
        vec3 V = normalize(cameraPosition - vWorldPos);
        float mu = clamp(dot(normalize(vWorldNormal), V), 0.0, 1.0);
        col *= 0.38 + 0.62 * pow(mu, 0.45);
        gl_FragColor = vec4(col * uIntensity, 1.0);
        ${FRAG_TAIL}
      }
    `,
    toneMapped: false,
  })
}

/**
 * Billboarded corona: soft glow plus slowly shifting streamers. Plane is
 * `discRatio` times wider than the Sun's diameter.
 */
export function createCoronaMaterial(discRatio: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDisc: { value: 1 / discRatio },
      uColor: { value: new THREE.Color('#ffb85c') },
      uOpacity: { value: 1 },
    },
    vertexShader: WORLD_VERT,
    fragmentShader: /* glsl */ `
      ${FRAG_HEAD}
      uniform float uTime;
      uniform float uDisc;
      uniform vec3 uColor;
      uniform float uOpacity;
      ${NOISE}
      void main() {
        #include <logdepthbuf_fragment>
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float x = max(r / uDisc, 1.0);             // 1 at the limb
        float glow = pow(1.0 / x, 2.6);            // inverse-power falloff
        float a = atan(p.y, p.x);
        float rays = fbm3(vec3(cos(a) * 3.0, sin(a) * 3.0, x * 0.6 - uTime * 0.05));
        float streamers = pow(rays, 2.0) * 1.8 / x;
        float edge = smoothstep(1.0, 0.55, r);
        vec3 col = uColor * (glow * 0.85 + streamers * 0.3) * edge;
        gl_FragColor = vec4(col * uOpacity, 1.0);
        ${FRAG_TAIL}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })
}

/** Fresnel rim atmosphere, brightest on the day side. Use on a shell slightly larger than the planet. */
export function createAtmosphereMaterial(color: string, strength: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uStrength: { value: strength },
    },
    vertexShader: WORLD_VERT,
    fragmentShader: /* glsl */ `
      ${FRAG_HEAD}
      uniform vec3 uColor;
      uniform float uStrength;
      void main() {
        #include <logdepthbuf_fragment>
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 L = normalize(-vWorldPos);
        float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
        float lit = smoothstep(-0.3, 0.45, dot(N, L));
        gl_FragColor = vec4(uColor * fres * lit * uStrength * 1.5, 1.0);
        ${FRAG_TAIL}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/** Adds a world-position varying to a built-in material's vertex shader. */
function addWorldVaryings(shader: THREE.WebGLProgramParametersWithUniforms, name: string) {
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>\nvarying vec3 ${name}Pos;\nvarying vec3 ${name}Normal;`,
    )
    .replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>\n${name}Pos = (modelMatrix * vec4(transformed, 1.0)).xyz;\n${name}Normal = normalize(mat3(modelMatrix) * objectNormal);`,
    )
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>\nvarying vec3 ${name}Pos;\nvarying vec3 ${name}Normal;`,
  )
}

/**
 * Earth: city lights from `night` glow on the night side. The terminator comes
 * from the real direction to the Sun, so it is where it truly is right now.
 */
export function applyNightLights(mat: THREE.MeshStandardMaterial, night: THREE.Texture) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNightMap = { value: night }
    addWorldVaryings(shader, 'vNl')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uNightMap;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float nlSun = dot(normalize(vNlNormal), normalize(-vNlPos));
        float nlNight = smoothstep(0.1, -0.2, nlSun);
        vec3 nlCity = texture2D(uNightMap, vMapUv).rgb;
        totalEmissiveRadiance += pow(nlCity, vec3(1.4)) * vec3(1.0, 0.82, 0.55) * nlNight * 3.2;`,
      )
  }
  mat.customProgramCacheKey = () => 'earth-night-lights'
  mat.needsUpdate = true
}

export interface RingShadowUniforms {
  uRingMap: { value: THREE.Texture }
  uRingNormal: { value: THREE.Vector3 }
  uPlanetCenter: { value: THREE.Vector3 }
  uRingInner: { value: number }
  uRingOuter: { value: number }
}

export function createRingShadowUniforms(map: THREE.Texture): RingShadowUniforms {
  return {
    uRingMap: { value: map },
    uRingNormal: { value: new THREE.Vector3(0, 1, 0) },
    uPlanetCenter: { value: new THREE.Vector3() },
    uRingInner: { value: 1 },
    uRingOuter: { value: 2 },
  }
}

/** Saturn: the rings' shadow on the planet (ray-cast toward the Sun into the ring plane). */
export function applyRingShadow(mat: THREE.MeshStandardMaterial, uniforms: RingShadowUniforms) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    addWorldVaryings(shader, 'vRs')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uRingMap;
        uniform vec3 uRingNormal;
        uniform vec3 uPlanetCenter;
        uniform float uRingInner;
        uniform float uRingOuter;
        float ringShadow(vec3 p) {
          vec3 d = normalize(-p);
          float denom = dot(uRingNormal, d);
          if (abs(denom) < 1e-5) return 1.0;
          float s = dot(uRingNormal, uPlanetCenter - p) / denom;
          if (s <= 0.0) return 1.0;
          float r = length(p + d * s - uPlanetCenter);
          if (r < uRingInner || r > uRingOuter) return 1.0;
          float a = texture2D(uRingMap, vec2((r - uRingInner) / (uRingOuter - uRingInner), 0.5)).a;
          return 1.0 - a * 0.85;
        }`,
      )
      .replace(
        '#include <lights_fragment_end>',
        '#include <lights_fragment_end>\nreflectedLight.directDiffuse *= ringShadow(vRsPos);',
      )
  }
  mat.customProgramCacheKey = () => 'saturn-ring-shadow'
  mat.needsUpdate = true
}

/** Planetary ring lit by the Sun, with the planet's shadow cast across it. */
export function createRingMaterial(
  map: THREE.Texture,
  uniforms: Pick<RingShadowUniforms, 'uRingNormal' | 'uPlanetCenter'> & {
    uPlanetRadius: { value: number }
  },
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uMap: { value: map }, ...uniforms },
    vertexShader: WORLD_VERT,
    fragmentShader: /* glsl */ `
      ${FRAG_HEAD}
      uniform sampler2D uMap;
      uniform vec3 uRingNormal;
      uniform vec3 uPlanetCenter;
      uniform float uPlanetRadius;
      void main() {
        #include <logdepthbuf_fragment>
        vec4 tex = texture2D(uMap, vec2(vUv.x, 0.5));
        vec3 L = normalize(-vWorldPos);
        vec3 V = normalize(cameraPosition - vWorldPos);
        // planet shadow: does the ray toward the Sun hit the planet?
        vec3 oc = vWorldPos - uPlanetCenter;
        float b = dot(oc, L);
        float h = b * b - (dot(oc, oc) - uPlanetRadius * uPlanetRadius);
        float shadow = (h > 0.0 && b < 0.0) ? 0.1 : 1.0;
        // the unlit face of the rings only glows with light scattered through them
        float sameSide = dot(uRingNormal, L) * dot(uRingNormal, V);
        float lit = sameSide >= 0.0 ? 1.0 : 0.45;
        gl_FragColor = vec4(tex.rgb * shadow * lit * 1.1, tex.a * 0.95);
        ${FRAG_TAIL}
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}
