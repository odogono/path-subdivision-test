import { useContext, useEffect, useRef } from "preact/hooks";
import { parse } from "./util/parse_svg";
import {
  dividePoly,
  kochPoly,
  isPointEqual,
  Point,
  Poly,
  toPoly
} from "./util/poly";
import { Context as AppContext } from "./store";

export function Canvas() {
  const { iterations, seed, variation } = useContext(AppContext);

  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);

    const path = "M64 256 h 384 v 128 Z";
    const poly = toPoly(parse(path), seed);
    const polyOp = dividePoly;

    let divPoly = poly;

    for (let ii = 0; ii < iterations; ii++) {
      divPoly = polyOp(divPoly, variation, seed);
    }

    // let divPoly = polyOp(poly, variation);
    // divPoly = polyOp(divPoly);
    // divPoly = polyOp(divPoly);
    // divPoly = polyOp(divPoly);
    // divPoly = polyOp(divPoly);
    // divPoly = polyOp(divPoly);

    // console.log(parse(path), poly, divPoly);

    ctx.lineWidth = 1;

    renderPoly(ctx, divPoly);

    // const p = new Path2D("M64 256 h 384 v 128 z");
    // ctx.stroke(p);
  }, [iterations, variation, seed]);
  return <canvas width={512} height={512} ref={canvasRef}></canvas>;
}

function renderPoly(ctx: CanvasRenderingContext2D, poly: Poly) {
  ctx.beginPath();
  ctx.strokeStyle = "#000";
  const p: Point = [0, 0];

  for (const [i0, i1] of poly.segments) {
    const p0 = poly.pointList[i0];
    const p1 = poly.pointList[i1];

    if (!isPointEqual(p, p0)) {
      ctx.moveTo(p0[0], p0[1]);
      // ctx.rect(p0[0] - 2, p0[1] - 2, 4, 4);
    }

    ctx.lineTo(p1[0], p1[1]);
  }

  ctx.stroke();

  // ctx.beginPath();
  // ctx.strokeStyle = "#F00";
  // for (const pp of poly.pointList) {
  //   ctx.rect(pp[0] - 2, pp[1] - 2, 4, 4);
  // }
  // ctx.stroke();
}
