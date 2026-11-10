"""Human host for Dig Deeper: a cartoon explorer with the Dig Deeper miner's helmet.

draw_human(ctx, x, y, s, t, ...) uses the same anchor as Chloe: (x, y) is body
centre and the feet touch the ground at y + 95*s.
"""
import math, cairo

PAL = dict(skin='#f1c7a3', skin2='#e3ad86', hair='#4a2f22', jacket='#2f7fd6', jacket2='#2569b5',
           shirt='#ffffff', pants='#3b3f58', shoe='#2a2a33', ink='#2d2833', helmet1='#ffe066', helmet2='#f4b400', brim='#e09a00')

def _hex(h, a=1.0):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4)) + (a,)

def _ell(ctx, cx, cy, rx, ry):
    ctx.save(); ctx.translate(cx, cy); ctx.scale(max(rx, .01), max(ry, .01)); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore()

def _rr(ctx, x, y, w, h, r):
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi/2, 0); ctx.arc(x + w - r, y + h - r, r, 0, math.pi/2)
    ctx.arc(x + r, y + h - r, r, math.pi/2, math.pi); ctx.arc(x + r, y + r, r, math.pi, 3*math.pi/2); ctx.close_path()

def _limb(ctx, x0, y0, ang, ln, w, col, hand=None):
    x1 = x0 + math.cos(ang)*ln; y1 = y0 + math.sin(ang)*ln
    ctx.set_source_rgba(*_hex(col)); ctx.set_line_width(w); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.move_to(x0, y0); ctx.line_to(x1, y1); ctx.stroke()
    if hand:
        ctx.set_source_rgba(*_hex(hand)); ctx.arc(x1, y1, w*0.62, 0, 2*math.pi); ctx.fill()
    return x1, y1

def draw_human(ctx, x, y, s, t, facing=1, mouth=0.0, blink=False, eye=1.0, pose='idle', step=0.0, rot=0.0, P=PAL):
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s*facing, s)
    ctx.set_source_rgba(0, 0, 0, 0.18); _ell(ctx, 0, 95, 70, 12); ctx.fill()
    # legs
    sw = math.sin(step)*0.45
    for k, ph in ((-14, sw), (14, -sw)):
        hx, hy = k, 20
        fx, fy = _limb(ctx, hx, hy, math.pi/2 + ph, 70, 26, P['pants'])
        ctx.set_source_rgba(*_hex(P['shoe'])); _ell(ctx, fx + 10, min(fy + 4, 92), 20, 10); ctx.fill()
    # back arm
    arm_y = -62
    back = {'wave': math.pi*0.6, 'think': math.pi*0.55, 'wow': math.pi*0.85, 'wipe': math.pi*0.6}.get(pose, math.pi*0.55)
    _limb(ctx, -26, arm_y, back + math.sin(t*2)*0.03, 62, 20, P['jacket2'], P['skin2'])
    # body (jacket)
    g = cairo.LinearGradient(0, -80, 0, 30)
    g.add_color_stop_rgb(0, *_hex(P['jacket'])[:3]); g.add_color_stop_rgb(1, *_hex(P['jacket2'])[:3])
    ctx.set_source(g); _rr(ctx, -40, -82, 80, 112, 30); ctx.fill()
    ctx.set_source_rgba(*_hex(P['shirt'])); ctx.move_to(-10, -82); ctx.line_to(10, -82); ctx.line_to(0, -55); ctx.close_path(); ctx.fill()
    ctx.set_source_rgba(*_hex('#ffd23f')); _rr(ctx, 12, -52, 18, 14, 4); ctx.fill()  # badge
    # neck + head
    ctx.set_source_rgba(*_hex(P['skin2'])); _rr(ctx, -9, -96, 18, 18, 6); ctx.fill()
    hy = -140
    ctx.set_source_rgba(*_hex(P['skin'])); _ell(ctx, 4, hy, 46, 50); ctx.fill()
    ctx.set_source_rgba(*_hex(P['skin2'])); _ell(ctx, -38, hy + 4, 9, 13); ctx.fill()  # ear
    # hair (back + fringe under helmet)
    ctx.set_source_rgba(*_hex(P['hair'])); _ell(ctx, -22, hy - 14, 30, 34); ctx.fill()
    ctx.move_to(-40, hy - 26); ctx.curve_to(-10, hy - 14, 20, hy - 20, 46, hy - 30); ctx.line_to(46, hy - 44); ctx.line_to(-40, hy - 44); ctx.close_path(); ctx.fill()
    # eyes
    for ex in (10, 34):
        if blink:
            ctx.set_source_rgba(*_hex(P['ink'])); ctx.set_line_width(3.5)
            ctx.move_to(ex - 8, hy - 2); ctx.curve_to(ex - 4, hy + 3, ex + 4, hy + 3, ex + 8, hy - 2); ctx.stroke()
        else:
            ctx.set_source_rgba(1, 1, 1, 1); _ell(ctx, ex, hy - 2, 9*eye, 11*eye); ctx.fill()
            ctx.set_source_rgba(*_hex('#2b1d16')); _ell(ctx, ex + 2.5, hy, 5.5*eye, 6.5*eye); ctx.fill()
            ctx.set_source_rgba(1, 1, 1, 1); ctx.arc(ex + 4, hy - 3, 2, 0, 2*math.pi); ctx.fill()
    ctx.set_source_rgba(*_hex(P['hair'])); ctx.set_line_width(4); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    lift = 4 if pose == 'wow' else 0
    for ex in (10, 34):
        ctx.move_to(ex - 8, hy - 17 - lift); ctx.line_to(ex + 7, hy - 19 - lift); ctx.stroke()
    # nose + cheek
    ctx.set_source_rgba(*_hex(P['skin2'])); _ell(ctx, 44, hy + 8, 6, 5); ctx.fill()
    ctx.set_source_rgba(*_hex('#f2928a', 0.45)); _ell(ctx, 30, hy + 16, 8, 5); ctx.fill()
    # mouth
    if mouth > 0.08:
        ctx.set_source_rgba(*_hex('#6b2630')); _ell(ctx, 26, hy + 26, 9, 2 + 8*mouth); ctx.fill()
        ctx.set_source_rgba(*_hex('#ff9aa8')); _ell(ctx, 26, hy + 29 + 3*mouth, 5, 1.5 + 2.5*mouth); ctx.fill()
    else:
        ctx.set_source_rgba(*_hex(P['ink'])); ctx.set_line_width(3)
        ctx.move_to(16, hy + 22); ctx.curve_to(22, hy + 30, 32, hy + 30, 37, hy + 22); ctx.stroke()
    # helmet
    hg = cairo.LinearGradient(0, hy - 92, 0, hy - 30)
    hg.add_color_stop_rgb(0, *_hex(P['helmet1'])[:3]); hg.add_color_stop_rgb(1, *_hex(P['helmet2'])[:3])
    ctx.set_source(hg); ctx.move_to(-46, hy - 34); ctx.curve_to(-46, hy - 100, 56, hy - 100, 56, hy - 34); ctx.close_path(); ctx.fill()
    ctx.set_source_rgba(*_hex(P['brim'])); _rr(ctx, -52, hy - 40, 116, 13, 6); ctx.fill()
    ctx.set_source_rgba(*_hex('#9aa3ad')); _ell(ctx, 30, hy - 64, 15, 13); ctx.fill()
    ctx.set_source_rgba(*_hex('#fffbe0')); _ell(ctx, 33, hy - 64, 9, 8); ctx.fill()
    # front arm by pose
    sx, sy = 26, arm_y
    if pose == 'wave':
        a = -math.pi*0.22 + math.sin(t*9)*0.3
    elif pose == 'point':
        a = -0.25
    elif pose == 'think':
        a = -math.pi*0.62
    elif pose == 'wow':
        a = -math.pi*0.3
    elif pose == 'wipe':
        a = -math.pi*0.72 + math.sin(t*10)*0.15
    elif pose in ('walk', 'run'):
        a = math.pi*0.5 - math.sin(step)*0.5
    elif pose == 'dig':
        a = 0.2 + math.sin(t*14)*0.6
    else:
        a = math.pi*0.42 + math.sin(t*2.4)*0.04
    ln = 44 if pose in ('think', 'wipe') else 62
    _limb(ctx, sx, sy, a, ln, 20, P['jacket'], P['skin'])
    ctx.restore()
