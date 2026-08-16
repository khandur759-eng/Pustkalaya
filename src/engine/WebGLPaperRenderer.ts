import { MeshGeometry, CurlParams, TurnDirection, QualityConfig, BookSpreadState } from './types';
import { createGridGeometry, deformMesh, DeformationResult } from './PageCurlPhysics';
import { PageTextureManager } from './PageTextureManager';

const VERTEX_SHADER_SRC = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;

uniform mat4 u_mvp;
uniform mat4 u_model;

varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 v_worldPos;

void main() {
  vec4 worldPos = u_model * vec4(a_position, 1.0);
  v_worldPos = worldPos.xyz;
  v_normal = normalize((u_model * vec4(a_normal, 0.0)).xyz);
  v_uv = a_uv;
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;

uniform sampler2D u_frontTexture;
uniform sampler2D u_backTexture;
uniform bool u_isTurning;
uniform bool u_isLeftPage;
uniform float u_gutterShadow;
uniform float u_castShadow;
uniform vec3 u_lightDir;

varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 v_worldPos;

void main() {
  vec3 normal = normalize(v_normal);
  bool isFront = normal.z >= -0.05;

  vec4 texColor;
  if (isFront) {
    texColor = texture2D(u_frontTexture, v_uv);
  } else {
    // Backside UV has flipped X coordinate so ink reads correctly from left-to-right
    vec2 backUV = vec2(1.0 - v_uv.x, v_uv.y);
    texColor = texture2D(u_backTexture, backUV);
    normal = -normal; // Invert normal for back lighting
  }

  // Directional + Ambient Lighting Model
  vec3 lightDir = normalize(u_lightDir);
  float diff = max(dot(normal, lightDir), 0.0);
  float ambient = 0.78;
  float lighting = ambient + diff * 0.22;

  // Rim / Apex highlight on curved paper crest
  float rim = max(0.0, 1.0 - abs(normal.z));
  lighting += rim * 0.06;

  // Spine gutter shading
  float distToSpine = u_isLeftPage ? (1.0 - v_uv.x) : v_uv.x;
  float gutter = smoothstep(0.0, 0.14, distToSpine);
  float spineDarken = mix(0.74, 1.0, gutter);

  // Dynamic cast shadow attenuation from turning page above
  float shadowAtten = 1.0 - clamp(u_castShadow, 0.0, 1.0) * 0.38;

  vec3 finalColor = texColor.rgb * lighting * spineDarken * shadowAtten;

  gl_FragColor = vec4(finalColor, texColor.a);
}
`;

export class WebGLPaperRenderer {
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private flatBaseMesh: MeshGeometry;
  private turningMesh: MeshGeometry;

  // Buffers
  private posBuffer: WebGLBuffer | null = null;
  private normBuffer: WebGLBuffer | null = null;
  private uvBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  // Uniform locations
  private uMvpLoc: WebGLUniformLocation | null = null;
  private uModelLoc: WebGLUniformLocation | null = null;
  private uFrontTexLoc: WebGLUniformLocation | null = null;
  private uBackTexLoc: WebGLUniformLocation | null = null;
  private uIsTurningLoc: WebGLUniformLocation | null = null;
  private uIsLeftPageLoc: WebGLUniformLocation | null = null;
  private uGutterShadowLoc: WebGLUniformLocation | null = null;
  private uCastShadowLoc: WebGLUniformLocation | null = null;
  private uLightDirLoc: WebGLUniformLocation | null = null;

  // Attributes
  private aPosLoc: number = -1;
  private aNormLoc: number = -1;
  private aUvLoc: number = -1;

  private quality: QualityConfig;

  constructor(canvas: HTMLCanvasElement, quality: QualityConfig) {
    this.canvas = canvas;
    this.quality = quality;

    this.flatBaseMesh = createGridGeometry(quality.gridX, quality.gridY);
    this.turningMesh = createGridGeometry(quality.gridX, quality.gridY);

    this.initGL();
  }

  public getGL() {
    return this.gl;
  }

  public setQuality(quality: QualityConfig) {
    this.quality = quality;
    this.flatBaseMesh = createGridGeometry(quality.gridX, quality.gridY);
    this.turningMesh = createGridGeometry(quality.gridX, quality.gridY);
    this.updateIndexBuffer();
    this.updateUVBuffer();
  }

  private initGL(): boolean {
    const gl = (this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: true,
      preserveDrawingBuffer: false,
    }) ||
      this.canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        depth: true,
      })) as WebGLRenderingContext | WebGL2RenderingContext | null;

    if (!gl) {
      console.warn('WebGL initialization failed, falling back.');
      return false;
    }

    this.gl = gl;

    // Create Shaders
    const vShader = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fShader = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vShader || !fShader) return false;

    const prog = gl.createProgram();
    if (!prog) return false;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Shader linking error:', gl.getProgramInfoLog(prog));
      return false;
    }

    this.program = prog;

    // Uniforms
    this.uMvpLoc = gl.getUniformLocation(prog, 'u_mvp');
    this.uModelLoc = gl.getUniformLocation(prog, 'u_model');
    this.uFrontTexLoc = gl.getUniformLocation(prog, 'u_frontTexture');
    this.uBackTexLoc = gl.getUniformLocation(prog, 'u_backTexture');
    this.uIsTurningLoc = gl.getUniformLocation(prog, 'u_isTurning');
    this.uIsLeftPageLoc = gl.getUniformLocation(prog, 'u_isLeftPage');
    this.uGutterShadowLoc = gl.getUniformLocation(prog, 'u_gutterShadow');
    this.uCastShadowLoc = gl.getUniformLocation(prog, 'u_castShadow');
    this.uLightDirLoc = gl.getUniformLocation(prog, 'u_lightDir');

    // Attributes
    this.aPosLoc = gl.getAttribLocation(prog, 'a_position');
    this.aNormLoc = gl.getAttribLocation(prog, 'a_normal');
    this.aUvLoc = gl.getAttribLocation(prog, 'a_uv');

    // Create Buffers
    this.posBuffer = gl.createBuffer();
    this.normBuffer = gl.createBuffer();
    this.uvBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    this.updateUVBuffer();
    this.updateIndexBuffer();

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  }

  private updateUVBuffer() {
    if (!this.gl || !this.uvBuffer) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.flatBaseMesh.uvs, gl.STATIC_DRAW);
  }

  private updateIndexBuffer() {
    if (!this.gl || !this.indexBuffer) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.flatBaseMesh.indices, gl.STATIC_DRAW);
  }

  private compileShader(type: number, src: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Renders the complete book scene.
   */
  public renderScene(
    spreadState: BookSpreadState,
    curlParams: CurlParams,
    textureMgr: PageTextureManager,
    viewportW: number,
    viewportH: number
  ): { maxZ: number; creasePoints: [number, number, number, number]; deformation?: DeformationResult } {
    const gl = this.gl;
    if (!gl || !this.program) {
      return { maxZ: 0, creasePoints: [1, 0, 1, 1] };
    }

    gl.viewport(0, 0, viewportW, viewportH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);

    // Light source from upper right
    gl.uniform3f(this.uLightDirLoc, 0.4, -0.6, 0.8);

    const isSpread = spreadState.isSpreadMode;
    const pageAspect = viewportH / Math.max(1, isSpread ? viewportW * 0.5 : viewportW);

    // Calculate Page Deformation
    const deformation = deformMesh(
      this.flatBaseMesh,
      this.turningMesh,
      curlParams,
      this.quality,
      pageAspect
    );
    const { maxZ, creasePoints, shadowCenter } = deformation;

    // Construct Camera Matrix (Perspective)
    const fov = (45 * Math.PI) / 180;
    const aspect = viewportW / Math.max(1, viewportH);
    const near = 0.1;
    const far = 100.0;
    const projMat = this.createPerspectiveMatrix(fov, aspect, near, far);

    // Camera view looking at book center
    const viewMat = this.createLookAtMatrix([0, 0, 2.4], [0, 0, 0], [0, 1, 0]);
    const vpMat = this.multiplyMatrices(projMat, viewMat);

    // Page scale in world units
    const pageW = isSpread ? 0.96 : 0.88;
    const pageH = pageW * pageAspect * 0.92;

    // --- PASS 1: Render Stationary Left Page ---
    const underneathLeftPage = curlParams.progress > 0.01 && curlParams.direction === 'backward'
      ? spreadState.nextLeftPageNumber
      : spreadState.leftPageNumber;

    if (isSpread && underneathLeftPage > 0) {
      const leftTex = textureMgr.getTexture(underneathLeftPage);
      if (leftTex.glTexture) {
        const leftModel = this.createModelMatrix(-pageW, -pageH * 0.5, 0.0, pageW, pageH, 1.0);
        const leftMvp = this.multiplyMatrices(vpMat, leftModel);

        gl.uniformMatrix4fv(this.uMvpLoc, false, leftMvp);
        gl.uniformMatrix4fv(this.uModelLoc, false, leftModel);
        gl.uniform1i(this.uIsTurningLoc, 0);
        gl.uniform1i(this.uIsLeftPageLoc, 1);
        gl.uniform1f(this.uGutterShadowLoc, 1.0);
        gl.uniform1f(this.uCastShadowLoc, curlParams.progress > 0.05 && curlParams.direction === 'backward' ? shadowCenter.intensity : 0.0);

        this.bindTexture(gl.TEXTURE0, leftTex.glTexture, this.uFrontTexLoc, 0);
        this.renderMesh(this.flatBaseMesh);
      }
    }

    // --- PASS 2: Render Stationary Right Page (Underneath the turning page) ---
    const underneathRightPage = curlParams.progress > 0.01 && curlParams.direction === 'forward'
      ? spreadState.nextRightPageNumber
      : spreadState.rightPageNumber;

    if (underneathRightPage > 0) {
      const rightTex = textureMgr.getTexture(underneathRightPage);
      if (rightTex.glTexture) {
        const rightModel = this.createModelMatrix(isSpread ? 0.0 : -pageW * 0.5, -pageH * 0.5, 0.0, pageW, pageH, 1.0);
        const rightMvp = this.multiplyMatrices(vpMat, rightModel);

        gl.uniformMatrix4fv(this.uMvpLoc, false, rightMvp);
        gl.uniformMatrix4fv(this.uModelLoc, false, rightModel);
        gl.uniform1i(this.uIsTurningLoc, 0);
        gl.uniform1i(this.uIsLeftPageLoc, 0);
        gl.uniform1f(this.uGutterShadowLoc, 1.0);
        // Cast shadow on right page if turning forward
        gl.uniform1f(this.uCastShadowLoc, curlParams.progress > 0.05 && curlParams.direction === 'forward' ? shadowCenter.intensity : 0.0);

        this.bindTexture(gl.TEXTURE0, rightTex.glTexture, this.uFrontTexLoc, 0);
        this.renderMesh(this.flatBaseMesh);
      }
    }

    // --- PASS 3: Render Deformable Turning Page ---
    if (curlParams.progress > 0.001) {
      const isForward = curlParams.direction === 'forward';
      const frontPageNum = isForward ? spreadState.rightPageNumber : spreadState.leftPageNumber;
      const backPageNum = isForward
        ? (spreadState.rightPageNumber + 1 <= spreadState.totalPages ? spreadState.rightPageNumber + 1 : 0)
        : (spreadState.leftPageNumber > 1 ? spreadState.leftPageNumber - 1 : 1);

      if (frontPageNum > 0) {
        const frontTex = textureMgr.getTexture(frontPageNum);
        const backTex = backPageNum > 0 ? textureMgr.getTexture(backPageNum) : frontTex;

        if (frontTex.glTexture && backTex.glTexture) {
          // Base translation for the turning page (spine is anchored at origin X=0)
          const turnX = isSpread ? 0.0 : -pageW * 0.5;
          const turnModel = this.createModelMatrix(turnX, -pageH * 0.5, 0.002, pageW, pageH, 1.0);
          const turnMvp = this.multiplyMatrices(vpMat, turnModel);

          gl.uniformMatrix4fv(this.uMvpLoc, false, turnMvp);
          gl.uniformMatrix4fv(this.uModelLoc, false, turnModel);
          gl.uniform1i(this.uIsTurningLoc, 1);
          gl.uniform1i(this.uIsLeftPageLoc, isForward ? 0 : 1);
          gl.uniform1f(this.uGutterShadowLoc, 0.9);
          gl.uniform1f(this.uCastShadowLoc, 0.0);

          this.bindTexture(gl.TEXTURE0, frontTex.glTexture, this.uFrontTexLoc, 0);
          this.bindTexture(gl.TEXTURE1, backTex.glTexture, this.uBackTexLoc, 1);

          this.renderMesh(this.turningMesh);
        }
      }
    }

    return { maxZ, creasePoints, deformation };
  }

  private renderMesh(mesh: MeshGeometry) {
    if (!this.gl || !this.posBuffer || !this.normBuffer || !this.uvBuffer || !this.indexBuffer) return;
    const gl = this.gl;

    // Upload vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.aPosLoc);
    gl.vertexAttribPointer(this.aPosLoc, 3, gl.FLOAT, false, 0, 0);

    // Upload normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.aNormLoc);
    gl.vertexAttribPointer(this.aNormLoc, 3, gl.FLOAT, false, 0, 0);

    // UVs
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.enableVertexAttribArray(this.aUvLoc);
    gl.vertexAttribPointer(this.aUvLoc, 2, gl.FLOAT, false, 0, 0);

    // Draw Triangles
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  private bindTexture(unit: number, texture: WebGLTexture, uniformLoc: WebGLUniformLocation | null, unitIdx: number) {
    if (!this.gl || !uniformLoc) return;
    this.gl.activeTexture(unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(uniformLoc, unitIdx);
  }

  // --- Matrix Math Helpers (No large external library needed) ---
  private createPerspectiveMatrix(fovy: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ]);
  }

  private createLookAtMatrix(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): Float32Array {
    let z0 = eye[0] - target[0];
    let z1 = eye[1] - target[1];
    let z2 = eye[2] - target[2];
    const len = 1 / Math.hypot(z0, z1, z2);
    z0 *= len; z1 *= len; z2 *= len;

    let x0 = up[1] * z2 - up[2] * z1;
    let x1 = up[2] * z0 - up[0] * z2;
    let x2 = up[0] * z1 - up[1] * z0;
    const xLen = 1 / Math.hypot(x0, x1, x2);
    x0 *= xLen; x1 *= xLen; x2 *= xLen;

    const y0 = z1 * x2 - z2 * x1;
    const y1 = z2 * x0 - z0 * x2;
    const y2 = z0 * x1 - z1 * x0;

    return new Float32Array([
      x0, y0, z0, 0,
      x1, y1, z1, 0,
      x2, y2, z2, 0,
      -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
      -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
      -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]),
      1,
    ]);
  }

  private createModelMatrix(tx: number, ty: number, tz: number, sx: number, sy: number, sz: number): Float32Array {
    return new Float32Array([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      tx, ty, tz, 1,
    ]);
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const out = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[k * 4 + i] * b[j * 4 + k];
        }
        out[j * 4 + i] = sum;
      }
    }
    return out;
  }

  public dispose() {
    if (!this.gl) return;
    const gl = this.gl;
    if (this.posBuffer) gl.deleteBuffer(this.posBuffer);
    if (this.normBuffer) gl.deleteBuffer(this.normBuffer);
    if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    if (this.program) gl.deleteProgram(this.program);
    this.gl = null;
  }
}
