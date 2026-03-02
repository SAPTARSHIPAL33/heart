/* Cinematic Romantic Animation — Ultimate Clarity Pass
   - 26-second choreography
   - Perfectly readable anatomical silhouettes
   - Refined feminine hips (narrowed 15%, smoothly rounded)
   - Chaos removed: Highly constrained parallel structural vessels
*/
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const landing = $('landing'), startBtn = $('startBtn'), scene = $('scene'),
        canvas = $('canvas'), ctx = canvas.getContext('2d'), msgEl = $('message'), audio = $('bgMusic');
    let W, H, cx, cy, scFig, scHeart, started = false, st = 0, msgShown = false;

    // ═══ TIMELINE (Extended Dance) ═══
    // Growth(8) -> Approach(3) -> Proposal(4) -> Response(2.5) -> Dance(26) -> Morph(6) = 49.5s total to heart
    const GR = 8, AP = 3, PR = 4, RS = 2.5, DN = 26, MO = 6, MDL = 3.5;
    const TD = GR, TA = TD + AP, TP = TA + PR, TR = TP + RS, TM = TR + DN, TMEND = TM + MO, TMSG = TMEND + MDL;

    function resize() {
        const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight;
        canvas.width = W * d; canvas.height = H * d;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(d, 0, 0, d, 0, 0); cx = W / 2; cy = H / 2;
        const minDim = Math.min(W, H);
        scFig = minDim * 0.80;
        scHeart = minDim * 0.85;
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
    function transP(p, tx, ty) { const r = {}; for (const k in p) r[k] = [p[k][0] + tx, p[k][1] + ty]; return r; }
    function scaleXP(p, sx, ox) { const r = {}; for (const k in p) r[k] = [ox + (p[k][0] - ox) * sx, p[k][1]]; return r; }

    function toWFig(x, y) { return [cx + x * scFig, cy + y * scFig] }
    function toWHrt(x, y) { return [cx + x * scHeart, cy + y * scHeart] }
    function rng(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }

    // Heart Path 
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

    // ═══ BASE POSES (Ultra-clean, narrowed symmetrical feminine hips) ═══

    // MALE: Broad shoulders, massive chest, straight rigid spine.
    const aB = {
        nk: [-.25, -.46],
        lS: [-.40, -.44], rS: [-.10, -.44],
        hc: [-.25, -.25],
        to: [-.25, -.12],
        lI: [-.30, -.02], rI: [-.20, -.02],
        lE: [-.44, -.18], rE: [-.06, -.18],
        lH: [-.41, -.02], rH: [-.09, -.02],
        lP: [-.41, .02], rP: [-.09, .02],
        lFg: [-.40, .06], rFg: [-.10, .06],
        lK: [-.30, .20], rK: [-.20, .20],
        lF: [-.31, .42], rF: [-.19, .42],
        lHl: [-.32, .44], rHl: [-.18, .44],
        lTo: [-.28, .45], rTo: [-.22, .45]
    };

    // FEMALE: Narrowed hips from `[.14, .36]` to `[.16, .34]` (15% reduction) for a cleaner, balanced feminine form.
    const aG = {
        nk: [.25, -.38],
        lS: [.18, -.35], rS: [.32, -.35],
        hc: [.25, -.20],
        wa: [.24, -.08], // Smooth waist             
        to: [.25, -.06],
        lI: [.16, .02], rI: [.34, .02], // Narrowed, highly refined hips       
        lE: [.16, -.16], rE: [.34, -.16],
        lH: [.15, .02], rH: [.35, .02],
        lP: [.15, .05], rP: [.35, .05],
        lFg: [.16, .08], rFg: [.34, .08],
        lK: [.20, .22], rK: [.30, .22],
        lF: [.22, .42], rF: [.28, .42],
        lHl: [.21, .45], rHl: [.29, .45],
        lTo: [.24, .46], rTo: [.26, .46]
    };

    // Approach
    const apB = {
        nk: [-.15, -.46], lS: [-.30, -.44], rS: [.00, -.44], hc: [-.15, -.25], to: [-.15, -.12],
        lI: [-.20, -.02], rI: [-.10, -.02], lE: [-.34, -.18], rE: [.04, -.18],
        lH: [-.31, -.02], rH: [.01, -.02], lP: [-.31, .02], rP: [.01, .02], lFg: [-.30, .06], rFg: [.00, .06],
        lK: [-.20, .20], rK: [-.10, .20], lF: [-.21, .42], rF: [-.09, .42], lHl: [-.22, .44], rHl: [-.08, .44], lTo: [-.18, .45], rTo: [-.12, .45]
    };
    const apG = {
        nk: [.15, -.38], lS: [.08, -.35], rS: [.22, -.35], hc: [.15, -.20], wa: [.14, -.08], to: [.15, -.06],
        lI: [.06, .02], rI: [.24, .02], lE: [.06, -.16], rE: [.24, -.16], // Narrowed elegant hips
        lH: [.05, .02], rH: [.25, .02], lP: [.05, .05], rP: [.25, .05], lFg: [.06, .08], rFg: [.24, .08],
        lK: [.10, .22], rK: [.20, .22], lF: [.12, .42], rF: [.18, .42], lHl: [.11, .45], rHl: [.19, .45], lTo: [.14, .46], rTo: [.16, .46]
    };

    // Proposal 
    const pB = {
        nk: [-.18, -.18], lS: [-.33, -.14], rS: [-.03, -.14], hc: [-.18, .02], to: [-.18, .10], lI: [-.23, .18], rI: [-.13, .18],
        lE: [-.34, .05], rE: [.05, -.07],
        lH: [-.32, .22], rH: [.04, -.01],
        lP: [-.32, .25], rP: [.05, -.03],
        lFg: [-.31, .28], rFg: [.06, -.05],
        lK: [-.26, .36], rK: [-.05, .26],
        lF: [-.28, .42], rF: [-.06, .42], lHl: [-.29, .44], rHl: [-.07, .44], lTo: [-.25, .45], rTo: [-.03, .45]
    };
    const pG = {
        nk: [.10, -.34], lS: [.03, -.31], rS: [.17, -.31], hc: [.10, -.16], wa: [.09, -.06], to: [.10, -.02],
        lI: [.01, .06], rI: [.19, .06], // Narrowed
        lE: [.02, -.12], rE: [.20, -.12],
        lH: [-.02, -.04], rH: [.22, .03],
        lP: [-.04, -.03], rP: [.22, .06],
        lFg: [-.06, -.02], rFg: [.21, .08],
        lK: [.05, .24], rK: [.15, .24],
        lF: [.07, .42], rF: [.13, .42], lHl: [.06, .45], rHl: [.14, .45], lTo: [.09, .46], rTo: [.11, .46]
    };

    const rB = pB;
    const rG = {
        nk: [.08, -.32], lS: [.01, -.29], rS: [.15, -.29], hc: [.08, -.14], wa: [.07, -.04], to: [.08, 0],
        lI: [-.01, .08], rI: [.17, .08], // Narrowed
        lE: [.00, -.08], rE: [.18, -.08],
        lH: [.04, pB.rH[1] - .01], rH: [.20, .05],
        lP: [.05, pB.rH[1] - .03], rP: [.20, .08],
        lFg: [.06, pB.rH[1] - .05], rFg: [.19, .10],
        lK: [.03, .26], rK: [.13, .26], lF: [.05, .42], rF: [.11, .42], lHl: [.04, .45], rHl: [.12, .45], lTo: [.07, .46], rTo: [.09, .46]
    };

    // ═══ CHOREOGRAPHY POSES (DN=26 sequence) ═══

    // Basic Hold (Close embrace)
    const dB = {
        nk: [-.06, -.44], lS: [-.21, -.42], rS: [.09, -.42], hc: [-.06, -.23], to: [-.06, -.10], lI: [-.11, -.01], rI: [-.01, -.01],
        lE: [-.27, -.26], rE: [.14, -.25],
        lH: [-.32, -.16], rH: [.08, -.14],
        lP: [-.32, -.13], rP: [.07, -.12],
        lFg: [-.31, -.11], rFg: [.06, -.11],
        lK: [-.12, .20], rK: [.00, .20], lF: [-.13, .42], rF: [.01, .42], lHl: [-.14, .44], rHl: [.00, .44], lTo: [-.10, .45], rTo: [.03, .45]
    };
    const dG = {
        nk: [.04, -.37], lS: [-.03, -.34], rS: [.11, -.34], hc: [.04, -.19], wa: [.05, -.09], to: [.04, -.05],
        lI: [-.05, .04], rI: [.13, .04], // Clean, narrowed hips
        lE: [-.08, -.20], rE: [.15, -.18],
        lH: [-.12, -.14], rH: [.08, -.12],
        lP: [-.14, -.12], rP: [.05, -.11],
        lFg: [-.15, -.11], rFg: [.04, -.09],
        lK: [.00, .23], rK: [.08, .23], lF: [.02, .42], rF: [.06, .42], lHl: [.01, .45], rHl: [.07, .45], lTo: [.04, .46], rTo: [.05, .46]
    };

    // 1. Lead Prep Sway
    const prepB = rotP(dB, -0.05, 0, .4);
    const prepG = transP(rotP(dG, -0.05, 0, .4), -.03, 0);

    // 2. Female Spin Under Arm
    const spinB = {
        ...dB,
        lE: [-.30, -.35], lH: [-.15, -.48], lP: [-.10, -.46], lFg: [-.08, -.44]
    };
    const spinMidG = {
        ...scaleXP(dG, 0.1, 0.05),
        rH: [-.10, -.46], rP: [-.08, -.44], rFg: [-.06, -.42],
        lE: [.15, -.20], lH: [.15, -.05], lP: [.15, -.02], lFg: [.15, .01]
    };

    // 3. Traveling Steps
    const travelB = transP(dB, -.15, 0);
    const travelG = transP(dG, -.15, 0);
    const travelB_R = transP(rotP(dB, 0.08, 0, .4), .12, .02);
    const travelG_R = transP(rotP(dG, 0.08, 0, .4), .12, .02);

    // 4. Two Hand Spin / Transition
    const twoHandB = {
        ...dB,
        rE: [.05, -.20], rH: [-.15, -.14], rP: [-.15, -.12], rFg: [-.14, -.10]
    };
    const twoHandG = scaleXP({
        ...dG,
        lE: [-.02, -.20], lH: [-.15, -.12], lP: [-.15, -.10], lFg: [-.14, -.08]
    }, -0.7, 0.05);

    // 5. Final Dip 
    const dipB = {
        nk: [-.14, -.36], lS: [-.29, -.34], rS: [.01, -.34], hc: [-.14, -.15], to: [-.14, -.05], lI: [-.19, .04], rI: [-.09, .04],
        lE: [-.35, -.18], rE: [.06, -.12],
        lH: [-.40, -.08], rH: [.12, -.02],
        lP: [-.40, -.05], rP: [.12, .01],
        lFg: [-.38, -.03], rFg: [.11, .03],
        lK: [-.20, .26], rK: [-.08, .30],
        lF: [-.21, .42], rF: [-.06, .42], lHl: [-.22, .44], rHl: [-.07, .44], lTo: [-.18, .45], rTo: [-.04, .45]
    };
    const dipG = {
        nk: [.24, -.22], lS: [.14, -.20], rS: [.31, -.16], hc: [.20, -.06], wa: [.19, .02], to: [.14, .06],
        lI: [.05, .12], rI: [.19, .16], // Clean narrowed elegant dip hips      
        lE: [.12, -.06], rE: [.32, -.06],
        lH: [.05, -.08], rH: [.35, -.10],
        lP: [.03, -.09], rP: [.37, -.11],
        lFg: [.01, -.10], rFg: [.39, -.12],
        lK: [.07, .30], rK: [.23, .32],
        lF: [.05, .42], rF: [.14, .40], lHl: [.04, .45], rHl: [.13, .43], lTo: [.07, .45], rTo: [.16, .41]
    };

    // ═══ MASTER CHOREOGRAPHY INTERPOLATION ═══
    function getDancePoses(t) {
        if (t < 3) return { b: lerpP(rB, dB, easeIO(t / 3)), g: lerpP(rG, dG, easeIO(t / 3)) };
        if (t < 6) return { b: lerpP(dB, prepB, easeIO((t - 3) / 3)), g: lerpP(dG, prepG, easeIO((t - 3) / 3)) };
        if (t < 8) return { b: lerpP(prepB, spinB, easeIO((t - 6) / 2)), g: lerpP(prepG, dG, easeIO((t - 6) / 2)) };
        if (t < 10) return { b: spinB, g: lerpP(dG, spinMidG, easeIO((t - 8) / 2)) };
        if (t < 12) return { b: lerpP(spinB, dB, easeIO((t - 10) / 2)), g: lerpP(spinMidG, dG, easeIO((t - 10) / 2)) };
        if (t < 14) return { b: lerpP(dB, travelB, easeIO((t - 12) / 2)), g: lerpP(dG, travelG, easeIO((t - 12) / 2)) };
        if (t < 17) return { b: lerpP(travelB, travelB_R, easeIO((t - 14) / 3)), g: lerpP(travelG, travelG_R, easeIO((t - 14) / 3)) };
        if (t < 19) return { b: lerpP(travelB_R, dB, easeIO((t - 17) / 2)), g: lerpP(travelG_R, dG, easeIO((t - 17) / 2)) };
        if (t < 21) return { b: lerpP(dB, twoHandB, easeIO((t - 19) / 2)), g: lerpP(dG, twoHandG, easeIO((t - 19) / 2)) };
        if (t < 23) return { b: lerpP(twoHandB, dipB, easeIO((t - 21) / 2)), g: lerpP(twoHandG, dipG, easeIO((t - 21) / 2)) };
        return { b: dipB, g: dipG };
    }

    // ═══ ANATOMICAL BONE MAPPING (With Type Classifiers) ═══
    const BONES_M = [
        ['nk', 'hc', .0, .20, 'chest'], ['hc', 'to', .02, .24, 'core'], ['to', 'lI', .08, .30, 'pelvis'], ['to', 'rI', .08, .30, 'pelvis'],
        ['nk', 'lS', .08, .35, 'shoulder'], ['nk', 'rS', .08, .35, 'shoulder'],
        ['hc', 'lS', .10, .35, 'chest'], ['hc', 'rS', .10, .35, 'chest'],
        ['lS', 'lE', .18, .48, 'arm'], ['lE', 'lH', .28, .58, 'arm'],
        ['rS', 'rE', .18, .48, 'arm'], ['rE', 'rH', .28, .58, 'arm'],
        ['lH', 'lP', .50, .55, 'hand'], ['lP', 'lFg', .55, .62, 'hand'],
        ['rH', 'rP', .50, .55, 'hand'], ['rP', 'rFg', .55, .62, 'hand'],
        ['lI', 'rI', .16, .40, 'pelvis'],
        ['lI', 'lK', .25, .55, 'thigh'], ['lK', 'lF', .35, .65, 'calf'], ['rI', 'rK', .25, .55, 'thigh'], ['rK', 'rF', .35, .65, 'calf'],
        ['lF', 'lHl', .60, .66, 'foot'], ['lHl', 'lTo', .64, .70, 'foot'],
        ['rF', 'rHl', .60, .66, 'foot'], ['rHl', 'rTo', .64, .70, 'foot']
    ];

    const BONES_F = [
        ['nk', 'hc', .0, .20, 'chest'], ['hc', 'wa', .04, .25, 'waist'], ['wa', 'to', .06, .30, 'pelvis'], ['to', 'lI', .08, .35, 'pelvis'], ['to', 'rI', .08, .35, 'pelvis'],
        ['nk', 'lS', .08, .35, 'shoulder'], ['nk', 'rS', .08, .35, 'shoulder'],
        ['wa', 'lS', .12, .40, 'core'], ['wa', 'rS', .12, .40, 'core'],
        ['lS', 'lE', .18, .48, 'arm'], ['lE', 'lH', .28, .58, 'arm'],
        ['rS', 'rE', .18, .48, 'arm'], ['rE', 'rH', .28, .58, 'arm'],
        ['lH', 'lP', .50, .55, 'hand'], ['lP', 'lFg', .55, .62, 'hand'],
        ['rH', 'rP', .50, .55, 'hand'], ['rP', 'rFg', .55, .62, 'hand'],
        ['lI', 'rI', .18, .42, 'pelvis'],
        // Thighs: Rendered twice (inner/outer contouring)
        ['lI', 'lK', .27, .57, 'thigh'], ['lK', 'lF', .37, .67, 'calf'], ['rI', 'rK', .27, .57, 'thigh'], ['rK', 'rF', .37, .67, 'calf'],
        // Feet
        ['lF', 'lHl', .60, .66, 'foot'], ['lHl', 'lTo', .64, .70, 'foot'],
        ['rF', 'rHl', .60, .66, 'foot'], ['rHl', 'rTo', .64, .70, 'foot']
    ];

    // ═══ HIERARCHICAL BEZIER VEIN GENERATION (Clean & Structured Silhouette) ═══
    const SEG = 14;
    function getMuscleOffset(t, type, isMan) {
        if (isMan) {
            return Math.sin(t * Math.PI) * .006;
        }
        // Deep Custom Female Bezier Profiles (Extremely smooth & rounded arcs, NO SHARP JUMPS)
        switch (type) {
            case 'chest':
                return Math.sin(t * Math.PI) * 0.010;
            case 'waist':
                return Math.sin(t * Math.PI) * (-0.005); // Smooth tiny tuck 
            case 'pelvis':
                return Math.sin(t * Math.PI) * 0.008; // Gentle round curve
            case 'thigh':
                return Math.sin(t * Math.PI) * 0.012; // Beautifully rounded, elegant thigh curve
            case 'calf':
                return Math.sin(t * Math.PI * 1.2) * 0.008 * (1 - t); // Sharp upper calf tapering into clean ankle
            case 'arm':
                return Math.sin(t * Math.PI) * 0.004;
            default:
                return Math.sin(t * Math.PI) * 0.005;
        }
    }

    function genVeins(seed, isMan) {
        const R = rng(seed), veins = [];
        const bones = isMan ? BONES_M : BONES_F;

        for (let bi = 0; bi < bones.length; bi++) {
            const B = bones[bi];
            const baseDur = B[3] - B[2];
            const type = B[4];
            const isHandFoot = ['hand', 'foot'].includes(type);

            // 1. PRIMARY STRUCTURAL VESSELS (Clean silhouettes)
            let np = isMan ? 5 : 6;
            if (isHandFoot) np = 2;

            for (let v = 0; v < np; v++) {
                let po = (R() - .5) * (isMan ? .04 : .05);
                // Strictly constrained expansion to prevent messy overlaps
                if (type === 'thigh') po *= 1.2;
                if (type === 'calf') po *= 1.0;
                if (type === 'chest') po *= 1.1;
                if (isHandFoot) po *= 0.3;

                const segs = []; for (let i = 0; i <= SEG; i++) {
                    const t = i / SEG;
                    segs.push(getMuscleOffset(t, type, isMan) * Math.sign(po) * 1.5); // Push distinctly outward based on side for smooth edges
                }
                veins.push({ bi, po, segs, delay: B[2], dur: baseDur, branches: [], isPrimary: true });
            }

            // 2. SECONDARY TEXTURE VESSELS (Drastically reduced, strictly constrained)
            // Avoid clutter completely.
            let ns = 1;

            for (let v = 0; v < ns; v++) {
                let po = (R() - .5) * .04;

                const segs = []; for (let i = 0; i <= SEG; i++) {
                    const t = i / SEG;
                    segs.push(getMuscleOffset(t, type, isMan) * Math.sign(po) * 1.2);
                }

                const branches = [];
                veins.push({ bi, po, segs, delay: B[2] + R() * .05, dur: baseDur * (.8 + R() * .4), branches, isPrimary: false });
            }
        }
        return veins;
    }
    const boyV = genVeins(42, true), girlV = genVeins(108, false);

    // ═══ DENSE 3D HEART INTERIOR ═══
    const layer1Arteries = [], layer2Branches = [], layer3Capillaries = [];
    (function () {
        const R = rng(999);
        for (let i = 0; i < 180; i++) {
            const t = (i / 180) * Math.PI * 2, hp = hPt(t);
            const inwardAng = Math.atan2(-hp[1], -hp[0]) + (R() - .5) * .6;
            const len = .08 + R() * .25; const pts = []; let x = hp[0], y = hp[1];
            for (let s = 0; s < 10; s++) { x += Math.cos(inwardAng + (R() - .5) * .4) * (len / 10); y += Math.sin(inwardAng + (R() - .5) * .4) * (len / 10); pts.push([x, y]) }
            const br = []; for (let b = 0; b < 2 + Math.floor(R() * 3); b++) {
                const si = 2 + Math.floor(R() * 7), ba = inwardAng + (R() - .5) * 1.8, bl = .03 + R() * .1;
                const bp = []; let bx = pts[Math.min(si, 9)][0], by = pts[Math.min(si, 9)][1];
                for (let s = 0; s < 4; s++) { bx += Math.cos(ba + (R() - .5) * .5) * (bl / 4); by += Math.sin(ba + (R() - .5) * .5) * (bl / 4); bp.push([bx, by]) }
                br.push({ si: Math.min(si, 9), pts: bp })
            }
            layer1Arteries.push({ s: [hp[0], hp[1]], pts, br, d: R() * .3 });
        }
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
        for (let i = 0; i < 300; i++) {
            const t = R() * Math.PI * 2, rad = Math.sqrt(R()) * .9, hp = hPt(t);
            const x0 = hp[0] * rad, y0 = hp[1] * rad, ang = R() * Math.PI * 2, len = .02 + R() * .05;
            const pts = []; let x = x0, y = y0;
            for (let s = 0; s < 5; s++) { x += Math.cos(ang + (R() - .5) * 1) * (len / 5); y += Math.sin(ang + (R() - .5) * 1) * (len / 5); pts.push([x, y]) }
            layer3Capillaries.push({ s: [x0, y0], pts, br: [], d: .3 + R() * .6 });
        }
    })();

    // ═══ MAGICAL MORPH PARTICLES ═══
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
            const dx = p.tx - p.x, dy = p.ty - p.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 40) { p.vx -= dy * .01; p.vy += dx * .01 }
            p.vx *= .95; p.vy *= .95; p.x += p.vx; p.y += p.vy;
            p.a = Math.min(.8, p.a + .02);
            if (dist < 25) p.a *= .90;
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
    function drawVBatch(veins, bones, pose, growth, morphT, alpha, isPrimaryPass, isGirl) {
        ctx.beginPath();
        for (const v of veins) {
            if (v.isPrimary !== isPrimaryPass) continue;

            const B = bones[v.bi]; const gp = clamp((growth - v.delay) / v.dur, 0, 1); if (gp <= 0) continue;
            let a = pose[B[0]], b = pose[B[1]]; if (!a || !b) continue;

            if (morphT > 0 && morphT < .2) {
                const mt = easeIO(morphT * 5);
                a = [a[0], a[1] - mt * .08]; b = [b[0], b[1] - mt * .08];
            }

            const [ax, ay] = toWFig(a[0], a[1]), [bx, by] = toWFig(b[0], b[1]);
            const dx = bx - ax, dy = by - ay, ln = Math.sqrt(dx * dx + dy * dy) || 1;
            let px = -dy / ln, py = dx / ln;

            const vis = Math.max(2, Math.floor(gp * (SEG + 1)));

            for (let i = 0; i <= SEG; i++) {
                const t = i / SEG, x = ax + dx * t + px * (v.po + v.segs[i]) * scFig, y = ay + dy * t + py * (v.po + v.segs[i]) * scFig;
                if (i === 0) ctx.moveTo(x, y); else if (i < vis) ctx.lineTo(x, y)
            }

            for (const br of v.branches) {
                if (br.st > gp) continue;
                const si = Math.floor(br.st * SEG); if (si >= vis) continue;
                const t = si / SEG, ox = ax + dx * t + px * (v.po + v.segs[si]) * scFig, oy = ay + dy * t + py * (v.po + v.segs[si]) * scFig;
                ctx.moveTo(ox, oy);
                for (const p of br.pts) {
                    const bx = p.x * dx - p.y * dy;
                    const by = p.x * dy + p.y * dx;
                    ctx.lineTo(ox + bx * 10, oy + by * 10);
                }
            }
        }

        if (isPrimaryPass) {
            // Bold distinct line widths mimicking stylized biology
            ctx.strokeStyle = `rgba(220,55,70,${alpha * .9})`;
            ctx.lineWidth = isGirl ? 5.5 : 4.5;
            ctx.lineCap = 'round';
        } else {
            ctx.strokeStyle = `rgba(210,30,45,${alpha * .35})`;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
        }
        ctx.stroke();
    }

    function drawHead(pose, growth, morphT, alpha, isGirl) {
        if (!pose.nk) return; const gp = clamp((growth - .02) / .23, 0, 1); if (gp <= 0) return;
        let nk = pose.nk;
        if (morphT > 0 && morphT < .2) { const mt = easeIO(morphT * 5); nk = [nk[0], nk[1] - mt * .08] }

        const headOffset = isGirl ? -.065 : -.08;
        const [hx, hy] = toWFig(nk[0], nk[1] + headOffset);
        const rScale = isGirl ? .050 : .058;
        const r = scFig * rScale * gp;

        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += .15) {
            const rVar = r * (.98 + Math.sin(i * 9) * .02);
            const x = hx + Math.cos(i) * rVar, y = hy + Math.sin(i) * rVar;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(220,50,65,${alpha})`; ctx.lineWidth = isGirl ? 3.0 : 4.0; ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            ctx.moveTo(hx + (Math.random() - .5) * r * 1.1, hy + (Math.random() - .5) * r * 1.1);
            ctx.lineTo(hx + (Math.random() - .5) * r * 1.1, hy + (Math.random() - .5) * r * 1.1);
        }
        ctx.strokeStyle = `rgba(220,50,65,${alpha * .5})`; ctx.lineWidth = 2.0; ctx.stroke();
    }

    function drawFig(veins, bones, pose, growth, morphT, alpha, isGirl) {
        drawVBatch(veins, bones, pose, growth, morphT, alpha, true, isGirl);
        drawVBatch(veins, bones, pose, growth, morphT, alpha, false, isGirl);
        drawHead(pose, growth, morphT, alpha * .9, isGirl);
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

        const rgb = isInner ? "255,80,95" : "200,30,45";
        const a = alpha * al * (.6 + pulse * .4);
        ctx.strokeStyle = `rgba(${rgb},${a})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    }

    function drawHeart(progress, pulse, alpha) {
        renderHeartLayer(layer3Capillaries, progress, .8, .3, pulse, alpha, false);
        renderHeartLayer(layer2Branches, progress, 1.8, .4, pulse, alpha, false);
        renderHeartLayer(layer1Arteries, progress, 3.5, .7, pulse, alpha, true);

        ctx.beginPath(); for (let i = 0; i < HP.length; i++) { const [x, y] = toWHrt(HP[i][0], HP[i][1]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
        ctx.closePath();
        const oa = alpha * (.5 + pulse * .5);
        ctx.strokeStyle = `rgba(240,40,65,${oa})`; ctx.lineWidth = 3.5;
        ctx.shadowColor = `rgba(255,30,50,${oa * .7})`; ctx.shadowBlur = 18; ctx.stroke(); ctx.shadowBlur = 0;

        if (progress > .7) {
            const ia = clamp((progress - .7) / .3, 0, 1) * alpha;
            ctx.beginPath(); for (let i = 0; i < HP.length; i++) { const [x, y] = toWHrt(HP[i][0], HP[i][1]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
            ctx.closePath();
            const fg = ctx.createRadialGradient(cx - 30, cy - 40, 0, cx, cy, scHeart * .48);
            const fi = ia * .12 * (.6 + pulse * .4);
            fg.addColorStop(0, `rgba(255,80,90,${fi * 1.5})`);
            fg.addColorStop(.4, `rgba(220,30,50,${fi})`);
            fg.addColorStop(1, 'rgba(80,5,15,0)');
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
        if (sec < TD) return { b: aB, g: aG };
        if (sec < TA) { const t = easeIO(clamp((sec - TD) / AP, 0, 1)); return { b: lerpP(aB, apB, t), g: lerpP(aG, apG, t) } }
        if (sec < TP) { const t = easeIO(clamp((sec - TA) / PR, 0, 1)); return { b: lerpP(apB, pB, t), g: lerpP(apG, pG, t) } }
        if (sec < TR) { const t = easeIO(clamp((sec - TP) / RS, 0, 1)); return { b: lerpP(pB, rB, t), g: lerpP(pG, rG, t) } }
        if (sec < TM) { const t = sec - TR; return getDancePoses(t); }
        return getDancePoses(DN);
    }

    // ═══ MASTER LOOP ═══
    function animate(ts) {
        if (!st) st = ts; const el = ts - st, sec = el / 1000;
        ctx.clearRect(0, 0, W, H); drawGlow(0, 1);

        const beatP = (sec % 1.2) / 1.2, pulse = Math.sin(beatP * Math.PI) ** 4;
        const ambA = clamp(sec / 4, 0, 1); drawGlow(pulse, ambA);

        const growth = clamp(sec / GR, 0, 1);
        const morphT = sec >= TM ? clamp((sec - TM) / MO, 0, 1) : 0;

        const figA = morphT < .15 ? 1 - (morphT / .15) : 0;
        const { b: boyP, g: girlP } = getPoses(sec);

        if (sec >= TA && sec < TM) {
            const pBst = Math.sin((sec - TA) / (TM - TA) * Math.PI) * .08;
            ctx.fillStyle = `rgba(255,20,40,${pBst})`; ctx.fillRect(0, 0, W, H)
        }

        if (figA > .01) { drawFig(boyV, BONES_M, boyP, growth, morphT, figA, false); drawFig(girlV, BONES_F, girlP, growth, morphT, figA, true) }

        if (morphT > 0) initMorph(boyP, girlP);
        if (morphT > 0 && morphT < 1) { updateMorph(morphT); drawMorphP() }

        if (morphT > .1) {
            const hA = clamp((morphT - .1) / .6, 0, 1);
            const hProg = clamp((morphT - .15) / .85, 0, 1);

            if (morphT >= 1) {
                const breath = 1 + (pulse * .015);
                ctx.save(); ctx.translate(cx, cy); ctx.scale(breath, breath); ctx.translate(-cx, -cy);
            } else {
                const zs = 1 + easeOut(morphT) * .06;
                ctx.save(); ctx.translate(cx, cy); ctx.scale(zs, zs); ctx.translate(-cx, -cy);
            }

            drawHeart(hProg, pulse, hA)
            if (morphT > .3) drawAmb(el, clamp((morphT - .3) / .3, 0, 1));
            ctx.restore();
        }

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
