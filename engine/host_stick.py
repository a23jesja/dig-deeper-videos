"""Stickman narrator for Dig Deeper.

draw_stick(ctx, x, y, s, t, ...) uses the same anchor as Chloe: (x, y) is the
body centre and the feet touch the ground at y + 95*s. The figure is about
260*s tall (head top at y - 165*s).
"""
import math, cairo

INK = (0.13, 0.12, 0.16)
SCARF = (1.0, 0.45, 0.10)
SCARF2 = (0.85, 0.30, 0.05)
HALO = (1, 1, 1)
LW = 11

POSES = {
    #        back arm (shoulder, elbow)   front arm (shoulder, elbow)   radians, pi/2 = straight down
    'idle':  ((1.85, 0.25), (1.30, -0.25)),
    'wave':  ((1.85, 0.25), (0.05, -1.1)),
    'point': ((1.85, 0.25), (-0.05, 0.0)),
    'wow':   ((-2.6, 0.3), (-0.5, -0.3)),
    'jump':  ((-2.6, 0.3), (-0.5, -0.3)),
    'think': ((1.85, 0.25), (0.55, -2.2)),
    'wipe':  ((1.85, 0.25), (-0.2, -1.09)),
    'dig':   ((0.6, 0.4), (0.35, 0.4)),
    'shrug': ((2.6, -1.3), (0.55, 1.3)),
}

def _seg(ctx, pts, w):
    for col, lw in ((HALO, w + 7), (INK, w)):
        ctx.set_source_rgb(*col); ctx.set_line_width(lw)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.move_to(*pts[0])
        for p in pts[1:]: ctx.line_to(*p)
        ctx.stroke()

def _arm(sh, a1, a2, l1=36, l2=34):
    e = (sh[0] + math.cos(a1)*l1, sh[1] + math.sin(a1)*l1)
    h = (e[0] + math.cos(a1 + a2)*l2, e[1] + math.sin(a1 + a2)*l2)
    return [sh, e, h]

def draw_stick(ctx, x, y, s, t, facing=1, mouth=0.0, blink=False, eye=1.0, pose='idle', step=0.0, rot=0.0):
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s*facing, s)
    ctx.set_source_rgba(0, 0, 0, 0.18); ctx.save(); ctx.translate(0, 96); ctx.scale(55, 9); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore(); ctx.fill()
    hip = (0, 12); neck = (0, -70); sh = (0, -56)
    # legs
    sw = math.sin(step)*0.5
    for ph in (sw + 0.13, -sw - 0.13):
        knee = (hip[0] + math.sin(ph)*42, hip[1] + math.cos(ph)*42)
        foot = (knee[0] + math.sin(ph*0.6)*42, knee[1] + math.cos(ph*0.6)*42)
        foot = (foot[0], min(foot[1], 95))
        _seg(ctx, [hip, knee, foot, (foot[0] + 12, foot[1])], LW)
    # arms
    back, front = POSES.get(pose, POSES['idle'])
    sway = math.sin(t*2.2)*0.05
    if pose in ('walk', 'run'):
        back = (math.pi/2 + math.sin(step)*0.6, -0.3); front = (math.pi/2 - math.sin(step)*0.6, -0.3)
    if pose == 'wave':
        front = (front[0], front[1] + math.sin(t*9)*0.35)
    if pose == 'dig':
        front = (front[0] + math.sin(t*14)*0.5, front[1]); back = (back[0] + math.sin(t*14 + 2)*0.5, back[1])
    if pose == 'swim':
        back = (t*5 % (2*math.pi), 0.2); front = ((t*5 + math.pi) % (2*math.pi), 0.2)
    # scarf tail flowing behind (signature look)
    wv = math.sin(t*5)
    ctx.set_source_rgb(*SCARF2)
    ctx.move_to(-8, -72); ctx.curve_to(-30, -70 + wv*4, -46, -60 - wv*6, -64, -52 + wv*8)
    ctx.line_to(-60, -40 + wv*8); ctx.curve_to(-44, -48 - wv*5, -28, -56 + wv*3, -6, -60); ctx.close_path(); ctx.fill()
    _seg(ctx, _arm(sh, back[0] + sway, back[1]), LW)
    _seg(ctx, [hip, neck], LW + 1)
    # head
    hc = (6, -112); r = 40
    ctx.set_source_rgb(*HALO); ctx.arc(hc[0], hc[1], r + 6, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgb(1, 1, 1); ctx.arc(hc[0], hc[1], r, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgb(*INK); ctx.set_line_width(LW - 2); ctx.arc(hc[0], hc[1], r, 0, 2*math.pi); ctx.stroke()
    # signature hair curl
    for col, lw in ((HALO, 12), (INK, 5)):
        ctx.set_source_rgb(*col); ctx.set_line_width(lw); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.move_to(2, -151); ctx.curve_to(-2, -172, 22, -182, 24, -166); ctx.curve_to(25, -156, 12, -156, 13, -164); ctx.stroke()
    # scarf band around the neck
    ctx.set_source_rgb(*HALO); ctx.save(); ctx.translate(0, -68); ctx.scale(30, 13); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore(); ctx.fill()
    ctx.set_source_rgb(*SCARF); ctx.save(); ctx.translate(0, -68); ctx.scale(26, 10); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore(); ctx.fill()
    ctx.set_source_rgb(1, 0.85, 0.3); ctx.set_line_width(3)
    for k in (-10, 4):
        ctx.move_to(k, -77); ctx.line_to(k + 4, -59); ctx.stroke()
    # face (looks toward facing direction)
    fx = hc[0] + 10
    for ex in (fx - 12, fx + 14):
        if blink:
            ctx.set_source_rgb(*INK); ctx.set_line_width(3.5)
            ctx.move_to(ex - 7, hc[1] - 6); ctx.curve_to(ex - 3, hc[1] - 1, ex + 3, hc[1] - 1, ex + 7, hc[1] - 6); ctx.stroke()
        else:
            ctx.set_source_rgb(*INK); ctx.save(); ctx.translate(ex, hc[1] - 6); ctx.scale(5.5*eye, 7.5*eye); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore(); ctx.fill()
            ctx.set_source_rgb(1, 1, 1); ctx.arc(ex + 1.8, hc[1] - 8.5, 1.8, 0, 2*math.pi); ctx.fill()
    lift = 6 if pose in ('wow', 'jump') else (-3 if pose == 'think' else 0)
    ctx.set_source_rgb(*INK); ctx.set_line_width(3.5); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    for ex in (fx - 12, fx + 14):
        ctx.move_to(ex - 7, hc[1] - 20 - lift); ctx.line_to(ex + 6, hc[1] - 22 - lift); ctx.stroke()
    my = hc[1] + 16
    if mouth > 0.08:
        ctx.set_source_rgb(*INK); ctx.save(); ctx.translate(fx + 2, my); ctx.scale(9, 2 + 8*mouth); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore(); ctx.fill()
    elif pose in ('wow', 'jump'):
        ctx.set_source_rgb(*INK); ctx.arc(fx + 2, my, 6, 0, 2*math.pi); ctx.fill()
    else:
        ctx.set_source_rgb(*INK); ctx.set_line_width(3.5)
        ctx.move_to(fx - 8, my - 3); ctx.curve_to(fx - 2, my + 5, fx + 7, my + 5, fx + 12, my - 3); ctx.stroke()
    if pose == 'wipe':
        dy = (t*0.9 % 1.0)*30
        ctx.set_source_rgb(0.35, 0.7, 1.0); ctx.move_to(-30, -138 + dy); ctx.curve_to(-38, -124 + dy, -40, -116 + dy, -30, -114 + dy)
        ctx.curve_to(-20, -116 + dy, -22, -124 + dy, -30, -138 + dy); ctx.fill()
    # front arm last so gestures read over the body/head
    _seg(ctx, _arm(sh, front[0] - sway, front[1]), LW)
    ctx.restore()
