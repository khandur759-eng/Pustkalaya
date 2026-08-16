export type GestureState =
  | 'IDLE'
  | 'TOUCH_START'
  | 'GRABBED'
  | 'DRAGGING'
  | 'RELEASED'
  | 'SETTLING_FORWARD'
  | 'SETTLING_BACKWARD'
  | 'COMPLETED'
  | 'CANCELLED';

export type TurnDirection = 'forward' | 'backward';

export type GrabEdge = 'top' | 'middle' | 'bottom';

export type GrabPosition = {
  x: number; // 0 to 1 relative to page (0=spine, 1=free edge)
  y: number; // 0 to 1 relative to page (0=top, 1=bottom)
  edge: GrabEdge;
};

export type QualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface QualityConfig {
  gridX: number; // mesh columns
  gridY: number; // mesh rows
  shadowSamples: number;
  dprClamp: number;
  enableSpecular: boolean;
  enableSecondaryBend: boolean;
}

export interface CurlParams {
  progress: number; // 0 (flat at start) to 1 (flat at destination)
  grabPoint: { x: number; y: number }; // normalized initial grab
  currentPoint: { x: number; y: number }; // normalized current finger/curl position
  direction: TurnDirection;
  curlAngle: number; // angle of crease line in radians
  curlRadius: number; // radius of cylinder curl
  spineTension: number; // anchor factor near spine
  foldOffset: number; // distance from origin to fold line
}

export interface VertexData {
  position: [number, number, number]; // x, y, z
  normal: [number, number, number]; // nx, ny, nz
  uv: [number, number]; // u, v
  isBack: number; // 0 = front, 1 = back
}

export interface MeshGeometry {
  vertices: Float32Array; // 3 floats per vertex (x,y,z)
  normals: Float32Array; // 3 floats per vertex (nx,ny,nz)
  uvs: Float32Array; // 2 floats per vertex (u,v)
  indices: Uint16Array; // triangle indices
  vertexCount: number;
  indexCount: number;
}

export interface PageTextureInfo {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  glTexture: WebGLTexture | null;
  width: number;
  height: number;
  aspectRatio: number;
  isReady: boolean;
  isDirty: boolean;
}

export interface BookSpreadState {
  currentLogicalPage: number;
  totalPages: number;
  leftPageNumber: number; // 0 if none
  rightPageNumber: number; // 0 if none
  turningPageNumber: number; // page being turned
  turningBackPageNumber: number; // backside of turning page
  nextLeftPageNumber: number; // page revealed under turning page
  nextRightPageNumber: number;
  isSpreadMode: boolean;
}

export interface EngineDebugInfo {
  fps: number;
  frameTimeMs: number;
  renderMode: 'webgl2' | 'webgl' | 'canvas2d';
  quality: QualityLevel;
  meshRes: string;
  gestureState: GestureState;
  turnDirection: TurnDirection | null;
  progress: number;
  velocity: number;
  curlRadius: number;
  curlAngleDeg: number;
  grabPoint: { x: number; y: number };
  currentPointer: { x: number; y: number };
  creaseLine: { x1: number; y1: number; x2: number; y2: number };
  texturesLoaded: number;
  stretchError: number;
  spineError: number;
  maxDisplacement: number;
  triangleDistortion: number;
  invalidVertexCount: number;
  meshHealthStatus: 'valid' | 'warning' | 'invalid';
}
