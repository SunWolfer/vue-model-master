const fireVertexShader = `
attribute vec4 orientation;
attribute vec3 offset;
attribute vec2 scale;
attribute float life;
attribute float random;

varying vec2 vUv;
varying float vRandom;
varying float vAlpha;

float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

// From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm
float pcurve(float x, float a, float b) {
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}

void main() {
    vUv = uv;
    vRandom = random;

    vAlpha = pcurve(life, 1.0, 2.0);

    vec3 pos = position;

    pos.xy *= scale * vec2(range(pow(life, 1.5), 0.0, 1.0, 1.0, 0.6), range(pow(life, 1.5), 0.0, 1.0, 0.6, 1.2));

    vec4 or = orientation;
    vec3 vcV = cross(or.xyz, pos);
    pos = vcV * (2.0 * or.w) + (cross(or.xyz, vcV) * 2.0 + pos);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fireFragmentShader = `
uniform sampler2D uMap;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

varying vec2 vUv;
varying float vAlpha;
varying float vRandom;

void main() {
    vec2 uv = vUv;

    float spriteLength = 10.0;
    uv.x /= spriteLength;
    float spriteIndex = mod(uTime * 0.1 + vRandom * 2.0, 1.0);
    uv.x += floor(spriteIndex * spriteLength) / spriteLength;

    vec4 map = texture2D(uMap, uv);

    gl_FragColor.rgb = mix(uColor2, uColor1, map.r);
    gl_FragColor.a = vAlpha * map.a;
}
`

const embersVertexShader = `
attribute float size;
attribute float life;
attribute vec3 offset;

varying float vAlpha;

// From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm
float impulse(float k, float x) {
    float h = k * x;
    return h * exp(1.0 - h);
}

void main() {
    vAlpha = impulse(6.28, life);

    vec3 pos = position;
    pos += offset * vec3(life * 0.7 + 0.3, life * 0.9 + 0.1, life * 0.7 + 0.3);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (80.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}
`

const embersFragmentShader = `
uniform sampler2D uMap;
uniform vec3 uColor;

varying float vAlpha;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 mask = texture2D(uMap, uv);

    gl_FragColor.rgb = uColor;
    gl_FragColor.a = mask.a * vAlpha * 0.8;
}
`

const hazeVertexShader = `
attribute vec3 base;
attribute vec3 offset;
attribute vec4 orientation;
attribute vec2 scale;
attribute float life;

varying float vAlpha;
varying vec2 vUv;

float impulse(float k, float x) {
    float h = k * x;
    return h * exp(1.0 - h);
}

float pcurve(float x, float a, float b) {
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}

void main() {
    vUv = uv;
    vAlpha = pcurve(life, 1.0, 2.0);

    vec3 pos = position;

    pos.xy *= scale * (life * 0.7 + 0.3);

    vec4 or = orientation;
    vec3 vcV = cross(or.xyz, pos);
    pos = vcV * (2.0 * or.w) + (cross(or.xyz, vcV) * 2.0 + pos);

    pos += base;
    pos += offset * vec3(life * 0.7 + 0.3, life * 0.9 + 0.1, life * 0.7 + 0.3);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const hazeFragmentShader = `
uniform sampler2D uMap;
uniform sampler2D uMask;
uniform vec2 uResolution;

varying float vAlpha;
varying vec2 vUv;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 mask = texture2D(uMask, vUv).ra - vec2(0.5);
    uv -= mask * 0.1;
    vec4 tex = texture2D(uMap, uv);
    gl_FragColor.rgb = tex.rgb;
    gl_FragColor.a = vAlpha * 0.5;
}
`

export {
	fireVertexShader,
	fireFragmentShader,
	embersVertexShader,
	embersFragmentShader,
	hazeVertexShader,
	hazeFragmentShader,
}
