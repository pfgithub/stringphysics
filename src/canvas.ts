import { lineIntersectsLine, pointInsideTriangle, type Line, type Poly, type Triangle, type Vec2 } from "./util";

type Segment = {pos: Vec2}; // we could put tension too for elastic (or store that as true_start, true_end)
type State = {
    segments: Segment[],
    sceneColliders: Poly[],
    scale: number,
};

export function setupCanvas(canvas: HTMLCanvasElement): {cleanup: () => void} {
    const state: State = {
        segments: [
            {pos: [0.5, 0.1]},
            {pos: [0.1, 0.2]},
        ],
        sceneColliders: [
            [
                [0.2, 0.2],
                [0.2, 0.6],
                [0.6, 0.6],
                [0.6, 0.2],
            ],
        ],
        scale: 400,
    };
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;

    moveFinalPoint(state, [0.1, 0.3]);
    moveFinalPoint(state, [0.1, 0.2]);
    renderScene(state, ctx);

    const move = (e: MouseEvent) => {
        const bcr = canvas.getBoundingClientRect();
        const finalX = (e.clientX - bcr.x) / bcr.height;
        const finalY = (e.clientY - bcr.y) / bcr.width;
        moveFinalPoint(state, [finalX, finalY]);
        renderScene(state, ctx);
    };
    const onmousedown = (e: MouseEvent) => {
        move(e);
        document.addEventListener("mousemove", onmousemove);
        document.addEventListener("mouseup", onmouseup);
    };
    const onmousemove = (e: MouseEvent) => {
        move(e);
    };
    const onmouseup = (e: MouseEvent) => {
        document.removeEventListener("mousemove", onmousemove);
        document.removeEventListener("mouseup", onmouseup);
        move(e);
    };
    canvas.addEventListener("mousedown", onmousedown);

    return {cleanup() {
        canvas.removeEventListener("mousedown", onmousedown);
        document.removeEventListener("mousemove", onmousemove);
        document.removeEventListener("mouseup", onmouseup);
    }};
}
function useSave(ctx: CanvasRenderingContext2D): {[Symbol.dispose]: () => void} {
    ctx.save();
    return {[Symbol.dispose]: () => ctx.restore()};
}
function renderScene(state: State, ctx: CanvasRenderingContext2D) {
    using _ = useSave(ctx);
    ctx.scale(state.scale, state.scale);
    ctx.fillStyle = "#ddd";
    ctx.fillRect(0, 0, 1, 1);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.01;
    for (const collider of state.sceneColliders) {
        ctx.beginPath();
        for (let i = 0; i < collider.length; i++) {
            const [x, y] = collider[i]!;
            if (i === 0) {
                ctx.moveTo(x, y);
            }else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.strokeStyle = "#F00";
    ctx.beginPath();
    for (const segment of state.segments) {
        if (segment === state.segments[0]) {
            ctx.moveTo(segment.pos[0], segment.pos[1]);
        }else{
            ctx.lineTo(segment.pos[0], segment.pos[1]);
        }
    }
    ctx.stroke();
}
function moveFinalPoint(state: State, t: Vec2) {
    const a: Vec2 | undefined = state.segments[state.segments.length - 3]?.pos;
    const s: Vec2 = state.segments[state.segments.length - 2]!.pos;
    const f: Vec2 = state.segments[state.segments.length - 1]!.pos;

    const triangle: Triangle = [s, f, t];

    let hitPoint: Vec2 | null = null;
    for (const collider of state.sceneColliders) {
        for(const point of collider) {
            if (pointInsideTriangle(point, triangle)) {
                if (hitPoint != null) throw new Error("todo need to sort all points in the scene by angle first");
                hitPoint = point;
            }
        }
    }

    if (hitPoint) {
        // split, then call moveFinalPoint again.
        state.segments.pop();
        state.segments.push({pos: hitPoint});
        state.segments.push({pos: t});
    } else if (a) {
        const revertLine: Line = [a, t];
        let hit = false;
        for (const collider of state.sceneColliders) {
            for (let i = 0; i < collider.length; i += 1) {
                const p0 = collider[i]!;
                const p1 = collider[(i + 1) % collider.length]!;
                if (lineIntersectsLine(revertLine, [p0, p1])) {
                    hit = true;
                }
            }
        }
        if (hit) {
            // just move
            state.segments.pop();
            state.segments.push({pos: t});
        } else {
            // revert
            state.segments.pop();
            state.segments.pop();
            state.segments.push({pos: t});
        }
    } else {
        state.segments.pop();
        state.segments.push({pos: t});
    }

    // given the last three points [?a, s, f] (f is last) and new point [t]
    // does the triangle SFT contain any vertices of a scene collider?
    //     yes ->
    //        circle logic. have to start with the first vertex and go clockwise/counterclockwise now
    //        first vertex is determined by angles. which one has the least angle from the orig. line
    //     no ->
    //        a? does the line AT collide with any scene colliders?
    //            yes -> done [a, s, t]
    //            no -> done [a, t]

}
