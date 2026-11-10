"""Stickman narrator for Dig Deeper.

draw_stick(ctx, x, y, s, t, ...) uses the same anchor as Chloe: (x, y) is the
body centre and the feet touch the ground at y + 95*s. The figure is about
260*s tall (head top at y - 165*s).
"""
import math, cairo

INK = (0.13, 0.12, 0.16)
COAT = (0.44, 0.33, 0.21)
VEST = (0.62, 0.50, 0.20)
TASH = (0.30, 0.20, 0.12)
CANE = (0.25, 0.15, 0.08)
CAP = (0.55, 0.44, 0.31)
CAP2 = (0.42, 0.32, 0.22)
GOLD = (0.93, 0.74, 0.25)
PIPE = (0.45, 0.26, 0.13)
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
    bpts = _arm(sh, back[0] + sway, back[1])
    _seg(ctx, bpts, LW)
    if pose not in ('wow', 'jump', 'swim', 'shrug'):
        hx, hy = bpts[-1]
        for col, lw in ((HALO, 12), (CANE, 6)):
            ctx.set_source_rgb(*col); ctx.set_line_width(lw); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
            ctx.move_to(hx, hy - 6); ctx.line_to(hx - 6, 95); ctx.stroke()
        ctx.set_source_rgb(*HALO); ctx.arc(hx, hy - 8, 9, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgb(*GOLD); ctx.arc(hx, hy - 8, 6.5, 0, 2*math.pi); ctx.fill()
    _seg(ctx, [hip, neck], LW + 1)
    # gentleman tailcoat with tails, white shirt front and bow tie
    def coat_path():
        ctx.move_to(-17, -70); ctx.line_to(17, -70); ctx.line_to(19, 4); ctx.line_to(8, 6)
        ctx.line_to(-6, 34 + math.sin(t*3)*2); ctx.line_to(-20, 30 + math.sin(t*3)*2); ctx.line_to(-19, -40); ctx.close_path()
    ctx.set_source_rgb(*HALO); ctx.set_line_width(7); coat_path(); ctx.stroke()
    ctx.set_source_rgb(*COAT); coat_path(); ctx.fill()
    ctx.save(); coat_path(); ctx.clip(); ctx.set_source_rgba(0.25, 0.17, 0.10, 0.35); ctx.set_line_width(1.4)
    for k in range(-80, 40, 8): ctx.move_to(-30, k); ctx.line_to(30, k + 3); ctx.stroke()
    for k in range(-30, 30, 8): ctx.move_to(k, -80); ctx.line_to(k + 2, 40); ctx.stroke()
    ctx.restore()
    ctx.set_source_rgb(*VEST); ctx.move_to(-9, -66); ctx.line_to(12, -66); ctx.line_to(13, -6); ctx.line_to(1, 0); ctx.line_to(-10, -6); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(1, 1, 1); ctx.move_to(-8, -70); ctx.line_to(10, -70); ctx.line_to(1, -44); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(*GOLD)
    for by in (-36, -24, -12): ctx.arc(1.5, by, 2.4, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgb(0.75, 0.1, 0.15)
    ctx.move_to(1, -60); ctx.line_to(-11, -67); ctx.line_to(-11, -53); ctx.close_path(); ctx.fill()
    ctx.move_to(1, -60); ctx.line_to(13, -67); ctx.line_to(13, -53); ctx.close_path(); ctx.fill()
    ctx.arc(1, -60, 3.5, 0, 2*math.pi); ctx.fill()
    # head
    hc = (6, -112); r = 40
    ctx.set_source_rgb(*HALO); ctx.arc(hc[0], hc[1], r + 6, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgb(1, 1, 1); ctx.arc(hc[0], hc[1], r, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgb(*INK); ctx.set_line_width(LW - 2); ctx.arc(hc[0], hc[1], r, 0, 2*math.pi); ctx.stroke()
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
    my = hc[1] + 16; fx = fx - 4
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
    # handlebar moustache
    tx, ty = fx - 2, hc[1] + 10
    ctx.set_source_rgb(*TASH)
    for d in (-1, 1):
        ctx.move_to(tx, ty); ctx.curve_to(tx + d*8, ty - 6, tx + d*18, ty - 4, tx + d*22, ty + 2)
        ctx.curve_to(tx + d*26, ty + 6, tx + d*30, ty + 2, tx + d*28, ty - 4)
        ctx.curve_to(tx + d*32, ty + 4, tx + d*26, ty + 10, tx + d*20, ty + 7)
        ctx.curve_to(tx + d*12, ty + 5, tx + d*6, ty + 6, tx, ty + 4); ctx.close_path(); ctx.fill()
    # monocle on the front eye, with a gold chain
    mx, myy = fx + 14, hc[1] - 6
    ctx.set_source_rgba(0.8, 0.9, 1.0, 0.35); ctx.arc(mx, myy, 11, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgb(*GOLD); ctx.set_line_width(3.2); ctx.arc(mx, myy, 11, 0, 2*math.pi); ctx.stroke()
    ctx.set_line_width(1.6); ctx.move_to(mx + 8, myy + 8)
    ctx.curve_to(mx + 22, myy + 36, mx + 10, myy + 58, mx - 4, myy + 70); ctx.stroke()
    # English tweed flat cap (country / shooting cap), brim toward the facing side
    ctx.save(); ctx.translate(hc[0], hc[1] - 30)
    def cap_path():
        ctx.move_to(-42, 4); ctx.curve_to(-46, -22, -10, -34, 20, -26)
        ctx.curve_to(40, -20, 52, -8, 50, 2); ctx.curve_to(30, 6, -10, 8, -42, 4); ctx.close_path()
    ctx.set_source_rgb(*HALO); ctx.set_line_width(8); cap_path(); ctx.stroke()
    ctx.set_source_rgb(*CAP); cap_path(); ctx.fill()
    ctx.save(); cap_path(); ctx.clip()
    ctx.set_source_rgba(0.30, 0.22, 0.14, 0.45); ctx.set_line_width(1.6)
    for k in range(-50, 60, 9): ctx.move_to(k, -40); ctx.line_to(k + 14, 10); ctx.stroke()
    for k in range(-34, 10, 9): ctx.move_to(-50, k); ctx.line_to(56, k + 4); ctx.stroke()
    ctx.restore()
    ctx.set_source_rgb(*HALO); ctx.move_to(18, -2); ctx.curve_to(40, -4, 62, 0, 68, 6); ctx.curve_to(56, 12, 34, 10, 16, 6); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(*CAP2); ctx.move_to(20, 0); ctx.curve_to(40, -2, 58, 2, 64, 6); ctx.curve_to(54, 9, 34, 8, 18, 5); ctx.close_path(); ctx.fill()
    ctx.restore()
    # pipe at the front corner of the mouth
    px0, py0 = fx + 12, hc[1] + 17
    for col, lw in ((HALO, 9), (PIPE, 4.5)):
        ctx.set_source_rgb(*col); ctx.set_line_width(lw); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.move_to(px0, py0); ctx.curve_to(px0 + 12, py0 + 4, px0 + 20, py0 + 6, px0 + 28, py0 + 2); ctx.stroke()
    ctx.set_source_rgb(*HALO); ctx.move_to(px0 + 22, py0 - 12); ctx.line_to(px0 + 40, py0 - 12); ctx.line_to(px0 + 37, py0 + 8)
    ctx.curve_to(px0 + 36, py0 + 14, px0 + 26, py0 + 14, px0 + 25, py0 + 8); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(*PIPE); ctx.move_to(px0 + 25, py0 - 9); ctx.line_to(px0 + 37, py0 - 9); ctx.line_to(px0 + 35, py0 + 6)
    ctx.curve_to(px0 + 34, py0 + 10, px0 + 28, py0 + 10, px0 + 27, py0 + 6); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(0.2, 0.1, 0.05); ctx.save(); ctx.translate(px0 + 31, py0 - 9); ctx.scale(6, 2); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore(); ctx.fill()
    # front arm last so gestures read over the body/head
    _seg(ctx, _arm(sh, front[0] - sway, front[1]), LW)
    ctx.restore()
