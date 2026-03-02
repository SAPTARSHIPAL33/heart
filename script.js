/* Cinematic Romantic Animation — Phase 3 (Ultimate Realism & Emotion)
   - Anatomically distinct silhouettes (Bulky Male, Curvy Female, proportional heads 1:6.5)
   - Thick, muscle-following vessels (no clothing shapes)
   - Fluid waltz choreography (Sways, dips, no impossible rotations)
   - Magical particle morph
   - Dense, multi-layered 3D illuminated heart interior (85% scale)
*/
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const landing = $('landing'), startBtn = $('startBtn'), scene = $('scene'),
        canvas = $('canvas'), ctx = canvas.getContext('2d'), msgEl = $('message'), audio = $('bgMusic');
    let W, H, cx, cy, scFig, scHeart, started = false, st = 0, msgShown = false;

    // Timeline (seconds)
    const GR = 8, AP = 3, PR = 4, RS = 2.5, DN = 12, MO = 6, MDL = 3.5;
    // Growth(8) -> Approach(3) -> Proposal(4) -> Response(2.5) -> Dance(12) -> Morph(6) = 35.5s total to heart
    const TD = GR, TA = TD + AP, TP = TA + PR, TR = TP + RS, TM = TR + DN, TMEND = TM + MO, TMSG = TMEND + MDL;

    function resize() {
        const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight;
        canvas.width = W * d; canvas.height = H * d;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(d, 0, 0, d, 0, 0); cx = W / 2; cy = H / 2;
        const minDim = Math.min(W, H);
        scFig = minDim * 0.80;   // Characters 80% of screen height
        scHeart = minDim * 0.85; // Heart 85% of screen
    }
    addEventListener('resize', resize); resize();

    // Utility
    function lerp(a, b, t) { return a + (b - a) * t }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
    function easeIO(t) { return t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t) }
    function easeOut(t) { return 1 - (1 - t) ** 3 }
    function lerpP(A, B, t) { const r = {}; for (const k in A) r[k] = [lerp(A[k][0], B[k][0], t), lerp(A[k][1], B[k][1], t)]; return r }
    function rotP(p, a, ox, oy) {
        const c = Math.cos(a), s = Math.sin(a), r = {};
        for (const k in p) { const dx = p[k][0] - ox, dy = p[k][1] - oy; r[k] = [ox + dx * c - dy * s, oy + dx * s + dy * c] } return r
    }
    function toWFig(x, y) { return [cx + x * scFig, cy + y * scFig] }
    function toWHrt(x, y) { return [cx + x * scHeart, cy + y * scHeart] }
    function rng(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }

    // Heart Path (Centered, 85% scale)
    function hPt(t) {
        const x = 16 * Math.sin(t) ** 3, y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return [x / 22 * .85, y / 22 * .85];
    }
    const HP = []; for (let t = 0; t <= Math.PI * 2; t += .03)HP.push(hPt(t));
    function nearH(x, y, isGirl) {
        const side = isGirl ? 1 : -1;
        const hx = x * (scFig / scHeart) + side * 0.15;
        const hy = y * (scFig / scHeart) - 0.1;
        let m = 1e9, b = HP[0];
        for (const p of HP) { const d = (hx - p[0]) ** 2 + (hy - p[1]) ** 2; if (d < m) { m = d; b = p } }
        return b;
    }

    // ═══ POSES (Anatomically distinct silhouettes) ═══
    // MAN: Broad shoulders, narrow pelvis, thick neck, masculine stance. Head is ~1:6.5 (drawn separately).
    // WOMAN: Narrow shoulders, curved waist, slightly wider pelvis, elegant stance. Head is ~1:7.

    const aB = {
        nk: [-.25, -.42],                   // Base of thick neck (Head center will be around -.25, -.48)
        lS: [-.37, -.38], rS: [-.13, -.38],    // Broad shoulders (Width: .24)
        hc: [-.25, -.20],                   // Heart/Chest mass center
        to: [-.25, -.12],                   // Mid-torso (straight sides)
        lI: [-.30, -.02], rI: [-.20, -.02],    // Narrow pelvis (Width: .10)
        lE: [-.42, -.18], rE: [-.08, -.18],    // Thick arms
        lH: [-.40, -.02], rH: [-.10, -.02],
        lK: [-.31, .20], rK: [-.19, .20],      // Straight legs
        lF: [-.32, .42], rF: [-.18, .42]
    };
    const aG = {
        nk: [.25, -.36],                    // Lower neck base (Head center around .25, -.41)
        lS: [.19, -.33], rS: [.31, -.33],      // Narrow shoulders (Width: .12)
        hc: [.25, -.18],                    // Chest
        wa: [.25, -.10],                    // Pinched waist
        to: [.25, -.08],                    // Lower torso
        lI: [.17, -.01], rI: [.33, -.01],      // Wider pelvis relative to her shoulders (Width: .16)
        lE: [.16, -.16], rE: [.34, -.16],      // Slim arms
        lH: [.15, .01], rH: [.35, .01],
        lK: [.18, .22], rK: [.32, .22],        // Shorter legs
        lF: [.18, .42], rF: [.32, .42]
    };

    // Approach
    const apB = {
        nk: [-.15, -.42], lS: [-.27, -.38], rS: [-.03, -.38], hc: [-.15, -.20], to: [-.15, -.12],
        lI: [-.20, -.02], rI: [-.10, -.02], lE: [-.32, -.18], rE: [.02, -.18], lH: [-.30, -.02], rH: [.00, -.02],
        lK: [-.21, .20], rK: [-.09, .20], lF: [-.22, .42], rF: [-.08, .42]
    };
    const apG = {
        nk: [.15, -.36], lS: [.09, -.33], rS: [.21, -.33], hc: [.15, -.18], wa: [.15, -.10], to: [.15, -.08],
        lI: [.07, -.01], rI: [.23, -.01], lE: [.06, -.16], rE: [.24, -.16], lH: [.05, .01], rH: [.25, .01],
        lK: [.08, .22], rK: [.22, .22], lF: [.08, .42], rF: [.22, .42]
    };

    // Proposal (Man kneels tall, extending hand; Woman gracefully touches)
    const pB = {
        nk: [-.18, -.18],                   // Knelt down
        lS: [-.30, -.14], rS: [-.06, -.14],    // Shoulders level
        hc: [-.18, .02], to: [-.18, .10],      // Straight spine
        lI: [-.23, .18], rI: [-.13, .18],
        lE: [-.34, .05], rE: [.05, -.07],      // Right arm reaches up towards her hand
        lH: [-.32, .22], rH: [.04, -.01],      // Hand positioned for her
        lK: [-.26, .36], rK: [-.05, .26],      // Left knee down, right knee up
        lF: [-.28, .44], rF: [-.06, .44]
    };
    const pG = {
        nk: [.10, -.33],                    // Leans in slightly
        lS: [.04, -.30], rS: [.16, -.30],
        hc: [.09, -.15], wa: [.08, -.07], to: [.08, -.05],
        lI: [.02, .02], rI: [.16, .02],
        lE: [.01, -.12], rE: [.20, -.12],
        lH: [-.02, -.04], rH: [.22, .03],      // Left hand reaches out to touch his
        lK: [.03, .24], rK: [.15, .24],
        lF: [.03, .44], rF: [.15, .44]
    };

    const rB = pB; // Man holds
    const rG = {
        nk: [.08, -.31],                    // Leans closer
        lS: [.02, -.28], rS: [.14, -.28], hc: [.07, -.13], wa: [.06, -.05], to: [.06, -.03],
        lI: [.00, .04], rI: [.14, .04], lE: [-.01, -.08], rE: [.18, -.08],
        lH: [.04, pB.rH[1]], rH: [.20, .05],   // Hands touch
        lK: [.01, .26], rK: [.13, .26], lF: [.01, .44], rF: [.13, .44]
    };

    // Dance Hold (Close contact)
    const dB = {
        nk: [-.06, -.42], lS: [-.18, -.38], rS: [.06, -.38], hc: [-.06, -.20], to: [-.06, -.12], lI: [-.11, -.02], rI: [-.01, -.02],
        lE: [-.24, -.26], rE: [.12, -.25],    // Arms raised for hold
        lH: [-.30, -.16], rH: [.06, -.14],
        lK: [-.12, .20], rK: [.00, .20], lF: [-.13, .42], rF: [.01, .42]
    };
    const dG = {
        nk: [.04, -.36], lS: [-.02, -.33], rS: [.10, -.33], hc: [.04, -.18], wa: [.05, -.10], to: [.05, -.08], lI: [-.03, -.01], rI: [.13, -.01],
        lE: [-.07, -.20], rE: [.15, -.18],    // Arms resting on him
        lH: [-.12, -.14], rH: [.08, -.12],
        lK: [-.01, .22], rK: [.11, .22], lF: [-.01, .42], rF: [.11, .42]
    };

    // Dance Sway Left
    const dsL_B = rotP(dB, -0.12, 0, .4);
    const dsL_G = rotP(dG, -0.12, 0, .4);

    // Dance Sway Right
    const dsR_B = rotP(dB, 0.12, 0, .4);
    const dsR_G = rotP(dG, 0.12, 0, .4);

    // Dance Dip (Cinematic sweeping motion)
    const dipB = {
        nk: [-.16, -.34], lS: [-.28, -.30], rS: [-.04, -.30], hc: [-.16, -.12], to: [-.16, -.04],
        lI: [-.21, .06], rI: [-.11, .06],
        lE: [-.34, -.18], rE: [.06, -.12],    // Right arm firmly supporting her back
        lH: [-.40, -.08], rH: [.12, -.02],
        lK: [-.22, .28], rK: [-.06, .32],     // Left leg bent, right leg bracing
        lF: [-.23, .42], rF: [.08, .42]
    };
    const dipG = {
        nk: [.24, -.20], lS: [.15, -.18], rS: [.30, -.14], hc: [.20, -.04], wa: [.16, .04], to: [.14, .06],
        lI: [.05, .12], rI: [.20, .16],       // Arching back
        lE: [.10, -.04], rE: [.32, -.04],
        lH: [.05, -.08], rH: [.35, -.10],     // Arms swept back
        lK: [.07, .30], rK: [.22, .32],
        lF: [.05, .42], rF: [.14, .40]        // One foot lifted slightly
    };

    function getDancePoses(t_in_dance) {
        // 12s total fluid sequence
        if (t_in_dance < 2.5) return { b: lerpP(rB, dB, easeIO(t_in_dance / 2.5)), g: lerpP(rG, dG, easeIO(t_in_dance / 2.5)) };
        if (t_in_dance < 5) return { b: lerpP(dB, dsL_B, easeIO((t_in_dance - 2.5) / 2.5)), g: lerpP(dG, dsL_G, easeIO((t_in_dance - 2.5) / 2.5)) };
        if (t_in_dance < 7.5) return { b: lerpP(dsL_B, dsR_B, easeIO((t_in_dance - 5) / 2.5)), g: lerpP(dsL_G, dsR_G, easeIO((t_in_dance - 5) / 2.5)) };
        if (t_in_dance < 10) return { b: lerpP(dsR_B, dipB, easeIO((t_in_dance - 7.5) / 2.5)), g: lerpP(dsR_G, dipG, easeIO((t_in_dance - 7.5) / 2.5)) };
        return { b: lerpP(dipB, dB, easeIO((t_in_dance - 10) / 2)), g: lerpP(dipG, dG, easeIO((t_in_dance - 10) / 2)) };
    }

    // ═══ ANATOMICAL BONE MAPPING ═══
    // Designed to follow muscle structures rather than horizontal wrapping
    const BONES_M = [
        ['nk', 'hc', .02, .20], ['hc', 'to', .04, .24], ['to', 'lI', .08, .30], ['to', 'rI', .08, .30], // Core spine
        ['nk', 'lS', .08, .35], ['nk', 'rS', .08, .35], // Strong shoulders
        ['hc', 'lS', .10, .35], ['hc', 'rS', .10, .35], // Pecs/Chest mass
        ['lS', 'lE', .18, .48], ['lE', 'lH', .28, .58], // Arms
        ['rS', 'rE', .18, .48], ['rE', 'rH', .28, .58],
        ['lI', 'rI', .16, .40], // Pelvis bone (narrow for man)
        ['lI', 'lK', .25, .55], ['lK', 'lF', .35, .65], ['rI', 'rK', .25, .55], ['rK', 'rF', .35, .65] // Strong legs
    ];

    const BONES_F = [
        ['nk', 'hc', .02, .20], ['hc', 'wa', .04, .25], ['wa', 'to', .06, .30], ['to', 'lI', .08, .35], ['to', 'rI', .08, .35], // Curved spine (waist pinch)
        ['nk', 'lS', .08, .35], ['nk', 'rS', .08, .35], // Slender shoulders
        ['wa', 'lS', .12, .40], ['wa', 'rS', .12, .40], // Hourglass lateral lines
        ['lS', 'lE', .18, .48], ['lE', 'lH', .28, .58], // Slim arms
        ['rS', 'rE', .18, .48], ['rE', 'rH', .28, .58],
        ['lI', 'rI', .18, .42], // Wider pelvis relative to female shoulders
        ['lI', 'lK', .27, .57], ['lK', 'lF', .37, .67], ['rI', 'rK', .27, .57], ['rK', 'rF', .37, .67] // Slender legs
    ];

    // ═══ DENSE VEIN GENERATION ═══
    const SEG = 14;
    function genVeins(seed, isMan) {
        const R = rng(seed), veins = [];
        const bones = isMan ? BONES_M : BONES_F;
        for (let bi = 0; bi < bones.length; bi++) {
            // Thicker, more parallel vessels along limbs to build muscle mass rather than horizontal loops
            const nv = isMan ? 7 + Math.floor(R() * 5) : 5 + Math.floor(R() * 3);
            for (let v = 0; v < nv; v++) {
                const spread = isMan ? .06 : .035; // Wider spread for masculine bulk
                const po = (R() - .5) * spread;
                const segs = []; for (let i = 0; i <= SEG; i++) { const t = i / SEG; segs.push(Math.sin(t * Math.PI) * (isMan ? .02 : .012) * (R() - .5) * 2) }
                const gs = bones[bi][2], ge = bones[bi][3];
                const delay = gs + R() * (ge - gs) * .3, dur = (ge - gs) * (.6 + R() * .4);

                const branches = [];
                const nb = 2 + Math.floor(R() * 3); // Small outward branches
                for (let b = 0; b < nb; b++) {
                    const bst = .1 + R() * .8, ba = (R() - .5) * 1.8, bl = .015 + R() * .03;
                    const bp = []; let bx = 0, by = 0;
                    for (let s = 0; s < 5; s++) { bx += Math.cos(ba + (R() - .5) * .4) * (bl / 5); by += Math.sin(ba + (R() - .5) * .4) * (bl / 5); bp.push({ x: bx, y: by }) }
                    branches.push({ st: bst, pts: bp });
                }
                veins.push({ bi, po, segs, delay, dur, branches });
            }
        }
        return veins;
    }
    const boyV = genVeins(1, true), girlV = genVeins(500, false);

    // ═══ DENSE 3D HEART INTERIOR ═══
    // Requires 3 distinct layers of internal branching to eliminate hollow empty space
    const layer1Arteries = [], layer2Branches = [], layer3Capillaries = [];
    (function () {
        const R = rng(999);
        // Layer 1: Thick structural arteries from outline inward (Dense coverage)
        for (let i = 0; i < 180; i++) {
            const t = (i / 180) * Math.PI * 2, hp = hPt(t);
            const inwardAng = Math.atan2(-hp[1], -hp[0]) + (R() - .5) * .6;
            const len = .08 + R() * .25; const pts = []; let x = hp[0], y = hp[1];
            for (let s = 0; s < 10; s++) { x += Math.cos(inwardAng + (R() - .5) * .4) * (len / 10); y += Math.sin(inwardAng + (R() - .5) * .4) * (len / 10); pts.push([x, y]) }
            const br = []; for (let b = 0; b < 2 + Math.floor(R() * 3); b++) { // Branches off artery
                const si = 2 + Math.floor(R() * 7), ba = inwardAng + (R() - .5) * 1.8, bl = .03 + R() * .1;
                const bp = []; let bx = pts[Math.min(si, 9)][0], by = pts[Math.min(si, 9)][1];
                for (let s = 0; s < 4; s++) { bx += Math.cos(ba + (R() - .5) * .5) * (bl / 4); by += Math.sin(ba + (R() - .5) * .5) * (bl / 4); bp.push([bx, by]) }
                br.push({ si: Math.min(si, 9), pts: bp })
            }
            layer1Arteries.push({ s: [hp[0], hp[1]], pts, br, d: R() * .3 }); // Starts early
        }

        // Layer 2: Medium intertwining branches from center radiating outward
        for (let i = 0; i < 140; i++) {
            const cx2 = (R() - .5) * .12, cy2 = (R() - .5) * .12 + .03;
            const ang = R() * Math.PI * 2, len = .1 + R() * .2; const pts = []; let x = cx2, y = cy2;
            for (let s = 0; s < 8; s++) { x += Math.cos(ang + (R() - .5) * .5) * (len / 8); y += Math.sin(ang + (R() - .5) * .5) * (len / 8); pts.push([x, y]) }
            const br = []; for (let b = 0; b < 2 + Math.floor(R() * 2); b++) {
                const si = 2 + Math.floor(R() * 5), ba = ang + (R() - .5) * 1.6, bl = .03 + R() * .08;
                const bp = []; let bx = pts[Math.min(si, 7)][0], by = pts[Math.min(si, 7)][1];
                for (let s = 0; s < 4; s++) { bx += Math.cos(ba + (R() - .5) * .5) * (bl / 4); by += Math.sin(ba + (R() - .5) * .5) * (bl / 4); bp.push([bx, by]) }
                br.push({ si: Math.min(si, 7), pts: bp })
            }
            layer2Branches.push({ s: [cx2, cy2], pts, br, d: .15 + R() * .4 });
        }

        // Layer 3: Dense capillaries filling the absolute volume based on random interior points
        for (let i = 0; i < 300; i++) {
            const t = R() * Math.PI * 2, rad = Math.sqrt(R()) * .9, hp = hPt(t); // sqrt for even area distribution
            const x0 = hp[0] * rad, y0 = hp[1] * rad, ang = R() * Math.PI * 2, len = .02 + R() * .05;
            const pts = []; let x = x0, y = y0;
            for (let s = 0; s < 5; s++) { x += Math.cos(ang + (R() - .5) * 1) * (len / 5); y += Math.sin(ang + (R() - .5) * 1) * (len / 5); pts.push([x, y]) }
            layer3Capillaries.push({ s: [x0, y0], pts, br: [], d: .3 + R() * .6 });
        }
    })();

    // ═══ MAGICAL MORPH PARTICLES ═══
    // Significantly increased count for a fluid liquid-light transition
    const MP = []; let morphReady = false;
    function initMorph(bP, gP) {
        if (morphReady) return; morphReady = true;
        for (let i = 0; i < 600; i++) {
            const isGirl = i >= 300;
            const pose = isGirl ? gP : bP;
            const keys = Object.keys(pose);
            const k = keys[Math.floor(Math.random() * keys.length)]; const p = pose[k];
            const nx = p[0] + (Math.random() - .5) * .15, ny = p[1] + (Math.random() - .5) * .15;
            const [wx, wy] = toWFig(nx, ny); const tgt = nearH(nx, ny, isGirl); const [tx, ty] = toWHrt(tgt[0], tgt[1]);
            MP.push({ x: wx, y: wy, tx, ty, vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 6 - 2, sz: 2 + Math.random() * 3.5, a: 0 });
        }
    }
    function updateMorph(prog) {
        const att = .003 + prog * .02;
        for (const p of MP) {
            p.vx += (p.tx - p.x) * att; p.vy += (p.ty - p.y) * att;
            // Add swirl physics before snapping to target
            const dx = p.tx - p.x, dy = p.ty - p.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 40) { p.vx -= dy * .01; p.vy += dx * .01 }
            p.vx *= .95; p.vy *= .95; p.x += p.vx; p.y += p.vy;
            p.a = Math.min(.8, p.a + .02);
            if (dist < 25) p.a *= .90; // Fade out as it merges into heart
        }
    }

    // ═══ AMBIENT PARTICLES ═══
    const AP2 = [];
    function initAmb() {
        for (let i = 0; i < 120; i++) {
            const R = rng(i * 42 + 11); const t = R() * Math.PI * 2; const hp = hPt(t); const sp = 1.05 + R() * .4;
            AP2.push({ bx: hp[0] * sp, by: hp[1] * sp, x: 0, y: 0, sz: 1.5 + R() * 2.5, mA: .3 + R() * .5, a: 0, ph: R() * Math.PI * 2 })
        }
    }

    // ═══ DRAWING ARCHITECTURE ═══
    function drawVBatch(veins, bones, pose, growth, morphT, lw, alpha) {
        ctx.beginPath();
        for (const v of veins) {
            const B = bones[v.bi]; const gp = clamp((growth - v.delay) / v.dur, 0, 1); if (gp <= 0) continue;
            let a = pose[B[0]], b = pose[B[1]]; if (!a || !b) continue;

            // Morph drift anticipation
            if (morphT > 0 && morphT < .2) {
                const mt = easeIO(morphT * 5);
                a = [a[0], a[1] - mt * .08]; b = [b[0], b[1] - mt * .08];
            }
            const [ax, ay] = toWFig(a[0], a[1]), [bx, by] = toWFig(b[0], b[1]);
            const dx = bx - ax, dy = by - ay, ln = Math.sqrt(dx * dx + dy * dy) || 1;
            const px = -dy / ln, py = dx / ln; const vis = Math.max(2, Math.floor(gp * (SEG + 1)));

            for (let i = 0; i <= SEG; i++) {
                const t = i / SEG, x = ax + dx * t + px * (v.po + v.segs[i]) * scFig, y = ay + dy * t + py * (v.po + v.segs[i]) * scFig;
                if (i === 0) ctx.moveTo(x, y); else if (i < vis) ctx.lineTo(x, y)
            }

            for (const br of v.branches) {
                if (br.st > gp) continue;
                const si = Math.floor(br.st * SEG); if (si >= vis) continue;
                const t = si / SEG, ox = ax + dx * t + px * (v.po + v.segs[si]) * scFig, oy = ay + dy * t + py * (v.po + v.segs[si]) * scFig;
                ctx.moveTo(ox, oy); for (const p of br.pts) ctx.lineTo(ox + p.x * scFig, oy + p.y * scFig)
            }
        }
        ctx.strokeStyle = `rgba(210,45,60,${alpha})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    }

    function drawHead(pose, growth, morphT, alpha, isGirl) {
        if (!pose.nk) return; const gp = clamp((growth - .02) / .23, 0, 1); if (gp <= 0) return;
        // Calculate head center based on neck
        let nk = pose.nk;
        if (morphT > 0 && morphT < .2) { const mt = easeIO(morphT * 5); nk = [nk[0], nk[1] - mt * .08] }

        // Proportional heads: Male ~1:6.5 (larger), Female ~1:7 (smaller)
        const headOffset = isGirl ? -.06 : -.07;
        const [hx, hy] = toWFig(nk[0], nk[1] + headOffset);
        const rScale = isGirl ? .045 : .055;
        const r = scFig * rScale * gp;

        ctx.beginPath();
        // Draw organic head circle filled with veins instead of empty circle
        for (let i = 0; i < Math.PI * 2; i += .4) {
            const rVar = r * (.9 + Math.sin(i * 7) * .1);
            const x = hx + Math.cos(i) * rVar, y = hy + Math.sin(i) * rVar;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(220,50,65,${alpha})`; ctx.lineWidth = isGirl ? 2 : 3; ctx.stroke();

        // Fill inside head
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            ctx.moveTo(hx + (Math.random() - .5) * r, hy + (Math.random() - .5) * r);
            ctx.lineTo(hx + (Math.random() - .5) * r, hy + (Math.random() - .5) * r);
        }
        ctx.strokeStyle = `rgba(220,50,65,${alpha * .5})`; ctx.lineWidth = 1; ctx.stroke();
    }

    function drawFig(veins, bones, pose, growth, morphT, alpha, isGirl) {
        // 3-pass glow for thick cinematic rendering
        drawVBatch(veins, bones, pose, growth, morphT, 5.5, alpha * .25);
        drawVBatch(veins, bones, pose, growth, morphT, 2.8, alpha * .5);
        drawVBatch(veins, bones, pose, growth, morphT, 1.2, alpha * .9);
        drawHead(pose, growth, morphT, alpha * .8, isGirl);
    }

    function renderHeartLayer(layerDicts, progress, lw, al, pulse, alpha, isInner = false) {
        ctx.beginPath();
        for (const v of layerDicts) {
            const vp = clamp((progress - v.d) / (1 - v.d), 0, 1); if (vp <= 0) continue;
            const vis = Math.max(1, Math.floor(vp * v.pts.length));
            const [sx, sy] = toWHrt(v.s[0], v.s[1]); ctx.moveTo(sx, sy);
            for (let i = 0; i < vis; i++) { const [x, y] = toWHrt(v.pts[i][0], v.pts[i][1]); ctx.lineTo(x, y) }
            for (const br of v.br) {
                if (br.si >= vis) continue;
                const [bx, by] = toWHrt(v.pts[br.si][0], v.pts[br.si][1]); ctx.moveTo(bx, by);
                for (const p of br.pts) { const [x, y] = toWHrt(p[0], p[1]); ctx.lineTo(x, y) }
            }
        }

        // Outer layers get deeper red, inner layers are brighter
        const rgb = isInner ? "255,80,95" : "200,30,45";
        const a = alpha * al * (.6 + pulse * .4);
        ctx.strokeStyle = `rgba(${rgb},${a})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    }

    function drawHeart(progress, pulse, alpha) {
        // 1. DENSE INTERIOR VESSSELS (3 Layers)
        // Layer 3 (Deep/Thin Capillaries)
        renderHeartLayer(layer3Capillaries, progress, .8, .3, pulse, alpha, false);
        // Layer 2 (Medium Branches)
        renderHeartLayer(layer2Branches, progress, 1.8, .4, pulse, alpha, false);
        // Layer 1 (Thick Primary Arteries - brighest)
        renderHeartLayer(layer1Arteries, progress, 3.5, .7, pulse, alpha, true);

        // 2. OUTER ILLUMINATED OUTLINE
        ctx.beginPath(); for (let i = 0; i < HP.length; i++) { const [x, y] = toWHrt(HP[i][0], HP[i][1]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
        ctx.closePath();
        const oa = alpha * (.5 + pulse * .5);
        ctx.strokeStyle = `rgba(240,40,65,${oa})`; ctx.lineWidth = 3.5;
        ctx.shadowColor = `rgba(255,30,50,${oa * .7})`; ctx.shadowBlur = 18; ctx.stroke(); ctx.shadowBlur = 0;

        // 3. 3D GLOW GRADIENT
        if (progress > .7) {
            const ia = clamp((progress - .7) / .3, 0, 1) * alpha;
            ctx.beginPath(); for (let i = 0; i < HP.length; i++) { const [x, y] = toWHrt(HP[i][0], HP[i][1]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
            ctx.closePath();
            // Complex radial lighting for 3D sphere volume
            const fg = ctx.createRadialGradient(cx - 30, cy - 40, 0, cx, cy, scHeart * .48);
            const fi = ia * .12 * (.6 + pulse * .4);
            fg.addColorStop(0, `rgba(255,80,90,${fi * 1.5})`); // Highlight
            fg.addColorStop(.4, `rgba(220,30,50,${fi})`); // Midtone
            fg.addColorStop(1, 'rgba(80,5,15,0)'); // Deep shadow
            ctx.fillStyle = fg; ctx.fill()
        }
    }

    function drawMorphP() {
        ctx.beginPath();
        for (const p of MP) { if (p.a < .01) continue; ctx.moveTo(p.x + p.sz, p.y); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2) }
        ctx.fillStyle = 'rgba(255,60,80,.6)'; ctx.shadowColor = 'rgba(255,40,50,.8)'; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0
    }

    function drawAmb(elapsed, alpha) {
        for (const p of AP2) {
            p.x = p.bx + Math.cos(elapsed * .0006 + p.ph) * .02 * scHeart; p.y = p.by + Math.sin(elapsed * .0004 + p.ph) * .015 * scHeart;
            if (p.a < p.mA) p.a += .005; const fl = .7 + .3 * Math.sin(elapsed * .002 + p.ph); const va = p.a * fl * alpha;
            const [wx, wy] = toWHrt(p.x, p.y); ctx.beginPath(); ctx.arc(wx, wy, p.sz, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,80,100,${va})`; ctx.fill()
        }
    }

    function drawGlow(pulse, alpha) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .65);
        const i = (.06 + pulse * .05) * alpha; g.addColorStop(0, `rgba(150,15,30,${i})`);
        g.addColorStop(.6, `rgba(50,5,12,${i * .3})`); g.addColorStop(1, '#040001'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    }

    // ═══ ANIMATION SEQUENCE ═══
    function getPoses(sec) {
        // Growth -> Approach
        if (sec < TD) return { b: aB, g: aG };
        if (sec < TA) { const t = easeIO(clamp((sec - TD) / AP, 0, 1)); return { b: lerpP(aB, apB, t), g: lerpP(aG, apG, t) } }
        // Approach -> Proposal
        if (sec < TP) { const t = easeIO(clamp((sec - TA) / PR, 0, 1)); return { b: lerpP(apB, pB, t), g: lerpP(apG, pG, t) } }
        // Proposal -> Response
        if (sec < TR) { const t = easeIO(clamp((sec - TP) / RS, 0, 1)); return { b: lerpP(pB, rB, t), g: lerpP(pG, rG, t) } }
        // Response -> Dance
        if (sec < TM) { const t = sec - TR; return getDancePoses(t); }
        // Morph transition
        return getDancePoses(12);
    }

    // ═══ MASTER LOOP ═══
    function animate(ts) {
        if (!st) st = ts; const el = ts - st, sec = el / 1000;
        ctx.clearRect(0, 0, W, H); drawGlow(0, 1); // Background base

        // Living Heartbeat Pulse Effect (Sharp sin^4 wave)
        const beatP = (sec % 1.2) / 1.2, pulse = Math.sin(beatP * Math.PI) ** 4;
        const ambA = clamp(sec / 4, 0, 1); drawGlow(pulse, ambA);

        const growth = clamp(sec / GR, 0, 1);
        const morphT = sec >= TM ? clamp((sec - TM) / MO, 0, 1) : 0;

        // Dissolve silhouettes quickly when morph particles launch
        const figA = morphT < .15 ? 1 - (morphT / .15) : 0;
        const { b: boyP, g: girlP } = getPoses(sec);

        // Cinematic glowing ambient pulse during proposal
        if (sec >= TA && sec < TM) {
            const pBst = Math.sin((sec - TA) / (TM - TA) * Math.PI) * .08;
            ctx.fillStyle = `rgba(255,20,40,${pBst})`; ctx.fillRect(0, 0, W, H)
        }

        // Draw 80% screen tall anatomical figures
        if (figA > .01) { drawFig(boyV, BONES_M, boyP, growth, morphT, figA, false); drawFig(girlV, BONES_F, girlP, growth, morphT, figA, true) }

        // Magical particle morph flow physics
        if (morphT > 0) initMorph(boyP, girlP);
        if (morphT > 0 && morphT < 1) { updateMorph(morphT); drawMorphP() }

        // Render Dense Heart
        if (morphT > .1) {
            const hA = clamp((morphT - .1) / .6, 0, 1);
            const hProg = clamp((morphT - .15) / .85, 0, 1); // Heart drawing progress

            // Heart Expansion Pulse + Cinematic Camera Zoom
            if (morphT >= 1) {
                // Continuous subtle breathing synchronized with the heartbeat pulse variable
                const breath = 1 + (pulse * .015);
                ctx.save(); ctx.translate(cx, cy); ctx.scale(breath, breath); ctx.translate(-cx, -cy);
            } else {
                const zs = 1 + easeOut(morphT) * .06; // Cinematic assembly zoom
                ctx.save(); ctx.translate(cx, cy); ctx.scale(zs, zs); ctx.translate(-cx, -cy);
            }

            drawHeart(hProg, pulse, hA) // Pass pulse for internal glow sync
            if (morphT > .3) drawAmb(el, clamp((morphT - .3) / .3, 0, 1)); // Floating outer particles
            ctx.restore();
        }

        // Smooth elegant message reveal
        if (sec >= TMSG && !msgShown) { msgShown = true; msgEl.classList.remove('hidden'); void msgEl.offsetWidth; msgEl.classList.add('visible') }

        requestAnimationFrame(animate);
    }

    // ═══ INIT & BOOTSTRAP ═══
    function floatHearts() {
        const c = document.querySelector('.floating-hearts'); if (!c) return;
        const s = document.createElement('style');
        s.textContent = '@keyframes fh{0%,100%{transform:translateY(0) rotate(0);opacity:.3}50%{transform:translateY(-30px) rotate(5deg);opacity:.5}}';
        document.head.appendChild(s);
        for (let i = 0; i < 12; i++) {
            const h = document.createElement('div'); h.innerHTML = '♥';
            h.style.cssText = `position:absolute;color:rgba(255,26,60,${.04 + Math.random() * .08});font-size:${14 + Math.random() * 20}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation:fh ${8 + Math.random() * 10}s ease-in-out infinite;animation-delay:${Math.random() * 5}s;pointer-events:none`;
            c.appendChild(h)
        }
    }
    function fadeAudio() {
        audio.volume = 0;
        audio.play().catch(() => console.info('🎵 Place music.mp3 in the project folder'));
        const s = performance.now();
        (function step(now) { const p = Math.min(1, (now - s) / 3500); audio.volume = p * .55; if (p < 1) requestAnimationFrame(step) })(s)
    }
    function start() {
        if (started) return; started = true;
        landing.classList.add('fade-out'); scene.classList.remove('hidden');
        setTimeout(() => scene.classList.add('visible'), 50);
        initAmb(); fadeAudio();
        setTimeout(() => { landing.style.display = 'none'; st = 0; requestAnimationFrame(animate) }, 1200)
    }
    floatHearts(); startBtn.addEventListener('click', start);
})();
