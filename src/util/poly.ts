export type Coord = number;
export type PointIndex = number;
export type Point = [Coord, Coord];
export type Segment = [PointIndex, PointIndex];

export interface Poly {
  pointList: Point[];
  segments: Segment[];
  seed: number;
}

function clonePoints(pts: Point[] = []): Point[] {
  return pts.map((pt) => [...pt]);
}
function cloneSegments(segs: Segment[] = []): Segment[] {
  return segs.map((s) => [...s]);
}

export function createPoly(poly?: Poly): Poly {
  const pointList = clonePoints(poly?.pointList);
  const segments = cloneSegments(poly?.segments);
  const seed = poly?.seed ?? 1974;

  return {
    pointList,
    segments,
    seed
  };
}

export function isPointEqual(p1: Point, p2: Point) {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

export function isSegmentEqual(s1: Segment, s2: Segment) {
  return s1[0] === s2[0] && s1[1] === s2[1];
}

function removeSegment(poly: Poly, seg: Segment) {
  const idx = poly.segments.findIndex((s) => isSegmentEqual(s, seg));
  if (idx !== -1) {
    poly.segments.splice(idx, 1);
  }
  return poly;
}

export function toPoly(path: any, seed: number): Poly {
  let poly = createPoly();
  poly.seed = seed;
  // let pointList: Point[] = [];
  // let segments: Segment[] = [];

  let pt: Point = [0, 0];

  for (const cmd of path) {
    const [op, x, y] = cmd;
    // console.log("cmd", cmd);
    if (op === "M") {
      pt[0] = x;
      pt[1] = y;
    } else if (op === "h") {
      pt[0] += x;
      poly.segments.push([poly.pointList.length - 1, poly.pointList.length]);
    } else if (op === "v") {
      pt[1] += x;
      poly.segments.push([poly.pointList.length - 1, poly.pointList.length]);
    } else if (op === "Z") {
      break;
    }

    poly.pointList.push([...pt]);
  }

  return poly;
}

function pointAdd(pt0: Point, pt1: Point): Point {
  return [pt0[0] + pt1[0], pt0[1] + pt1[1]];
}

function pointSub(pt0: Point, pt1: Point): Point {
  return [pt0[0] - pt1[0], pt0[1] - pt1[1]];
}

function pointMagnitude(pt: Point): number {
  return Math.sqrt(pt[0] * pt[0] + pt[1] * pt[1]);
}

function pointRotate(pt: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = pt[0] * cos - pt[1] * sin;
  const y = pt[0] * sin + pt[1] * cos;
  return [x, y];
}

function pointNormalise(pt: Point, len: number = 1): Point {
  const mag = pointMagnitude(pt);
  if (mag === 0) {
    return [0, 0];
  }
  return [(pt[0] / mag) * len, (pt[1] / mag) * len];
}

function addPointList(pointList: Point[], pt: Point): [Point[], number] {
  if (pointList.length === 0) {
    return [[[...pt]], 0];
  }

  for (let ii = 0; ii < pointList.length; ii++) {
    if (isPointEqual(pt, pointList[ii])) {
      return [pointList, ii];
    }
  }

  return [[...pointList, [...pt]], pointList.length];
}

const ANG_TO_RAD = Math.PI / 180;

function randRange(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

// mulberry32 - an actual high quality 32-bit generator
const mb32 = (seed: number) => (nxt: number) =>
  ((seed = (seed + 1831565813) | 0),
  (nxt = Math.imul(seed ^ (seed >>> 15), 1 | seed)),
  (nxt = (nxt + Math.imul(nxt ^ (nxt >>> 7), 61 | nxt)) ^ nxt),
  (nxt ^ (nxt >>> 14)) >>> 0) /
  2 ** 32;

function pseudoRandomRange(rng: Function, nxt: number, lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

export function dividePoly(
  poly: Poly,
  range: number = 20,
  seed: number = 1974
): Poly {
  let pointList: Point[] = [];
  const segments: Segment[] = [];
  let idx0 = 0,
    idx1 = 0,
    idx2 = 0;

  let rng = mb32(poly.seed);
  let rnd = rng(100);

  for (const [i0, i1] of poly.segments) {
    const p0 = poly.pointList[i0];
    const p1 = poly.pointList[i1];

    // find midpoint
    // const ang = Math.random() * 40 + -20;
    // const range = 10;
    rnd = rng(rnd);
    const randomRange = -range + rnd * (range - -range);
    let npt = pointSub(p1, p0);
    const mag = pointMagnitude(npt);
    npt = pointNormalise(npt, mag / 2);
    npt = pointRotate(npt, randomRange * ANG_TO_RAD);
    let mid = pointAdd(p0, npt);

    [pointList, idx0] = addPointList(pointList, p0);

    [pointList, idx1] = addPointList(pointList, mid);

    [pointList, idx2] = addPointList(pointList, p1);

    segments.push([idx0, idx1]);
    segments.push([idx1, idx2]);
  }

  return { ...poly, pointList, segments };
}

function lineToPoly(poly: Poly, from: Point, to: Point): Poly {
  let pointList = poly.pointList;
  let segments = poly.segments;
  let idx0 = 0,
    idx1 = 0;

  [pointList, idx0] = addPointList(pointList, from);
  [pointList, idx1] = addPointList(pointList, to);

  segments.push([idx0, idx1]);

  return { ...poly, pointList, segments };
}

interface Cursor {
  vector: Point;
  lastPt: Point;
  lastIdx: number;
  pointList: Point[];
  segments: Segment[];
}

function draw(cursor: Cursor, angle: number = 0) {
  let { pointList, segments, lastIdx } = cursor;
  let idx = 0;
  let pt: Point = cursor.vector;
  if (angle !== 0) {
    pt = pointRotate(cursor.vector, angle * ANG_TO_RAD);
  }
  pt = pointAdd(cursor.lastPt, pt);
  [pointList, idx] = addPointList(pointList, pt);
  segments.push([lastIdx, idx]);
  return { ...cursor, pointList, segments, lastIdx: idx, lastPt: pt };
}

export function kochPoly(poly: Poly): Poly {
  let pointList: Point[] = [];
  let segments: Segment[] = [];
  let idx0 = 0,
    idx1 = 0;

  for (const [i0, i1] of poly.segments) {
    const p0 = poly.pointList[i0];
    const p1 = poly.pointList[i1];

    let npt = pointSub(p1, p0);
    const mag = pointMagnitude(npt);
    npt = pointNormalise(npt, mag / 3);

    [pointList, idx0] = addPointList(pointList, p0);

    let cursor: Cursor = {
      vector: npt,
      lastPt: p0,
      lastIdx: idx0,
      pointList,
      segments
    };

    cursor = draw(cursor);
    cursor = draw(cursor, -60);
    cursor = draw(cursor, 60);
    cursor = draw(cursor);

    // cursor = draw(cursor);
    // cursor = draw(cursor, -90);
    // cursor = draw(cursor);
    // cursor = draw(cursor, 90);
    // cursor = draw(cursor);

    // cursor = draw(cursor, randRange(-30, 30));
    // cursor = draw(cursor, randRange(-30, 30));
    // cursor = draw(cursor, randRange(-30, 30));
    // cursor = draw(cursor);

    pointList = cursor.pointList;
    segments = cursor.segments;
  }

  return { ...poly, pointList, segments };
}
