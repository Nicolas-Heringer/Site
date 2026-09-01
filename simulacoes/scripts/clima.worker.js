'use strict';

// =============================================================================
// Autor: Nicolas Heringer
// Simulação: Tesselação de Voronoi e Relaxamento de Lloyd na Esfera (SCVT)
// Módulo: Web Worker (Kernel Topológico de Alto Desempenho & Buffers Nativos)
// =============================================================================

// =============================================================================
// 1. UTILITÁRIOS VETORIAIS EM S²
// =============================================================================

function generateUniformRandomSpherePoints(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const z = 2.0 * Math.random() - 1.0;
        const theta = 2.0 * Math.PI * Math.random();
        const r = Math.sqrt(Math.max(0.0, 1.0 - z * z));
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        points.push([x, y, z]);
    }
    return points;
}

function computeCircumcenter(pa, pb, pc) {
    const v1x = pb[0] - pa[0], v1y = pb[1] - pa[1], v1z = pb[2] - pa[2];
    const v2x = pc[0] - pa[0], v2y = pc[1] - pa[1], v2z = pc[2] - pa[2];
    let nx = v1y * v2z - v1z * v2y;
    let ny = v1z * v2x - v1x * v2z;
    let nz = v1x * v2y - v1y * v2x;
    const dot = nx * pa[0] + ny * pa[1] + nz * pa[2];
    if (dot < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const len = Math.hypot(nx, ny, nz) || 1.0;
    return [nx / len, ny / len, nz / len];
}

// =============================================================================
// 2. DELAUNAY ESFÉRICO ROBUSTO & TOPOLOGIA VORONOI
// =============================================================================

function buildSphericalDelaunayAndVoronoi(points) {
    const numPoints = points.length;

    // Inicialização com octaedro canônico de 6 vértices base
    const allPoints = [
        [1, 0, 0], [-1, 0, 0],
        [0, 1, 0], [0, -1, 0],
        [0, 0, 1], [0, 0, -1]
    ];

    for (let i = 0; i < numPoints; i++) {
        allPoints.push(points[i].slice());
    }

    const totalPts = allPoints.length;

    const triangles = [
        { v: [0, 2, 4], n: [4, 1, 3], cc: [0, 0, 0], active: true },
        { v: [0, 4, 3], n: [5, 2, 0], cc: [0, 0, 0], active: true },
        { v: [0, 3, 5], n: [6, 3, 1], cc: [0, 0, 0], active: true },
        { v: [0, 5, 2], n: [7, 0, 2], cc: [0, 0, 0], active: true },
        { v: [1, 4, 2], n: [0, 7, 5], cc: [0, 0, 0], active: true },
        { v: [1, 3, 4], n: [1, 4, 6], cc: [0, 0, 0], active: true },
        { v: [1, 5, 3], n: [2, 5, 7], cc: [0, 0, 0], active: true },
        { v: [1, 2, 5], n: [3, 6, 4], cc: [0, 0, 0], active: true }
    ];

    for (const t of triangles) {
        t.cc = computeCircumcenter(allPoints[t.v[0]], allPoints[t.v[1]], allPoints[t.v[2]]);
    }

    function replaceNeighbor(tIdx, oldN, newN) {
        const t = triangles[tIdx];
        if (t.n[0] === oldN) t.n[0] = newN;
        else if (t.n[1] === oldN) t.n[1] = newN;
        else if (t.n[2] === oldN) t.n[2] = newN;
    }

    let startSearchTri = 0;

    for (let pIdx = 6; pIdx < totalPts; pIdx++) {
        const P = allPoints[pIdx];

        let currTri = startSearchTri;
        if (!triangles[currTri] || !triangles[currTri].active) {
            for (let i = 0; i < triangles.length; i++) {
                if (triangles[i].active) { currTri = i; break; }
            }
        }

        let found = false;
        let iter = 0;
        while (!found && iter < 300) {
            iter++;
            const t = triangles[currTri];
            const pA = allPoints[t.v[0]], pB = allPoints[t.v[1]], pC = allPoints[t.v[2]];

            const e0x = pB[1] * pC[2] - pB[2] * pC[1], e0y = pB[2] * pC[0] - pB[0] * pC[2], e0z = pB[0] * pC[1] - pB[1] * pC[0];
            const e1x = pC[1] * pA[2] - pC[2] * pA[1], e1y = pC[2] * pA[0] - pC[0] * pA[2], e1z = pC[0] * pA[1] - pC[1] * pA[0];
            const e2x = pA[1] * pB[2] - pA[2] * pB[1], e2y = pA[2] * pB[0] - pA[0] * pB[2], e2z = pA[0] * pB[1] - pA[1] * pB[0];

            if (e0x * P[0] + e0y * P[1] + e0z * P[2] < -1e-12) {
                currTri = t.n[0];
            } else if (e1x * P[0] + e1y * P[1] + e1z * P[2] < -1e-12) {
                currTri = t.n[1];
            } else if (e2x * P[0] + e2y * P[1] + e2z * P[2] < -1e-12) {
                currTri = t.n[2];
            } else {
                found = true;
            }
        }

        if (!found) {
            for (let i = 0; i < triangles.length; i++) {
                if (!triangles[i].active) continue;
                const t = triangles[i];
                const pA = allPoints[t.v[0]], pB = allPoints[t.v[1]], pC = allPoints[t.v[2]];
                const e0 = (pB[1] * pC[2] - pB[2] * pC[1]) * P[0] + (pB[2] * pC[0] - pB[0] * pC[2]) * P[1] + (pB[0] * pC[1] - pB[1] * pC[0]) * P[2];
                const e1 = (pC[1] * pA[2] - pC[2] * pA[1]) * P[0] + (pC[2] * pA[0] - pC[0] * pA[2]) * P[1] + (pC[0] * pA[1] - pC[1] * pA[0]) * P[2];
                const e2 = (pA[1] * pB[2] - pA[2] * pB[1]) * P[0] + (pA[2] * pB[0] - pA[0] * pB[2]) * P[1] + (pA[0] * pB[1] - pA[1] * pB[0]) * P[2];
                if (e0 >= -1e-9 && e1 >= -1e-9 && e2 >= -1e-9) {
                    currTri = i;
                    found = true;
                    break;
                }
            }
        }

        if (!found) continue;

        startSearchTri = currTri;

        const origT = triangles[currTri];
        const a = origT.v[0], b = origT.v[1], c = origT.v[2];
        const nA = origT.n[0], nB = origT.n[1], nC = origT.n[2];

        const t0Idx = currTri;
        const t1Idx = triangles.length;
        const t2Idx = triangles.length + 1;

        triangles[t0Idx] = { v: [a, b, pIdx], n: [t1Idx, t2Idx, nC], cc: computeCircumcenter(allPoints[a], allPoints[b], P), active: true };
        triangles.push({ v: [b, c, pIdx], n: [t2Idx, t0Idx, nA], cc: computeCircumcenter(allPoints[b], allPoints[c], P), active: true });
        triangles.push({ v: [c, a, pIdx], n: [t0Idx, t1Idx, nB], cc: computeCircumcenter(allPoints[c], allPoints[a], P), active: true });

        replaceNeighbor(nC, currTri, t0Idx);
        replaceNeighbor(nA, currTri, t1Idx);
        replaceNeighbor(nB, currTri, t2Idx);

        const flipStack = [
            { tIn: t0Idx, tOut: nC, edgeU: a, edgeV: b },
            { tIn: t1Idx, tOut: nA, edgeU: b, edgeV: c },
            { tIn: t2Idx, tOut: nB, edgeU: c, edgeV: a }
        ];

        while (flipStack.length > 0) {
            const { tIn, tOut, edgeU, edgeV } = flipStack.pop();
            if (!triangles[tIn] || !triangles[tIn].active || !triangles[tOut] || !triangles[tOut].active) continue;

            const tOuter = triangles[tOut];
            let oppIdx = -1;
            for (let k = 0; k < 3; k++) {
                if (tOuter.v[k] !== edgeU && tOuter.v[k] !== edgeV) {
                    oppIdx = tOuter.v[k];
                    break;
                }
            }
            if (oppIdx === -1) continue;

            const pD = allPoints[oppIdx];
            const cc = triangles[tIn].cc;
            const pU = allPoints[edgeU];

            const inCircle = (cc[0] * pD[0] + cc[1] * pD[1] + cc[2] * pD[2]) > (cc[0] * pU[0] + cc[1] * pU[1] + cc[2] * pU[2]) + 1e-10;

            if (inCircle) {
                let nUD = -1, nDW = -1;
                for (let k = 0; k < 3; k++) {
                    const vk = tOuter.v[k];
                    if (vk === edgeU) nDW = tOuter.n[k];
                    else if (vk === edgeV) nUD = tOuter.n[k];
                }

                let nUP = -1, nPW = -1;
                const tInner = triangles[tIn];
                for (let k = 0; k < 3; k++) {
                    const vk = tInner.v[k];
                    if (vk === edgeU) nPW = tInner.n[k];
                    else if (vk === edgeV) nUP = tInner.n[k];
                }

                triangles[tIn] = {
                    v: [edgeU, oppIdx, pIdx],
                    n: [tOut, nUP, nUD],
                    cc: computeCircumcenter(allPoints[edgeU], allPoints[oppIdx], P),
                    active: true
                };

                triangles[tOut] = {
                    v: [oppIdx, edgeV, pIdx],
                    n: [nPW, tIn, nDW],
                    cc: computeCircumcenter(allPoints[oppIdx], allPoints[edgeV], P),
                    active: true
                };

                replaceNeighbor(nUD, tOut, tIn);
                replaceNeighbor(nPW, tIn, tOut);

                flipStack.push({ tIn: tIn, tOut: nUD, edgeU: edgeU, edgeV: oppIdx });
                flipStack.push({ tIn: tOut, tOut: nDW, edgeU: oppIdx, edgeV: edgeV });
            }
        }
    }

    const activeTriangles = [];
    const triToActiveIdx = new Map();

    for (let i = 0; i < triangles.length; i++) {
        if (triangles[i].active) {
            triToActiveIdx.set(i, activeTriangles.length);
            activeTriangles.push(triangles[i]);
        }
    }

    const voronoiVertices = activeTriangles.map(t => t.cc);

    const pointToTriangles = Array.from({ length: totalPts }, () => []);
    for (let f = 0; f < activeTriangles.length; f++) {
        const t = activeTriangles[f];
        pointToTriangles[t.v[0]].push(f);
        pointToTriangles[t.v[1]].push(f);
        pointToTriangles[t.v[2]].push(f);
    }

    const cellPolygons = [];

    for (let pIdx = 6; pIdx < totalPts; pIdx++) {
        const incTris = pointToTriangles[pIdx];
        if (incTris.length < 3) {
            cellPolygons.push([]);
            continue;
        }

        const startTri = incTris[0];
        const polygonVerts = [startTri];
        let curr = startTri;

        for (let step = 0; step < incTris.length - 1; step++) {
            const t = activeTriangles[curr];
            let nextTri = -1;
            for (let k = 0; k < 3; k++) {
                if (t.v[k] === pIdx) {
                    const neighborTriIdx = triToActiveIdx.get(t.n[(k + 1) % 3]);
                    if (neighborTriIdx !== undefined && neighborTriIdx !== curr) {
                        nextTri = neighborTriIdx;
                        break;
                    }
                }
            }

            if (nextTri !== -1 && !polygonVerts.includes(nextTri)) {
                polygonVerts.push(nextTri);
                curr = nextTri;
            } else {
                break;
            }
        }

        if (polygonVerts.length < 3) {
            const center = allPoints[pIdx];
            let refX = 0, refY = 1, refZ = 0;
            if (Math.abs(center[1]) > 0.9) { refX = 1; refY = 0; refZ = 0; }
            const dot1 = refX * center[0] + refY * center[1] + refZ * center[2];
            let e1x = refX - dot1 * center[0], e1y = refY - dot1 * center[1], e1z = refZ - dot1 * center[2];
            const len1 = Math.hypot(e1x, e1y, e1z) || 1.0;
            e1x /= len1; e1y /= len1; e1z /= len1;
            const e2x = center[1] * e1z - center[2] * e1y, e2y = center[2] * e1x - center[0] * e1z, e2z = center[0] * e1y - center[1] * e1x;

            const sorted = incTris.slice().sort((fa, fb) => {
                const va = voronoiVertices[fa], vb = voronoiVertices[fb];
                const angleA = Math.atan2(va[0] * e2x + va[1] * e2y + va[2] * e2z, va[0] * e1x + va[1] * e1y + va[2] * e1z);
                const angleB = Math.atan2(vb[0] * e2x + vb[1] * e2y + vb[2] * e2z, vb[0] * e1x + vb[1] * e1y + vb[2] * e1z);
                return angleA - angleB;
            });
            cellPolygons.push(sorted);
        } else {
            cellPolygons.push(polygonVerts);
        }
    }

    return {
        voronoiVertices,
        cellPolygons
    };
}

// =============================================================================
// 3. RELAXAMENTO DE LLOYD EM S²
// =============================================================================

function applyLloydStep(points, voronoiData) {
    const { voronoiVertices, cellPolygons } = voronoiData;
    const numCells = points.length;
    const newPoints = [];
    let maxShift = 0.0;
    let avgShift = 0.0;

    for (let i = 0; i < numCells; i++) {
        const polyVerts = cellPolygons[i];
        const nVerts = polyVerts.length;
        if (nVerts < 3) {
            newPoints.push(points[i].slice());
            continue;
        }

        let cx = 0, cy = 0, cz = 0;
        let totalArea = 0;

        for (let j = 0; j < nVerts; j++) {
            const v1 = voronoiVertices[polyVerts[j]];
            const v2 = voronoiVertices[polyVerts[(j + 1) % nVerts]];

            const crx = v1[1] * v2[2] - v1[2] * v2[1];
            const cry = v1[2] * v2[0] - v1[0] * v2[2];
            const crz = v1[0] * v2[1] - v1[1] * v2[0];
            const triArea = Math.hypot(crx, cry, crz);

            cx += (v1[0] + v2[0]) * triArea;
            cy += (v1[1] + v2[1]) * triArea;
            cz += (v1[2] + v2[2]) * triArea;
            totalArea += triArea;
        }

        const len = Math.hypot(cx, cy, cz) || 1.0;
        const nx = cx / len;
        const ny = cy / len;
        const nz = cz / len;

        const shift = Math.hypot(nx - points[i][0], ny - points[i][1], nz - points[i][2]);
        if (shift > maxShift) maxShift = shift;
        avgShift += shift;

        newPoints.push([nx, ny, nz]);
    }

    avgShift /= numCells;

    return {
        newPoints,
        maxShift,
        avgShift
    };
}

// =============================================================================
// 4. CONVERSÃO DIRETA EM BUFFERS NATIVOS (ZERO-COPY & SEM TRIÂNGULOS INTERNOS)
// =============================================================================

const TOPOLOGY_RGB = {
    pentagon: [0.98, 0.80, 0.08], // Dourado (5 lados)
    hexagon:  [0.22, 0.74, 0.97], // Ciano (6 lados)
    heptagon: [0.92, 0.28, 0.60], // Rosa (7 lados)
    other:    [0.94, 0.27, 0.27]  // Vermelho (outros)
};

function packDirectBuffersForThreeJS(points, voronoiData, iteration = 0, avgShift = 0) {
    const { voronoiVertices, cellPolygons } = voronoiData;
    const numCells = points.length;

    // 1. Contagem exata de triângulos e estatísticas
    let totalTriangles = 0;
    let pentagons = 0, hexagons = 0, heptagons = 0, others = 0;

    for (let i = 0; i < numCells; i++) {
        const poly = cellPolygons[i];
        const deg = poly.length;
        if (deg < 3) continue;

        totalTriangles += deg;

        if (deg === 5) pentagons++;
        else if (deg === 6) hexagons++;
        else if (deg === 7) heptagons++;
        else others++;
    }

    // 2. Alocação exata dos Buffers Nativos
    const meshPositions = new Float32Array(totalTriangles * 9);
    const meshNormals = new Float32Array(totalTriangles * 9);
    const meshColors = new Float32Array(totalTriangles * 9);

    const generatorPositions = new Float32Array(numCells * 3);

    // Mapa para deduplicação estrita de arestas do wireframe
    const uniqueEdges = new Set();
    const wireframePairs = [];

    let vCursor = 0;

    for (let i = 0; i < numCells; i++) {
        const [cx, cy, cz] = points[i];
        generatorPositions[3 * i] = cx * 1.004;
        generatorPositions[3 * i + 1] = cy * 1.004;
        generatorPositions[3 * i + 2] = cz * 1.004;

        const poly = cellPolygons[i];
        const deg = poly.length;
        if (deg < 3) continue;

        let col = TOPOLOGY_RGB.other;
        if (deg === 5) col = TOPOLOGY_RGB.pentagon;
        else if (deg === 6) col = TOPOLOGY_RGB.hexagon;
        else if (deg === 7) col = TOPOLOGY_RGB.heptagon;

        for (let k = 0; k < deg; k++) {
            const v1Idx = poly[k];
            const v2Idx = poly[(k + 1) % deg];

            const v1 = voronoiVertices[v1Idx];
            const v2 = voronoiVertices[v2Idx];

            // Triangulação leque estrita e individual para esta célula
            // Garantia de orientação anti-horária voltada para fora
            const nx = v1[1] * v2[2] - v1[2] * v2[1];
            const ny = v1[2] * v2[0] - v1[0] * v2[2];
            const nz = v1[0] * v2[1] - v1[1] * v2[0];
            const dotC = nx * cx + ny * cy + nz * cz;

            const pa = [cx, cy, cz];
            const pb = (dotC >= 0) ? v1 : v2;
            const pc = (dotC >= 0) ? v2 : v1;

            const triVerts = [pa, pb, pc];

            for (const pt of triVerts) {
                meshPositions[vCursor] = pt[0];
                meshPositions[vCursor + 1] = pt[1];
                meshPositions[vCursor + 2] = pt[2];

                // Normal esférica analítica perfeita (n = P / |P|)
                meshNormals[vCursor] = pt[0];
                meshNormals[vCursor + 1] = pt[1];
                meshNormals[vCursor + 2] = pt[2];

                meshColors[vCursor] = col[0];
                meshColors[vCursor + 1] = col[1];
                meshColors[vCursor + 2] = col[2];

                vCursor += 3;
            }

            // Deduplicação de arestas do wireframe
            const minIdx = Math.min(v1Idx, v2Idx);
            const maxIdx = Math.max(v1Idx, v2Idx);
            const edgeKey = (minIdx << 16) | maxIdx;

            if (!uniqueEdges.has(edgeKey)) {
                uniqueEdges.add(edgeKey);
                wireframePairs.push(v1[0] * 1.001, v1[1] * 1.001, v1[2] * 1.001);
                wireframePairs.push(v2[0] * 1.001, v2[1] * 1.001, v2[2] * 1.001);
            }
        }
    }

    const wireframePositions = new Float32Array(wireframePairs);

    return {
        iteration,
        avgShift,
        numCells,
        pentagons,
        hexagons,
        heptagons,
        others,
        meshPositions,
        meshNormals,
        meshColors,
        wireframePositions,
        generatorPositions
    };
}

// =============================================================================
// 5. INTERFACE DE MENSAGENS COM ZERO-COPY TRANSFER
// =============================================================================

let currentGenerators = [];
let currentVoronoiData = null;
let currentLloydIteration = 0;

self.onmessage = function (e) {
    const { type, payload } = e.data;

    switch (type) {
        case 'GENERATE_INITIAL_MESH': {
            const numPoints = payload.numPoints || 500;
            currentGenerators = generateUniformRandomSpherePoints(numPoints);
            currentVoronoiData = buildSphericalDelaunayAndVoronoi(currentGenerators);
            currentLloydIteration = 0;

            const packed = packDirectBuffersForThreeJS(currentGenerators, currentVoronoiData, 0, 0);

            // Transferência Zero-Copy via Transferable Objects
            self.postMessage(
                { type: 'MESH_BUFFERS_READY', payload: packed },
                [
                    packed.meshPositions.buffer,
                    packed.meshNormals.buffer,
                    packed.meshColors.buffer,
                    packed.wireframePositions.buffer,
                    packed.generatorPositions.buffer
                ]
            );
            break;
        }

        case 'LLOYD_STEP': {
            if (!currentGenerators || currentGenerators.length === 0 || !currentVoronoiData) return;

            const steps = payload.steps || 1;
            let lastShift = 0;

            for (let s = 0; s < steps; s++) {
                const { newPoints, avgShift } = applyLloydStep(currentGenerators, currentVoronoiData);
                currentGenerators = newPoints;
                lastShift = avgShift;
                currentLloydIteration++;
                currentVoronoiData = buildSphericalDelaunayAndVoronoi(currentGenerators);
            }

            const packed = packDirectBuffersForThreeJS(currentGenerators, currentVoronoiData, currentLloydIteration, lastShift);

            // Transferência Zero-Copy via Transferable Objects
            self.postMessage(
                { type: 'MESH_BUFFERS_READY', payload: packed },
                [
                    packed.meshPositions.buffer,
                    packed.meshNormals.buffer,
                    packed.meshColors.buffer,
                    packed.wireframePositions.buffer,
                    packed.generatorPositions.buffer
                ]
            );
            break;
        }

        default:
            break;
    }
};
