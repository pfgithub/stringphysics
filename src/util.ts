export type Vec2 = [number, number];
export type Line = [Vec2, Vec2];
export type Triangle = [Vec2, Vec2, Vec2];
export type Poly = Vec2[];

export function pointInsideTriangle(point: Vec2, triangle: Triangle): boolean {
    const [p1, p2, p3] = triangle;
    const [px, py] = point;

    if (px === p1[0] && py === p1[1] || px === p2[0] && py === p2[1] || px === p3[0] && py === p3[1]) return false; // touching corner, doesn't count

    const s1 = (p2[0] - p1[0]) * (py - p1[1]) - (p2[1] - p1[1]) * (px - p1[0]);
    const s2 = (p3[0] - p2[0]) * (py - p2[1]) - (p3[1] - p2[1]) * (px - p2[0]);
    const s3 = (p1[0] - p3[0]) * (py - p3[1]) - (p1[1] - p3[1]) * (px - p3[0]);

    const allPositive = s1 >= 0 && s2 >= 0 && s3 >= 0;
    const allNegative = s1 <= 0 && s2 <= 0 && s3 <= 0;

    return allPositive || allNegative;
}


// Helper function to find the orientation of the ordered triplet (p, q, r).
// The function returns one of the following values:
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// -1 --> Counterclockwise
function orientation(p: Vec2, q: Vec2, r: Vec2): number {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    return Math.sign(val);
}

/**
 * Determines if two line segments have a proper intersection.
 * A proper intersection means the lines cross each other at a single point
 * that is not an endpoint of either line.
 * This function returns false for collinear, overlapping, or endpoint-touching segments.
 * @param line1 The first line segment, defined by two points.
 * @param line2 The second line segment, defined by two points.
 * @returns True if the line segments have a proper intersection, false otherwise.
 */
export function lineIntersectsLine(line1: Line, line2: Line): boolean {
    const [p1, q1] = line1;
    const [p2, q2] = line2;

    // Find the four orientations needed.
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // A proper intersection exists if the endpoints of each line are on
    // strictly opposite sides of the other line.
    // This is the case if the orientations `(p1,q1,p2)` and `(p1,q1,q2)`
    // are opposite, and `(p2,q2,p1)` and `(p2,q2,q1)` are also opposite.
    // A simple way to check for opposite non-zero signs is that their product is negative.
    if (o1 * o2 < 0 && o3 * o4 < 0) {
        return true;
    }

    // Otherwise, they do not have a proper intersection.
    return false;
}