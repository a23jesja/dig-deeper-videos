#!/usr/bin/env python3
"""Sir Digsworth video engine.

Usage:  python3 render.py episode.json out.mp4 [--preview]

Turns an episode JSON (scenes with narration, background, Chloe action,
emoji props, captions) into a finished 1280x720 MP4 with Chloe's voice
(Kokoro, voice af_heart), lip-sync, background music, subtitles, an intro
and a subscribe outro. See ../README.md for the episode format.
"""
import cairo, math, random, subprocess, sys, json, os, re, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from host_stick import draw_stick
import host_stick as HS

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1280, 720, 30
SR = 24000
INTRO, OUTRO, PAD, FADE = 3.2, 5.0, 0.55, 0.22
FONT = 'Poppins'

# ---------------------------------------------------------------- helpers
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out_back(x):
    x = clamp(x); c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def ease_out_cubic(x):
    x = clamp(x); return 1 - (1 - x)**3

def ease_io(x):
    x = clamp(x); return 0.5 - 0.5 * math.cos(math.pi * x)
def hexc(h, a=1.0):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4)) + (a,)
def rrect(ctx, x, y, w, h, r):
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi/2, 0); ctx.arc(x + w - r, y + h - r, r, 0, math.pi/2)
    ctx.arc(x + r, y + h - r, r, math.pi/2, math.pi); ctx.arc(x + r, y + r, r, math.pi, 3*math.pi/2)
    ctx.close_path()
def ellipse(ctx, cx, cy, rx, ry):
    ctx.save(); ctx.translate(cx, cy); ctx.scale(max(rx, 0.01), max(ry, 0.01)); ctx.arc(0, 0, 1, 0, 2*math.pi); ctx.restore()

def set_font(ctx, size, bold=True):
    ctx.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(size)

def text(ctx, s, x, y, size, col='#ffffff', outline='#3b2a1a', ow=8, align='center'):
    set_font(ctx, size)
    ext = ctx.text_extents(s)
    tx = x - ext.width/2 - ext.x_bearing if align == 'center' else x
    ctx.move_to(tx, y); ctx.text_path(s)
    if outline:
        ctx.set_source_rgba(*hexc(outline)); ctx.set_line_width(ow); ctx.set_line_join(cairo.LINE_JOIN_ROUND); ctx.stroke_preserve()
    ctx.set_source_rgba(*hexc(col)); ctx.fill()

def wrap(ctx, s, size, maxw):
    set_font(ctx, size); words = s.split(); lines, cur = [], ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if ctx.text_extents(t).x_advance > maxw and cur:
            lines.append(cur); cur = w_
        else:
            cur = t
    if cur: lines.append(cur)
    return lines

_emoji_cache = {}
EMOJI_INK = False
def emoji_surface(e, size):
    key = (e, size, EMOJI_INK)
    if key not in _emoji_cache:
        pad = int(size * 0.35); sz = int(size * 1.4) + pad
        s = cairo.ImageSurface(cairo.FORMAT_ARGB32, sz, sz); c = cairo.Context(s)
        c.select_font_face('Noto Color Emoji'); c.set_font_size(size)
        ext = c.text_extents(e)
        c.move_to(sz/2 - ext.width/2 - ext.x_bearing, sz/2 - ext.height/2 - ext.y_bearing)
        c.show_text(e)
        if EMOJI_INK:
            s.flush(); al = np.ndarray((sz, sz, 4), np.uint8, s.get_data())[..., 3].astype(np.float32)
            r = max(3, size // 22); dil = al.copy()
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    if dx*dx + dy*dy <= r*r: dil = np.maximum(dil, np.roll(np.roll(al, dy, 0), dx, 1))
            o = cairo.ImageSurface(cairo.FORMAT_ARGB32, sz, sz)
            ob = np.ndarray((sz, sz, 4), np.uint8, o.get_data())
            ob[..., 3] = dil.astype(np.uint8); ob[..., 0] = (dil*0.09).astype(np.uint8); ob[..., 1] = (dil*0.08).astype(np.uint8); ob[..., 2] = (dil*0.08).astype(np.uint8)
            o.mark_dirty(); oc = cairo.Context(o); oc.set_source_surface(s); oc.paint(); s = o
        _emoji_cache[key] = s
    return _emoji_cache[key]

def draw_emoji(ctx, e, x, y, size, scale=1.0, rot=0.0, alpha=1.0, sq=0.0):
    if scale <= 0.01 or alpha <= 0.01: return
    base = 128 if size <= 160 else 256
    s = emoji_surface(e, base)
    k = size / base * scale
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k*(1 + sq), k*(1 - sq))
    ctx.set_source_surface(s, -s.get_width()/2, -s.get_height()/2)
    ctx.paint_with_alpha(alpha); ctx.restore()

# ---------------------------------------------------------------- Chloe
CHLOE = dict(fur1='#77707f', fur2='#4a4452', belly='#8e8796', snout='#6b6473', nose1='#ffc2cf', nose2='#ef6f8f',
             paw='#f2a7b5', pawline='#d98597', helmet1='#ffe066', helmet2='#f4b400', brim='#e09a00', ink='#2d2833')

def chloe(ctx, x, y, s, t, facing=1, dig=0.0, blink=False, wipe=0.0, wave=0.0, mouth=0.0, eye=1.0, rot=0.0, step=0.0):
    C = CHLOE
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s*facing, s)
    ctx.set_source_rgba(0, 0, 0, 0.18); ellipse(ctx, 0, 95, 95, 14); ctx.fill()
    ctx.set_source_rgba(*hexc(C['paw']))
    ellipse(ctx, -45, 88 - max(0, math.sin(step))*10, 26, 12); ctx.fill()
    ellipse(ctx, 35, 90 - max(0, -math.sin(step))*10, 26, 12); ctx.fill()
    g = cairo.RadialGradient(-20, -20, 10, 0, 10, 130)
    g.add_color_stop_rgb(0, *hexc(C['fur1'])[:3]); g.add_color_stop_rgb(1, *hexc(C['fur2'])[:3])
    ctx.set_source(g); ellipse(ctx, 0, 20, 100, 82); ctx.fill()
    ctx.set_source_rgba(*hexc(C['belly'])); ellipse(ctx, 20, 38, 55, 48); ctx.fill()
    ctx.set_source_rgba(*hexc(C['snout'])); ellipse(ctx, 78, 8, 42, 28); ctx.fill()
    ctx.set_source_rgba(*hexc(C['ink'])); ctx.set_line_width(2.2); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    for dy, ang in ((-2, -0.25), (8, 0.0), (18, 0.25)):
        ctx.move_to(98, 10 + dy); ctx.line_to(98 + 40*math.cos(ang), 10 + dy + 40*math.sin(ang) + 6); ctx.stroke()
    ng = cairo.RadialGradient(118, 0, 2, 120, 4, 22)
    ng.add_color_stop_rgb(0, *hexc(C['nose1'])[:3]); ng.add_color_stop_rgb(1, *hexc(C['nose2'])[:3])
    ctx.set_source(ng); ellipse(ctx, 120, 4, 22, 18); ctx.fill()
    ctx.set_source_rgba(1, 1, 1, 0.7); ellipse(ctx, 114, -4, 6, 4); ctx.fill()
    ctx.set_source_rgba(*hexc('#f58ba4', 0.55)); ellipse(ctx, 58, 28, 13, 8); ctx.fill()
    for ex in (30, 58):
        if blink:
            ctx.set_source_rgba(*hexc(C['ink'])); ctx.set_line_width(4)
            ctx.move_to(ex-12, -18); ctx.curve_to(ex-6, -12, ex+6, -12, ex+12, -18); ctx.stroke()
        else:
            ctx.set_source_rgba(1, 1, 1, 1); ellipse(ctx, ex, -20, 15*eye, 18*eye); ctx.fill()
            ctx.set_source_rgba(*hexc('#1d1a22')); ellipse(ctx, ex+4, -17, 9*eye, 11*eye); ctx.fill()
            ctx.set_source_rgba(1, 1, 1, 1); ellipse(ctx, ex+7, -22, 3.5, 3.5); ctx.fill()
    if mouth > 0.08:
        ctx.set_source_rgba(*hexc('#5a2230')); ellipse(ctx, 102, 30, 10, 2.5 + 9*mouth); ctx.fill()
        ctx.set_source_rgba(*hexc('#ff8fa8')); ellipse(ctx, 102, 30 + 5*mouth, 6, 2 + 3*mouth); ctx.fill()
    else:
        ctx.set_source_rgba(*hexc(C['ink'])); ctx.set_line_width(3.5)
        ctx.move_to(92, 26); ctx.curve_to(98, 34, 108, 34, 112, 26); ctx.stroke()
    hg = cairo.LinearGradient(0, -110, 0, -40)
    hg.add_color_stop_rgb(0, *hexc(C['helmet1'])[:3]); hg.add_color_stop_rgb(1, *hexc(C['helmet2'])[:3])
    ctx.set_source(hg); ctx.move_to(-62, -48); ctx.curve_to(-62, -125, 72, -125, 72, -48); ctx.close_path(); ctx.fill()
    ctx.set_source_rgba(*hexc(C['brim'])); rrect(ctx, -72, -54, 154, 16, 8); ctx.fill()
    ctx.set_source_rgba(*hexc('#9aa3ad')); ellipse(ctx, 40, -86, 20, 18); ctx.fill()
    ctx.set_source_rgba(*hexc('#fffbe0')); ellipse(ctx, 44, -86, 13, 12); ctx.fill()
    for i, base in enumerate((0, math.pi)):
        a = math.sin(t*22 + base) * 0.9 * dig
        ctx.save()
        if wipe > 0 and i == 0:
            ctx.translate(20, -38); ctx.rotate(-2.3 + math.sin(t*10)*0.35*wipe)
        elif wave > 0 and i == 0:
            ctx.translate(95, -40); ctx.rotate(-1.3 + math.sin(t*9)*0.4)
        else:
            ctx.translate(70 - i*18, 55); ctx.rotate(0.3 + a)
        ctx.set_source_rgba(*hexc(C['paw'])); ellipse(ctx, 22, 0, 26, 17); ctx.fill()
        ctx.set_source_rgba(*hexc(C['pawline'])); ctx.set_line_width(2.5)
        for k in (-8, 0, 8):
            ctx.move_to(40, k*0.9); ctx.line_to(50, k*1.2); ctx.stroke()
        ctx.restore()
    ctx.restore()

STICK_POSE = {'dizzy': 'idle', 'sleep': 'idle', 'shiver': 'idle', 'none': 'idle'}
def is_stick(ep): return ep.get('host', 'chloe') == 'stick'
def draw_host(ctx, ep, x, y, s, t, facing=1, act='idle', blink=False, mouth=0.0, eye=1.0, rot=0.0, step=0.0, energy=0.0):
    if is_stick(ep):
        draw_stick(ctx, x, y, s, t, facing, mouth, blink, eye, STICK_POSE.get(act, act), step, rot, energy)
    else:
        chloe(ctx, x, y, s, t, facing, 1.0 if act == 'dig' else 0.0, blink, 1.0 if act == 'wipe' else 0.0,
              1.0 if act == 'wave' else 0.0, mouth, eye, rot, step)

# ---------------------------------------------------------------- noir grading (moody hand-drawn look)
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
_VIG = (1.0 - 0.55*np.clip(((_xx - W/2)/(W*0.62))**2 + ((_yy - H/2)/(H*0.62))**2, 0, 1)**1.3).astype(np.float32)[..., None]
_GRAIN = [np.random.RandomState(k).normal(0, 3.5, (H, W, 1)).astype(np.float32) for k in range(6)]
def style_of(ep): return ep.get('style', '3d' if is_stick(ep) else 'bright')
def is_3d(ep): return style_of(ep) == '3d'
def is_noir(ep): return style_of(ep) == 'noir'
def is_sketch(ep): return style_of(ep) == 'sketch'
_CREAM = np.array([214, 236, 252], np.float32)   # BGR warm paper
def sketch_bg(surf):
    # warm pastel paper look + automatic hand-inked outlines on every background shape
    surf.flush(); a = np.ndarray((H, W, 4), np.uint8, surf.get_data())
    f = a[..., :3].astype(np.float32)
    lum = f[..., 0]*0.114 + f[..., 1]*0.587 + f[..., 2]*0.299
    gx = np.zeros_like(lum); gy = np.zeros_like(lum)
    gx[:, 1:-1] = np.abs(lum[:, 2:] - lum[:, :-2]); gy[1:-1] = np.abs(lum[2:] - lum[:-2])
    e = np.maximum(gx, gy) > 20
    e = e | np.roll(e, 1, 0) | np.roll(e, 1, 1)
    g = f[..., 0:1]*0.114 + f[..., 1:2]*0.587 + f[..., 2:3]*0.299
    f = f*0.90 + _CREAM*0.10
    f[e] = f[e]*0.10 + 18
    a[..., :3] = np.clip(f, 0, 255).astype(np.uint8); surf.mark_dirty()
def grade_sketch(surf, i):
    surf.flush(); a = np.ndarray((H, W, 4), np.uint8, surf.get_data())
    f = a[..., :3].astype(np.float32)
    f = f*(0.86 + 0.14*_VIG) + _GRAIN[(i // 3) % 6]*0.35
    a[..., :3] = np.clip(f, 0, 255).astype(np.uint8); surf.mark_dirty()
def grade(surf, i, desat=0.52):
    surf.flush()
    a = np.ndarray((H, W, 4), np.uint8, surf.get_data())
    f = a[..., :3].astype(np.float32)
    g = f[..., 0:1]*0.114 + f[..., 1:2]*0.587 + f[..., 2:3]*0.299
    f = f*(1 - desat) + g*desat                                   # mostly desaturated
    f = (f - 128)*1.08 + 120                              # a touch of contrast, slightly darker
    f[..., 0] *= 1.07; f[..., 2] *= 0.95                  # cool blue-grey cast (BGR order)
    f = f*_VIG + _GRAIN[(i // 3) % 6]
    a[..., :3] = np.clip(f, 0, 255).astype(np.uint8)
    surf.mark_dirty()

def ink(ctx, w=3, a=0.85):
    ctx.set_source_rgba(0.08, 0.08, 0.1, a); ctx.set_line_width(w); ctx.set_line_join(cairo.LINE_JOIN_ROUND)

def interior(ctx, t, kind):
    # one-point perspective interior with glowing windows, hand-inked
    vx, vy = W*0.5, H*0.42
    ctx.set_source_rgb(0.34, 0.36, 0.40); ctx.paint()
    bw, bh = 520, 230; bx, by = vx - bw/2, vy - bh/2
    # back wall + windows with warm light
    ctx.set_source_rgb(0.26, 0.28, 0.32); ctx.rectangle(bx, by, bw, bh); ctx.fill()
    for k in range(6):
        wx = bx + 18 + k*84
        g = cairo.LinearGradient(0, by + 20, 0, by + bh - 20); g.add_color_stop_rgb(0, 0.95, 0.72, 0.38); g.add_color_stop_rgb(1, 0.55, 0.38, 0.2)
        ctx.set_source(g); ctx.rectangle(wx, by + 22, 66, bh - 44); ctx.fill()
        ink(ctx, 2); ctx.rectangle(wx, by + 22, 66, bh - 44); ctx.stroke()
        ctx.move_to(wx + 33, by + 22); ctx.line_to(wx + 33, by + bh - 22); ctx.stroke()
    # floor
    ctx.set_source_rgb(0.30, 0.31, 0.34); ctx.move_to(0, H); ctx.line_to(bx, by + bh); ctx.line_to(bx + bw, by + bh); ctx.line_to(W, H); ctx.close_path(); ctx.fill()
    # light shafts on the floor
    for k in range(6):
        wx = bx + 18 + k*84
        ctx.set_source_rgba(1, 0.8, 0.45, 0.10)
        ctx.move_to(wx, by + bh); ctx.line_to(wx + 66, by + bh); ctx.line_to((wx + 66 - vx)*2.4 + vx, H); ctx.line_to((wx - vx)*2.4 + vx, H); ctx.close_path(); ctx.fill()
    # ceiling
    ctx.set_source_rgb(0.40, 0.42, 0.46); ctx.move_to(0, 0); ctx.line_to(bx, by); ctx.line_to(bx + bw, by); ctx.line_to(W, 0); ctx.close_path(); ctx.fill()
    # side walls with panels
    for side in (-1, 1):
        ex = 0 if side < 0 else W; nx = bx if side < 0 else bx + bw
        ctx.set_source_rgb(0.36, 0.38, 0.42); ctx.move_to(ex, 0); ctx.line_to(nx, by); ctx.line_to(nx, by + bh); ctx.line_to(ex, H); ctx.close_path(); ctx.fill()
        ink(ctx, 2.2)
        for k in range(1, 5):
            u = k/5; px = ex + (nx - ex)*u**0.7
            ty = 0 + (by - 0)*u**0.7; byy = H + (by + bh - H)*u**0.7
            ctx.move_to(px, ty); ctx.line_to(px, byy); ctx.stroke()
        if kind == 'corridor':
            # glass railing
            ctx.set_source_rgba(0.75, 0.85, 0.9, 0.12); ctx.move_to(ex, H*0.62); ctx.line_to(nx, by + bh*0.75); ctx.line_to(nx, by + bh); ctx.line_to(ex, H); ctx.close_path(); ctx.fill()
            ink(ctx, 3); ctx.move_to(ex, H*0.62); ctx.line_to(nx, by + bh*0.75); ctx.stroke()
    # perspective lines + floor tiles
    ink(ctx, 2.5)
    for p_ in ((0, 0), (W, 0), (0, H), (W, H)):
        ctx.move_to(*p_); ctx.line_to(bx if p_[0] == 0 else bx + bw, by if p_[1] == 0 else by + bh); ctx.stroke()
    ctx.rectangle(bx, by, bw, bh); ctx.stroke()
    ink(ctx, 1.4, 0.45)
    for k in range(-6, 7):
        ctx.move_to(vx + k*45, by + bh); ctx.line_to(vx + k*260, H); ctx.stroke()
    for k in range(1, 6):
        u = (k/6)**1.8; yy = by + bh + (H - by - bh)*u
        ctx.move_to(0, yy); ctx.line_to(W, yy); ctx.stroke()
    if kind == 'room':
        ink(ctx, 2.5)
        for tx_ in (300, 980):  # simple tables
            ctx.set_source_rgb(0.42, 0.40, 0.38); ctx.rectangle(tx_ - 90, 520, 180, 16); ctx.fill(); ink(ctx, 2.5); ctx.rectangle(tx_ - 90, 520, 180, 16); ctx.stroke()
            ctx.move_to(tx_ - 75, 536); ctx.line_to(tx_ - 75, 600); ctx.move_to(tx_ + 75, 536); ctx.line_to(tx_ + 75, 600); ctx.stroke()

# ---------------------------------------------------------------- backgrounds
rnd0 = random.Random(7)
STONES = [(rnd0.uniform(0, W), rnd0.uniform(0, 1), rnd0.uniform(8, 22), rnd0.choice(['#8b6a4f', '#7a5b42', '#a08066'])) for _ in range(45)]
STARS = [(rnd0.uniform(0, W), rnd0.uniform(0, H), rnd0.uniform(1, 3.2), rnd0.uniform(0, 6)) for _ in range(140)]
BUBBLES = [(rnd0.uniform(0, W), rnd0.uniform(0, 1), rnd0.uniform(5, 16), rnd0.uniform(0.6, 1.4)) for _ in range(30)]
GROUND = {'corridor': 640, 'room': 610, 'desert': 560, 'volcano': 560, 'city': 560, 'snow': 560, 'lab': 560, 'mystery': 560, 'meadow': 560, 'split': 300, 'underground': 470, 'sky': 600, 'space': 560, 'ocean': 600, 'forest': 560, 'night': 560}

def sky_grad(ctx, top, bot, y1):
    g = cairo.LinearGradient(0, 0, 0, y1); g.add_color_stop_rgb(0, *hexc(top)[:3]); g.add_color_stop_rgb(1, *hexc(bot)[:3])
    ctx.set_source(g); ctx.rectangle(0, 0, W, y1); ctx.fill()

def clouds(ctx, t, ys=(90, 60, 120), alpha=0.95):
    for i, (cx, cy, sc) in enumerate(((150, ys[0], 1.0), (560, ys[1], 0.8), (1000, ys[2], 1.2))):
        cx = (cx + t*12*sc) % (W + 260) - 130
        ctx.set_source_rgba(1, 1, 1, alpha)
        for dx, dy, r in ((0, 0, 32), (35, -12, 38), (72, 0, 30), (36, 10, 30)):
            ctx.arc(cx + dx*sc, cy + dy*sc, r*sc, 0, 2*math.pi); ctx.fill()

def soil(ctx, y0, y1, top='#a9774f', bot='#6b4429'):
    g = cairo.LinearGradient(0, y0, 0, y1); g.add_color_stop_rgb(0, *hexc(top)[:3]); g.add_color_stop_rgb(1, *hexc(bot)[:3])
    ctx.set_source(g); ctx.rectangle(0, y0, W, y1 - y0); ctx.fill()
    for sx, sy, r, c in STONES:
        yy = y0 + 20 + sy*(y1 - y0 - 30)
        ctx.set_source_rgba(*hexc(c, 0.9)); ellipse(ctx, sx, yy, r, r*0.7); ctx.fill()

def grass(ctx, y, t, col='#5cbf3a', col2='#4aa82c'):
    ctx.set_source_rgba(*hexc(col)); ctx.rectangle(0, y - 18, W, 32); ctx.fill()
    ctx.set_source_rgba(*hexc(col2))
    for gx in range(0, W, 18):
        sw = math.sin(t*3 + gx*0.05)*3
        ctx.move_to(gx, y - 16); ctx.line_to(gx + 6 + sw, y - 34); ctx.line_to(gx + 12, y - 16); ctx.fill()

def warm_room(ctx, t, kind):
    # cosy hand-drawn interior: warm wall, wooden floor, a window, soft lamp glow
    fy = 520 if kind == 'room' else 500
    g = cairo.LinearGradient(0, 0, 0, fy); g.add_color_stop_rgb(0, 0.97, 0.88, 0.72); g.add_color_stop_rgb(1, 0.94, 0.81, 0.62)
    ctx.set_source(g); ctx.rectangle(0, 0, W, fy); ctx.fill()
    ctx.set_source_rgb(0.80, 0.56, 0.34); ctx.rectangle(0, fy, W, H - fy); ctx.fill()
    ctx.set_source_rgba(0.55, 0.35, 0.18, 0.55); ctx.set_line_width(3)
    for k in range(-8, 12):
        ctx.move_to(W/2 + k*40, fy); ctx.line_to(W/2 + k*170, H); ctx.stroke()
    ctx.set_source_rgb(0.62, 0.42, 0.24); ctx.rectangle(0, fy - 14, W, 14); ctx.fill()
    if kind == 'corridor':
        # long hall with a bright window at the end
        ctx.set_source_rgb(0.90, 0.74, 0.52); ctx.move_to(0, 0); ctx.line_to(420, 140); ctx.line_to(420, fy - 40); ctx.line_to(0, fy); ctx.close_path(); ctx.fill()
        ctx.move_to(W, 0); ctx.line_to(860, 140); ctx.line_to(860, fy - 40); ctx.line_to(W, fy); ctx.close_path(); ctx.fill()
        gw = cairo.LinearGradient(0, 150, 0, fy - 50); gw.add_color_stop_rgb(0, 1.0, 0.93, 0.70); gw.add_color_stop_rgb(1, 0.98, 0.78, 0.48)
        ctx.set_source(gw); ctx.rectangle(470, 160, 340, fy - 220); ctx.fill()
        ctx.set_source_rgb(0.2, 0.15, 0.12); ctx.set_line_width(4)
        for k in range(1, 4): ctx.move_to(470 + k*85, 160); ctx.line_to(470 + k*85, fy - 60); ctx.stroke()
        for px in (150, 1130):
            ctx.set_source_rgb(0.98, 0.95, 0.85); ctx.rectangle(px - 45, 180, 90, 130); ctx.fill()
    else:
        wx, wy = 120, 110
        ctx.set_source_rgb(0.62, 0.80, 0.95); ctx.rectangle(wx, wy, 300, 230); ctx.fill()
        ctx.set_source_rgb(1, 1, 1)
        for cx, cy in ((wx + 80, wy + 70), (wx + 200, wy + 120)):
            for dx, r in ((0, 22), (26, 28), (52, 20)): ctx.arc(cx + dx, cy, r, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgb(0.95, 0.92, 0.85); ctx.set_line_width(14); ctx.rectangle(wx, wy, 300, 230); ctx.stroke()
        ctx.set_line_width(6); ctx.move_to(wx + 150, wy); ctx.line_to(wx + 150, wy + 230); ctx.stroke()
        ctx.set_source_rgb(0.88, 0.84, 0.76); ctx.rectangle(wx - 20, wy + 236, 340, 14); ctx.fill()
    lg = cairo.RadialGradient(1050, 160, 10, 1050, 160, 420); lg.add_color_stop_rgba(0, 1, 0.92, 0.6, 0.45); lg.add_color_stop_rgba(1, 1, 0.9, 0.6, 0)
    ctx.set_source(lg); ctx.paint()

def warm_outdoor(ctx, t, kind):
    hz = 330
    if kind == 'night':
        g = cairo.LinearGradient(0, 0, 0, hz); g.add_color_stop_rgb(0, 0.20, 0.27, 0.50); g.add_color_stop_rgb(1, 0.42, 0.47, 0.70)
        ctx.set_source(g); ctx.rectangle(0, 0, W, hz + 40); ctx.fill()
        for sx, sy, r, ph in STARS[:70]:
            if sy < hz: ctx.set_source_rgba(1, 0.97, 0.85, 0.5 + 0.5*abs(math.sin(t*1.4 + ph))); ctx.arc(sx, sy, r*0.8, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgb(1, 0.97, 0.85); ctx.arc(1060, 110, 46, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgb(0.22, 0.29, 0.52); ctx.arc(1082, 96, 42, 0, 2*math.pi); ctx.fill()
        hill1, hill2, ground = (0.36, 0.45, 0.50), (0.32, 0.41, 0.46), (0.42, 0.50, 0.50)
    else:
        g = cairo.LinearGradient(0, 0, 0, hz); g.add_color_stop_rgb(0, 0.98, 0.72, 0.56); g.add_color_stop_rgb(1, 0.99, 0.87, 0.68)
        ctx.set_source(g); ctx.rectangle(0, 0, W, hz + 40); ctx.fill()
        ctx.set_source_rgb(0.97, 0.58, 0.36); ctx.arc(160, hz + 10, 70, math.pi, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(1, 1, 1, 0.55)
        for cx, cy, sc_ in ((420, 90, 1.0), (900, 60, 0.8)):
            cx = (cx + t*8) % (W + 200) - 100; ctx.save(); ctx.translate(cx, cy); ctx.scale(2.2*sc_, 0.5*sc_); ctx.arc(0, 0, 40, 0, 2*math.pi); ctx.restore(); ctx.fill()
        if kind == 'meadow': hill1, hill2, ground = (0.74, 0.80, 0.45), (0.66, 0.74, 0.40), (0.78, 0.82, 0.50)
        elif kind == 'forest': hill1, hill2, ground = (0.55, 0.70, 0.42), (0.48, 0.63, 0.38), (0.62, 0.74, 0.45)
        else: hill1, hill2, ground = (0.90, 0.78, 0.48), (0.86, 0.72, 0.42), (0.87, 0.74, 0.46)
    ctx.set_source_rgb(*hill1); ctx.move_to(0, hz + 20)
    for xx in range(0, W + 41, 40): ctx.line_to(xx, hz + 5 - 28*math.sin(xx*0.006 + 1.3))
    ctx.line_to(W, H); ctx.line_to(0, H); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(*hill2); ctx.move_to(0, hz + 60)
    for xx in range(0, W + 41, 40): ctx.line_to(xx, hz + 55 - 22*math.sin(xx*0.008 + 4.0))
    ctx.line_to(W, H); ctx.line_to(0, H); ctx.close_path(); ctx.fill()
    ctx.set_source_rgb(*ground); ctx.rectangle(0, 470, W, H - 470); ctx.fill()
    if kind == 'forest':
        for i_, fx in enumerate(range(60, W, 190)): draw_emoji(ctx, '🌲' if i_ % 2 else '🌳', fx, 380 + (i_ % 3)*10, 170)
    rr = random.Random(11); ctx.set_source_rgba(hill2[0]*0.75, hill2[1]*0.75, hill2[2]*0.7, 0.7); ctx.set_line_width(4)
    for _ in range(14):
        gx_, gy_ = rr.uniform(0, W), rr.uniform(480, H - 40)
        for d in (-6, 0, 6): ctx.move_to(gx_, gy_); ctx.line_to(gx_ + d + math.sin(t*2 + gx_)*2, gy_ - 14 + abs(d)); ctx.stroke()

def background(ctx, kind, t):
    if HS.SKETCH and kind in ('corridor', 'room'): return warm_room(ctx, t, kind)
    if HS.SKETCH and kind in ('meadow', 'forest', 'desert', 'night'): return warm_outdoor(ctx, t, kind)
    if kind in ('meadow', 'forest'):
        sky_grad(ctx, '#7cc8ff', '#d4f0ff', 560)
        ctx.set_source_rgba(*hexc('#fff3a0')); ctx.arc(1150, 85, 48, 0, 2*math.pi); ctx.fill()
        clouds(ctx, t)
        ctx.set_source_rgba(*hexc('#8fd46a')); ellipse(ctx, 250, 590, 520, 150); ctx.fill(); ellipse(ctx, 1050, 600, 560, 170); ctx.fill()
        if kind == 'forest':
            for i, fx in enumerate(range(40, W, 150)):
                draw_emoji(ctx, '🌲' if i % 2 else '🌳', fx, 430 + (i % 3)*12, 190 + (i % 2)*30)
        soil(ctx, 560, H); grass(ctx, 560, t)
    elif kind == 'split':
        sky_grad(ctx, '#7cc8ff', '#d4f0ff', 300)
        ctx.set_source_rgba(*hexc('#fff3a0')); ctx.arc(1150, 70, 42, 0, 2*math.pi); ctx.fill()
        clouds(ctx, t, ys=(70, 50, 95))
        soil(ctx, 300, H); grass(ctx, 300, t)
    elif kind == 'underground':
        soil(ctx, 0, H, '#8f6142', '#4d2f1c')
        ctx.set_source_rgba(0, 0, 0, 0.08); ctx.set_line_width(14)
        for ly in (200, 400, 620):
            ctx.move_to(0, ly)
            for xx in range(0, W + 40, 40): ctx.line_to(xx, ly + math.sin(xx*0.01 + ly)*10)
            ctx.stroke()
        ctx.set_source_rgba(*hexc('#2e1b10', 0.85)); rrect(ctx, -60, 300, W + 120, 200, 90); ctx.fill()
        ctx.set_source_rgba(*hexc('#5cbf3a')); ctx.rectangle(0, 0, W, 24); ctx.fill()
    elif kind == 'sky':
        sky_grad(ctx, '#5fb6ff', '#e6f6ff', H); clouds(ctx, t, ys=(120, 260, 420))
        ctx.set_source_rgba(1, 1, 1, 0.95); ellipse(ctx, 640, 700, 520, 120); ctx.fill()
    elif kind == 'space':
        g = cairo.RadialGradient(900, 200, 50, 640, 360, 900)
        g.add_color_stop_rgb(0, *hexc('#2b2f77')[:3]); g.add_color_stop_rgb(1, *hexc('#0b0b24')[:3])
        ctx.set_source(g); ctx.paint()
        for sx, sy, r, ph in STARS:
            ctx.set_source_rgba(1, 1, 0.9, 0.5 + 0.5*math.sin(t*2 + ph)); ctx.arc(sx, sy, r, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(*hexc('#c9c3d6')); ellipse(ctx, 640, 760, 760, 220); ctx.fill()
        for cx, cy, r in ((300, 610, 40), (820, 640, 55), (1100, 600, 30)):
            ctx.set_source_rgba(*hexc('#aaa3ba')); ellipse(ctx, cx, cy, r, r*0.35); ctx.fill()
    elif kind == 'ocean':
        sky_grad(ctx, '#2aa7d8', '#0a3d6b', H)
        ctx.set_source_rgba(1, 1, 1, 0.06)
        for k in range(5):
            ctx.move_to(100 + k*260 + math.sin(t + k)*30, 0); ctx.line_to(180 + k*260, 0); ctx.line_to(60 + k*240, H); ctx.line_to(0 + k*240, H); ctx.fill()
        for bx, by, r, sp in BUBBLES:
            yy = H - ((by*H + t*60*sp) % (H + 40))
            ctx.set_source_rgba(1, 1, 1, 0.35); ctx.set_line_width(2); ctx.arc(bx + math.sin(t*2 + bx)*8, yy, r, 0, 2*math.pi); ctx.stroke()
        ctx.set_source_rgba(*hexc('#e8cf8f')); ellipse(ctx, 640, 740, 820, 150); ctx.fill()
        for i, sx in enumerate((120, 330, 980, 1180)):
            draw_emoji(ctx, '🪸' if i % 2 else '🌿', sx, 610, 120)
    elif kind == 'night':
        sky_grad(ctx, '#0e1a4a', '#3b4f9a', 560)
        for sx, sy, r, ph in STARS[:80]:
            if sy < 520:
                ctx.set_source_rgba(1, 1, 0.85, 0.4 + 0.6*abs(math.sin(t*1.5 + ph))); ctx.arc(sx, sy, r*0.9, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(*hexc('#fff6c8')); ctx.arc(1080, 120, 55, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(*hexc('#0e1a4a')); ctx.arc(1104, 104, 50, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(*hexc('#2d6b3a')); ellipse(ctx, 640, 600, 900, 110); ctx.fill()
        soil(ctx, 560, H, '#5a4030', '#3a2618'); grass(ctx, 560, t, '#2f7d2a', '#256622')
    elif kind in ('corridor', 'room'):
        interior(ctx, t, kind)
    elif kind == 'desert':
        sky_grad(ctx, '#ffb366', '#ffe3b0', 520)
        ctx.set_source_rgba(*hexc('#fff1a8')); ctx.arc(1050, 140, 70, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(*hexc('#e9b86a')); ellipse(ctx, 300, 600, 600, 170); ctx.fill()
        ctx.set_source_rgba(*hexc('#f2c97d')); ellipse(ctx, 1000, 640, 650, 190); ctx.fill()
        ctx.set_source_rgba(*hexc('#ddb06a')); ctx.rectangle(0, 560, W, H - 560); ctx.fill()
    elif kind == 'volcano':
        sky_grad(ctx, '#3a1f3d', '#d9663a', 560)
        ctx.set_source_rgba(*hexc('#4a2c2a')); ctx.move_to(380, 560); ctx.line_to(600, 190); ctx.line_to(700, 190); ctx.line_to(940, 560); ctx.close_path(); ctx.fill()
        ctx.set_source_rgba(*hexc('#ff7a1a')); ctx.move_to(600, 190); ctx.line_to(700, 190); ctx.line_to(680, 260); ctx.line_to(640, 240); ctx.close_path(); ctx.fill()
        rr = random.Random(int(t*6))
        for k in range(10):
            ph = (t*0.8 + k*0.1) % 1
            ctx.set_source_rgba(1, 0.45 + 0.3*rr.random(), 0.1, 1 - ph); ctx.arc(650 + math.sin(k*2.3)*ph*180, 190 - ph*160 + ph*ph*120, 8 + 6*(1 - ph), 0, 2*math.pi); ctx.fill()
        soil(ctx, 560, H, '#5a3b2e', '#2e1d16')
    elif kind == 'city':
        sky_grad(ctx, '#89c4ff', '#e2f1ff', 560); clouds(ctx, t)
        rr = random.Random(5)
        for k in range(14):
            bw_ = rr.randint(70, 120); bh_ = rr.randint(160, 380); bx = k*95 - 20
            ctx.set_source_rgba(*hexc(rr.choice(['#7d8aa6', '#95a3bd', '#6c7896', '#a9b4c9']))); ctx.rectangle(bx, 560 - bh_, bw_, bh_); ctx.fill()
            ctx.set_source_rgba(1, 0.95, 0.7, 0.7)
            for wy in range(560 - bh_ + 16, 545, 34):
                for wx in range(bx + 10, bx + bw_ - 14, 24): ctx.rectangle(wx, wy, 12, 16); ctx.fill()
        ctx.set_source_rgba(*hexc('#555b66')); ctx.rectangle(0, 560, W, H - 560); ctx.fill()
        ctx.set_source_rgba(1, 1, 1, 0.8)
        for k in range(0, W, 120): ctx.rectangle(k + 20, 630, 60, 8); ctx.fill()
    elif kind == 'snow':
        sky_grad(ctx, '#9fc7e8', '#eef6ff', 560)
        ctx.set_source_rgba(1, 1, 1, 1); ellipse(ctx, 300, 600, 620, 170); ctx.fill(); ellipse(ctx, 1000, 620, 640, 180); ctx.fill()
        ctx.set_source_rgba(*hexc('#f4f8ff')); ctx.rectangle(0, 560, W, H - 560); ctx.fill()
        for sx, sy, r, ph in STARS[:70]:
            yy = (sy + t*40*(0.6 + r/4)) % H; ctx.set_source_rgba(1, 1, 1, 0.9); ctx.arc(sx + math.sin(t + ph)*10, yy, r + 1, 0, 2*math.pi); ctx.fill()
    elif kind == 'lab':
        ctx.set_source_rgba(*hexc('#dfe9f2')); ctx.paint()
        ctx.set_source_rgba(*hexc('#c9d8e6'))
        for k in range(0, W, 80): ctx.rectangle(k, 0, 40, 560); ctx.fill()
        ctx.set_source_rgba(*hexc('#8a6a52')); ctx.rectangle(0, 500, W, 60); ctx.fill()
        ctx.set_source_rgba(*hexc('#b3c2cf')); ctx.rectangle(0, 560, W, H - 560); ctx.fill()
    elif kind == 'mystery':
        g = cairo.RadialGradient(640, 300, 40, 640, 360, 800)
        g.add_color_stop_rgb(0, *hexc('#3d2a5c')[:3]); g.add_color_stop_rgb(1, *hexc('#0d0a17')[:3]); ctx.set_source(g); ctx.paint()
        for sx, sy, r, ph in STARS[:60]:
            ctx.set_source_rgba(0.8, 0.7, 1, 0.25 + 0.25*math.sin(t*1.3 + ph)); ctx.arc(sx, sy, r*1.4, 0, 2*math.pi); ctx.fill()
        ctx.set_source_rgba(*hexc('#1d1530')); ctx.rectangle(0, 560, W, H - 560); ctx.fill()
    else:
        background(ctx, 'meadow', t)

# ---------------------------------------------------------------- overlays
def particles(ctx, t, x, y, facing, intensity):
    rnd = random.Random(int(t*FPS))
    for k in range(int(14*intensity)):
        age = (t*3 + k*0.37) % 1.0
        px = x - facing*(40 + age*160) + rnd.uniform(-10, 10)
        py = y + 60 - math.sin(age*math.pi)*90 + rnd.uniform(-8, 8)
        ctx.set_source_rgba(*hexc(rnd.choice(['#a9774f', '#7a5b42', '#c08a5e']), 1-age))
        ctx.arc(px, py, 5 + 6*(1-age), 0, 2*math.pi); ctx.fill()

def sparkle(ctx, x, y, r, a):
    if r <= 0.5: return
    ctx.save(); ctx.translate(x, y); ctx.set_source_rgba(1, 0.92, 0.45, a)
    ctx.move_to(0, -r)
    for k in range(4):
        ang = k*math.pi/2 - math.pi/2
        ctx.line_to(math.cos(ang + math.pi/4)*r*0.25, math.sin(ang + math.pi/4)*r*0.25)
        ctx.line_to(math.cos(ang + math.pi/2)*r, math.sin(ang + math.pi/2)*r)
    ctx.close_path(); ctx.fill(); ctx.restore()

def bubble(ctx, cx, cy, msg, thought=False, alpha=1.0, size=40):
    set_font(ctx, size); ext = ctx.text_extents(msg)
    w = ext.x_advance + 60; h = size + 44
    ctx.push_group()
    ctx.set_source_rgba(1, 1, 1, 0.96)
    if thought:
        ellipse(ctx, cx, cy, w/2 + 10, h/2 + 6); ctx.fill()
        ctx.arc(cx - w/4, cy + h/2 + 18, 12, 0, 2*math.pi); ctx.fill(); ctx.arc(cx - w/4 - 18, cy + h/2 + 42, 7, 0, 2*math.pi); ctx.fill()
    else:
        rrect(ctx, cx - w/2, cy - h/2, w, h, 26); ctx.fill()
        ctx.move_to(cx - 30, cy + h/2 - 2); ctx.line_to(cx - 50, cy + h/2 + 34); ctx.line_to(cx + 5, cy + h/2 - 2); ctx.fill()
    text(ctx, msg, cx, cy + size*0.36, size, col='#3b2a1a', outline=None)
    ctx.pop_group_to_source(); ctx.paint_with_alpha(alpha)

def fact_box(ctx, label, body, a, sc):
    if a <= 0: return
    lines = wrap(ctx, body, 40, 960)
    bw = 1060; bh = 70 + 52*len(lines) + 18
    ctx.push_group(); ctx.translate(W/2, 40 + bh/2); ctx.scale(sc, sc); ctx.translate(-W/2, -(40 + bh/2))
    rrect(ctx, (W - bw)/2, 40, bw, bh, 28); ctx.set_source_rgba(1, 1, 1, 0.95); ctx.fill_preserve()
    ctx.set_source_rgba(*hexc('#f4b400')); ctx.set_line_width(6); ctx.stroke()
    text(ctx, label, W/2, 92, 34, col='#e0457b', outline=None)
    for i, ln in enumerate(lines):
        text(ctx, ln, W/2, 146 + i*52, 40, col='#3b2a1a', outline=None)
    ctx.pop_group_to_source(); ctx.paint_with_alpha(a)

def subtitle(ctx, s):
    if not s: return
    lines = wrap(ctx, s, 32, 1040)[:2]
    bh = 22 + 44*len(lines); y0 = H - bh - 18
    rrect(ctx, 90, y0, W - 180, bh, 20); ctx.set_source_rgba(0, 0, 0, 0.55); ctx.fill()
    for i, ln in enumerate(lines):
        text(ctx, ln, W/2, y0 + 44 + i*44, 32, col='#ffffff', outline=None)

def big_word(ctx, s, x, y, size, sc, rot, a, col='#ffd23f'):
    if sc <= 0.01 or a <= 0.01: return
    ctx.push_group(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc)
    text(ctx, s, 0, size*0.35, size, col=col, outline='#3b2a1a', ow=max(6, size//8))
    ctx.pop_group_to_source(); ctx.paint_with_alpha(a)

# ---------------------------------------------------------------- props
def draw_roots(ctx, x, top, length, hairs, alpha, seed):
    rnd = random.Random(seed)
    ctx.save(); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    def branch(x0, y0, ang, ln, w, depth):
        x1 = x0 + math.cos(ang)*ln; y1 = y0 + math.sin(ang)*ln
        ctx.set_source_rgba(*hexc('#e8d2a6', alpha)); ctx.set_line_width(w)
        ctx.move_to(x0, y0); ctx.curve_to(x0 + rnd.uniform(-15, 15), (y0 + y1)/2, x1 + rnd.uniform(-15, 15), (y0 + y1)/2, x1, y1); ctx.stroke()
        if hairs and depth <= 1:
            ctx.set_source_rgba(*hexc('#f5e9cf', alpha*0.9)); ctx.set_line_width(1.6)
            for k in range(14):
                u = k/14; hx = x0 + (x1 - x0)*u; hy = y0 + (y1 - y0)*u; ha = ang + (math.pi/2 if k % 2 else -math.pi/2)
                ctx.move_to(hx, hy); ctx.line_to(hx + math.cos(ha)*10, hy + math.sin(ha)*10); ctx.stroke()
        if depth > 0:
            for _ in range(2):
                branch(x1, y1, ang + rnd.uniform(-0.7, 0.7), ln*rnd.uniform(0.55, 0.75), w*0.62, depth - 1)
    branch(x, top, math.pi/2, length*0.45, 16, 3)
    ctx.restore()

def prop_state(p, lt, dur):
    at = p.get('at', 0.0) * dur
    u = (lt - at)
    x, y = p.get('x', 0.5)*W, p.get('y', 0.5)*H
    sc, rot, a, sq = 1.0, 0.0, 1.0, 0.0
    anims = p.get('anim', 'pop').split('+')
    if u < 0: return None
    if 'pop' in anims and 'text' in p:
        if u < 0.22: sc *= 1 + 1.4*(1 - ease_out_cubic(u/0.22)); a *= clamp(u/0.08)
        else: sc *= 1 + 0.07*math.sin((u - 0.22)*26)*math.exp(-(u - 0.22)*7)
    elif 'pop' in anims:
        sc *= ease_out_back(u / 0.45); sq = 0.2*math.exp(-u*6)*math.sin(u*26)
    if 'fade' in anims: a *= ease_io(u / 0.6)
    if 'grow' in anims: sc *= 0.15 + 0.85*ease_io(u / max(0.5, dur - at - 0.3))
    if 'float' in anims: y += math.sin(lt*2.2 + x*0.01)*12
    if 'bounce' in anims: y -= abs(math.sin(lt*4))*40
    if 'spin' in anims: rot = lt*2.0
    if 'wobble' in anims: rot = math.sin(lt*5)*0.18
    if 'shake' in anims: x += math.sin(lt*45)*5
    if 'pulse' in anims: sc *= 1 + 0.08*math.sin(lt*7)
    if 'move' in anims and 'to' in p:
        k = ease_io(u / max(0.5, p.get('move_time', dur - at)))
        x += (p['to'][0]*W - x)*k; y += (p['to'][1]*H - y)*k
    if 'drop' in anims:
        k = clamp(u / 0.9); y = -80 + (y + 80)*(k*k) if k < 1 else y
    return x, y, sc, rot, a, sq

def draw_prop(ctx, p, lt, dur):
    st = prop_state(p, lt, dur)
    if not st: return
    x, y, sc, rot, a, sq = st
    u = lt - p.get('at', 0.0)*dur
    if p.get('kind') == 'roots':
        draw_roots(ctx, x, p.get('top', 0.0)*H, p.get('length', 260)*sc, p.get('hairs', True), a, p.get('seed', 3)); return
    if p.get('kind') == 'stem':
        ctx.save(); ctx.set_source_rgba(*hexc('#4f9a2f', a)); ctx.set_line_width(26*sc); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        y0, y1 = p.get('y0', 0.42)*H, p.get('y1', 0.12)*H
        ctx.move_to(x, y0); ctx.curve_to(x - 20, (y0 + y1)/2, x + 20, (y0 + y1)/2, x, y1); ctx.stroke(); ctx.restore(); return
    if 'emoji' in p:
        n = p.get('count', 1)
        for i in range(n):
            ox = (i - (n - 1)/2) * p.get('size', 160) * 0.9
            draw_emoji(ctx, p['emoji'], x + ox, y, p.get('size', 160), sc, rot, a, sq)
    elif 'text' in p:
        if 'pop' in p.get('anim', 'pop') and 0 <= u < 0.4:
            k = u/0.4; ctx.save(); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
            ctx.set_source_rgba(1, 0.95, 0.75, (1 - k)*0.9); ctx.set_line_width(6)
            for j in range(14):
                ang = j*2*math.pi/14; r0 = 120 + k*160; r1 = r0 + 60*(1 - k)
                ctx.move_to(x + math.cos(ang)*r0*1.6, y + math.sin(ang)*r0*0.7); ctx.line_to(x + math.cos(ang)*r1*1.6, y + math.sin(ang)*r1*0.7); ctx.stroke()
            ctx.restore()
        big_word(ctx, p['text'], x, y, p.get('size', 90), sc, rot, a, p.get('color', '#ffd23f'))

# ---------------------------------------------------------------- audio
_kokoro = None
def tts(textline, voice, speed):
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        md = os.environ.get('KOKORO_DIR', os.path.join(HERE, 'models'))
        _kokoro = Kokoro(os.path.join(md, 'kokoro-v1.0.onnx'), os.path.join(md, 'voices-v1.0.bin'))
    s, sr = _kokoro.create(textline, voice=voice, speed=speed, lang='en-us')
    assert sr == SR
    return np.asarray(s, dtype=np.float32)

MOODS = ('playful', 'mystery', 'space', 'epic', 'calm')
_BG_MOOD = {'space': 'space', 'sky': 'space', 'night': 'space', 'mystery': 'mystery', 'underground': 'mystery',
            'corridor': 'mystery', 'lab': 'mystery', 'volcano': 'epic', 'desert': 'epic', 'ocean': 'epic',
            'snow': 'calm', 'meadow': 'calm', 'forest': 'calm', 'room': 'playful', 'city': 'playful', 'split': 'playful'}

def music_mood(ep):
    """Mood of the background music: ep['music'] if set, otherwise guessed from the backgrounds used."""
    m = ep.get('music')
    if m in MOODS or m == 'none': return m
    cnt = {}
    for sc in ep.get('scenes', []):
        md = _BG_MOOD.get(sc.get('bg', 'meadow'), 'playful'); cnt[md] = cnt.get(md, 0) + 1
    return max(cnt, key=cnt.get) if cnt else 'playful'

def synth_music(dur, seed, mood='playful'):
    """Royalty-free background music generated in code, one gentle loop per mood."""
    rng = random.Random(seed)
    n = int(SR*dur); out = np.zeros(n, dtype=np.float32)
    if mood == 'none' or n <= 0: return out
    cfg = {'playful': (112, 'maj'), 'mystery': (84, 'min'), 'space': (68, 'maj7'), 'epic': (100, 'min'), 'calm': (88, 'maj')}[mood]
    bpm, kind = cfg; beat = 60/bpm
    key = rng.choice([0, 2, 5, 7, -3, -5])
    m = lambda k: 440*2**((k + key - 69)/12)
    def put(start, sig):
        s0 = int(start*SR)
        if s0 >= n: return
        L = min(len(sig), n - s0); out[s0:s0 + L] += sig[:L]
    def pluck(f, d, vol):
        tt = np.arange(int(d*SR))/SR
        w = np.sin(2*np.pi*f*tt) + 0.4*np.sin(4*np.pi*f*tt) + 0.15*np.sin(6*np.pi*f*tt)
        return (vol*np.exp(-tt*5)*np.minimum(1, tt*200)*w).astype(np.float32)
    def pad(f, d, vol):
        tt = np.arange(int(d*SR))/SR
        env = np.minimum(1, tt/0.7)*np.minimum(1, np.maximum(0, (d - tt)/0.9))
        w = sum(np.sin(2*np.pi*f*dt*tt) for dt in (0.997, 1.0, 1.003)) + 0.25*np.sin(4*np.pi*f*tt)
        return (vol*env*w/3).astype(np.float32)
    def bell(f, vol):
        tt = np.arange(int(2.2*SR))/SR
        w = np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*f*2.76*tt)*np.exp(-tt*3)
        return (vol*np.exp(-tt*2.2)*np.minimum(1, tt*300)*w).astype(np.float32)
    def kick(vol):
        tt = np.arange(int(0.3*SR))/SR; f = 45 + 80*np.exp(-tt*30)
        return (vol*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*12)).astype(np.float32)
    def hat(vol):
        nz = np.diff(np.random.default_rng(rng.randint(0, 9999)).standard_normal(int(0.06*SR) + 1))
        return (vol*nz*np.exp(-np.arange(len(nz))/SR*60)).astype(np.float32)
    if kind == 'min':
        progs = [[[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]], [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 56, 59]]]
        scale = [57, 59, 60, 62, 64, 65, 67, 69]
    elif kind == 'maj7':
        progs = [[[60, 64, 67, 71], [57, 60, 64, 67], [65, 69, 72, 76], [62, 65, 69, 72]], [[60, 64, 67, 71], [65, 69, 72, 76]]*2]
        scale = [60, 62, 64, 67, 69, 71, 72, 74]
    else:
        progs = [[[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]],
                 [[60, 64, 67], [67, 71, 74], [57, 60, 64], [65, 69, 72]]]
        scale = [60, 62, 64, 67, 69, 72, 74, 76]
    chords = rng.choice(progs)
    mel = [rng.choice(scale) + 12 if rng.random() < 0.8 else None for _ in range(16)]
    tpos, bar = 0.0, 0
    while tpos < dur:
        ch = chords[bar % len(chords)]; bl = 4*beat
        if mood == 'playful':
            for b in range(4):
                put(tpos + b*beat, pluck(m(ch[0] - 12), beat*0.9, 0.16))
                for k in ch: put(tpos + b*beat + beat/2, pluck(m(k), beat*0.4, 0.05))
            for jx in range(8):
                k = mel[(bar % 2)*8 + jx]
                if k and bar % 4 != 3: put(tpos + jx*beat/2, pluck(m(k), beat*0.5, 0.08))
            for b in range(8): put(tpos + b*beat/2, hat(0.025 if b % 2 else 0.015))
        elif mood == 'mystery':
            for k in ch: put(tpos, pad(m(k - 12), bl + 0.4, 0.07))
            put(tpos, pluck(m(ch[0] - 24), beat*1.8, 0.12)); put(tpos + 2*beat, pluck(m(ch[0] - 24), beat*1.8, 0.09))
            for jx in range(4):
                k = mel[(bar % 4)*4 + jx]
                if k and (jx + bar) % 2 == 0: put(tpos + jx*beat + beat/2, pluck(m(k - 12), beat*0.6, 0.06))
            for b in range(4): put(tpos + b*beat + beat/2, hat(0.012))
        elif mood == 'space':
            for k in ch: put(tpos, pad(m(k - 12), bl + 0.6, 0.08))
            arp = ch + [ch[1] + 12]
            for jx in range(8):
                if rng.random() < 0.7: put(tpos + jx*beat/2, bell(m(arp[jx % len(arp)] + 12), 0.035))
        elif mood == 'epic':
            for k in ch: put(tpos, pad(m(k - 12), bl + 0.3, 0.06))
            for e in range(8): put(tpos + e*beat/2, pluck(m(ch[0] - 24), beat*0.45, 0.13 if e % 2 == 0 else 0.09))
            for b in (0, 2): put(tpos + b*beat, kick(0.35))
            put(tpos + 3.5*beat, kick(0.2))
            for b in range(8): put(tpos + b*beat/2, hat(0.02))
        else:  # calm
            for k in ch: put(tpos, pad(m(k - 12), bl + 0.5, 0.06))
            arp = [ch[0], ch[1], ch[2], ch[1]]
            for jx in range(8): put(tpos + jx*beat/2, pluck(m(arp[jx % 4]), beat*0.8, 0.06))
        tpos += bl; bar += 1
    if mood in ('space', 'mystery', 'calm'):   # soft echo for a roomy feel
        for dl, g in ((0.27, 0.32), (0.53, 0.18)):
            d = int(dl*SR); out[d:] += out[:-d]*g
    rms = float(np.sqrt(np.mean(out**2))) + 1e-6
    out = np.tanh(out/rms*0.20)                # equal loudness across moods, soft-limited (no clipping)
    return out.astype(np.float32)

def whoosh_sfx():
    L = int(0.45*SR); tt = np.arange(L)/SR
    rng = np.random.RandomState(3); nz = rng.normal(0, 1, L).astype(np.float32)
    nz = np.convolve(nz, np.ones(12)/12, mode='same')
    env = np.minimum(1, tt/0.12)*np.exp(-np.maximum(0, tt - 0.12)*9)
    return (nz*env*(0.6 + 0.4*np.sin(2*np.pi*(3 + 18*tt)*tt))).astype(np.float32)

def thud_sfx():
    L = int(0.4*SR); tt = np.arange(L)/SR
    f = 95*np.exp(-tt*6) + 38
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)).astype(np.float32)

def pop_sfx(f0=400):
    L = int(0.22*SR); tt = np.arange(L)/SR
    return (np.sin(2*np.pi*(f0 + 900*tt)*tt)*np.exp(-tt*18)).astype(np.float32)

# ---------------------------------------------------------------- build timeline
def split_sentences(s):
    parts = re.split(r'(?<=[.!?])\s+', s.strip())
    out = []
    for p in parts:
        if len(p) > 90 and ',' in p:
            sub = [q.strip() for q in p.split(',')]
            cur = ''
            for q in sub:
                t_ = (cur + ', ' + q) if cur else q
                if len(t_) > 80 and cur: out.append(cur + ','); cur = q
                else: cur = t_
            if cur: out.append(cur)
        else:
            out.append(p)
    return [p for p in out if p]

def build(ep, preview=False):
    voice = ep.get('voice', 'af_heart'); speed = ep.get('speed', 1.0)
    scenes = ep['scenes']
    global INTRO
    INTRO = 3.2 if ep.get('intro', False) else 0.0
    t = INTRO; timeline = []; voice_track = []
    print(f'TTS for {len(scenes)} scenes...', flush=True)
    for i, sc in enumerate(scenes):
        a = tts(sc['narration'], voice, speed) if sc.get('narration') else np.zeros(int(SR*1.5), np.float32)
        d = len(a)/SR + PAD + sc.get('extra', 0.0)
        timeline.append(dict(sc=sc, start=t, dur=d, voice_len=len(a)/SR))
        voice_track.append((t + 0.15, a)); t += d
    total = t + OUTRO
    n = int(SR*total) + SR
    vt = np.zeros(n, np.float32)
    for st, a in voice_track:
        s0 = int(st*SR); vt[s0:s0 + len(a)] += a
    vt /= max(1e-6, np.abs(vt).max()); vt *= 0.92
    mus = synth_music(total + 1, ep.get('seed', 1), music_mood(ep))[:n]
    # low music that ducks under the voice and comes up a little in pauses
    venv = np.convolve(np.abs(vt), np.ones(SR//4)/(SR//4), mode='same')
    talk = np.clip(venv/0.05, 0, 1)
    gain = (0.30 - 0.14*talk).astype(np.float32)
    gain[:int(INTRO*SR)] = 0.9; gain[int((total - OUTRO)*SR):] = 0.6
    gain = np.convolve(gain, np.ones(4800)/4800, mode='same').astype(np.float32)
    gain *= float(ep.get('music_volume', 1.0))
    mix = vt + mus*gain
    for tl in timeline:
        for p in tl['sc'].get('props', []):
            if 'pop' in p.get('anim', 'pop'):
                s0 = int((tl['start'] + p.get('at', 0)*tl['dur'])*SR); sfx = pop_sfx(rng_f(p))*0.22
                mix[s0:s0 + len(sfx)] += sfx[:max(0, n - s0)]
    def addfx(at, fx, vol):
        s0 = int(at*SR)
        if 0 <= s0 < n: mix[s0:s0 + len(fx)] += fx[:max(0, n - s0)]*vol
    for k_, tl in enumerate(timeline):
        if k_ > 0: addfx(tl['start'] - 0.12, whoosh_sfx(), 0.16)
        for p in tl['sc'].get('props', []):
            if 'text' in p and 'pop' in p.get('anim', 'pop'): addfx(tl['start'] + p.get('at', 0)*tl['dur'], thud_sfx(), 0.38)
        if tl['sc'].get('fact'): addfx(tl['start'] + tl['sc']['fact'].get('at', 0.15)*tl['dur'], thud_sfx(), 0.30)
    for s0t in (0.6, total - OUTRO + 1.2):
        s0 = int(s0t*SR); sfx = pop_sfx(500)*0.3; mix[s0:s0 + len(sfx)] += sfx
    fl = int(0.8*SR); mix[int(total*SR) - fl:int(total*SR)] *= np.linspace(1, 0, fl)
    mix = mix[:int(total*SR)]
    mix /= max(1.0, np.abs(mix).max()/0.97)
    hop = SR // FPS
    env = np.array([np.sqrt(np.mean(vt[i*hop:(i+1)*hop]**2)) for i in range(int(total*FPS) + 2)])
    env = np.clip(env / (np.percentile(env[env > 0.01], 90) if (env > 0.01).any() else 1), 0, 1)
    return timeline, total, mix, env

def rng_f(p): return 380 + (hash(p.get('emoji', p.get('text', ''))) % 300)

# ---------------------------------------------------------------- frame
def frame(i, ep, timeline, total, env):
    if is_3d(ep): return frame3d(i, ep, timeline, total, env)
    t = i / FPS
    global EMOJI_INK
    HS.SKETCH = EMOJI_INK = is_sketch(ep)
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); ctx = cairo.Context(surf)
    blink = ((t + 1.1) % 3.3) < 0.12
    mouth = float(env[min(i, len(env) - 1)])
    title = ep.get('title', '')
    if t < INTRO:
        background(ctx, ep.get('intro_bg', 'meadow'), t)
        pop = ease_out_back((t - 0.3)/0.9)
        if ep.get('mascot', True) and is_stick(ep):
            k = ease_io((t - 0.2)/1.3); moving = k < 1
            draw_stick(ctx, -120 + k*760, 560 - 95*1.05, 1.05, t, 1, 0.0, blink, 1.0, 'walk' if moving else 'wave', t*9 if moving else 0)
        elif ep.get('mascot', True):
            cy = 760 - pop*330
            ctx.save(); ctx.rectangle(0, 0, W, 560); ctx.clip()
            chloe(ctx, 640, cy, 0.9, t, 1, 0, blink, wave=1.0 if t > 1.6 else 0)
            ctx.restore()
            ctx.set_source_rgba(*hexc('#8a5a38')); ellipse(ctx, 640, 556, 150, 26); ctx.fill()
        else:
            draw_emoji(ctx, ep.get('intro_emoji', '🔍'), 640, 380 + math.sin(t*2)*10, 230, pop, math.sin(t*1.5)*0.08)
        if is_noir(ep): grade(surf, i)
        ts = ease_out_back((t - 0.9)/0.7)
        if ts > 0:
            ctx.save(); ctx.translate(W/2, 130); ctx.scale(ts, ts)
            text(ctx, 'SIR DIGSWORTH', 0, 38, 96, col='#ffd23f', outline='#3b2a1a', ow=14); ctx.restore()
        sa = ease_io((t - 1.5)/0.5)
        if sa > 0:
            lines = wrap(ctx, title, 46, 1100)
            ctx.push_group()
            for k, ln in enumerate(lines): text(ctx, ln, W/2, 640 + k*54 - (len(lines) - 1)*27, 46, col='#ffffff', outline='#3b2a1a', ow=9)
            ctx.pop_group_to_source(); ctx.paint_with_alpha(sa)
    elif t >= total - OUTRO:
        lt = t - (total - OUTRO)
        background(ctx, ep.get('intro_bg', 'meadow'), t)
        if is_sketch(ep): sketch_bg(surf)
        if ep.get('mascot', True) and is_stick(ep):
            draw_stick(ctx, 640, 560 - 95*1.05 - abs(math.sin(lt*3))*20, 1.05, t, 1, 0.0, blink, 1.0, 'wave')
        elif ep.get('mascot', True):
            chloe(ctx, 640, 560 - 95*0.95 - abs(math.sin(lt*3))*20, 0.95, t, 1, 0, blink, wave=1.0)
        else:
            draw_emoji(ctx, ep.get('intro_emoji', '🔍'), 640, 380 - abs(math.sin(lt*3))*20, 200)
        for k in range(8):
            ph = (t*1.2 + k*0.13) % 1
            sparkle(ctx, 640 + 330*math.cos(k*0.8), 300 + 150*math.sin(k*1.3), 20*math.sin(ph*math.pi), math.sin(ph*math.pi))
        if is_noir(ep): grade(surf, i)
        a = ease_io(lt/0.5)
        ctx.push_group(); text(ctx, ep.get('outro_text', 'Dig deeper with Chloe!' if ep.get('mascot', True) and not is_stick(ep) else 'Keep digging deeper!'), W/2, 120, 62, col='#ffd23f', outline='#3b2a1a', ow=12)
        ctx.pop_group_to_source(); ctx.paint_with_alpha(a)
        bs = ease_out_back((lt - 0.6)/0.6) * (1 + 0.05*math.sin(t*8))
        if bs > 0:
            ctx.save(); ctx.translate(W/2, 650); ctx.scale(bs, bs)
            rrect(ctx, -180, -44, 360, 88, 44); ctx.set_source_rgba(*hexc('#ff0033')); ctx.fill()
            text(ctx, 'SUBSCRIBE', 0, 18, 46, col='#ffffff', outline=None); ctx.restore()
    else:
        tl = next(x for x in timeline if x['start'] <= t < x['start'] + x['dur'])
        sc, lt, dur = tl['sc'], t - tl['start'], tl['dur']
        first = tl is timeline[0]; si = timeline.index(tl)
        ent = 1 - ease_out_cubic(lt/0.32)
        z = 1 + 0.05*ease_io(lt/dur) + 0.16*ent
        ox = ent*W*0.10*(1 if si % 2 else -1)
        # impact events: big text slams and fact cards punch the camera and shake it
        events = [p.get('at', 0.0)*dur for p in sc.get('props', []) if 'text' in p and 'pop' in p.get('anim', 'pop')]
        if sc.get('fact'): events.append(sc['fact'].get('at', 0.15)*dur)
        shake = 0.0
        for ev in events:
            d = lt - ev
            if 0 <= d < 0.3: shake = max(shake, 7*(1 - d/0.3)); z += 0.035*(1 - d/0.3)
        act0 = sc.get('chloe', {}).get('action', 'idle')
        if act0 in ('wow', 'dizzy', 'jump') and lt < 0.45: shake = max(shake, 6*(1 - lt/0.45))
        sx_, sy_ = math.sin(t*93)*shake, math.cos(t*71)*shake
        ctx.save(); ctx.translate(W/2 + ox + sx_, H*0.5 + sy_); ctx.scale(z, z); ctx.translate(-W/2, -H*0.5)
        bg = sc.get('bg', 'meadow'); background(ctx, bg, t)
        if is_sketch(ep): sketch_bg(surf)
        if is_noir(ep):
            for k_, (dx, dy, dr, dp) in enumerate(STARS[:28]):
                px = (dx + t*14*(0.5 + dr/3)) % (W + 40) - 20; py = (dy - t*9*(0.4 + dr/4)) % H
                ctx.set_source_rgba(1, 0.95, 0.85, 0.10 + 0.08*math.sin(t*2 + dp)); ctx.arc(px, py, 1.2 + dr*0.7, 0, 2*math.pi); ctx.fill()
        for p in sc.get('props', []):
            if p.get('layer') == 'back': draw_prop(ctx, p, lt, dur)
        c = sc.get('chloe', {})
        act = c.get('action', 'idle'); s = c.get('size', (1.35 if is_sketch(ep) else 1.0) if is_stick(ep) else 0.85)
        x = c.get('x', 0.3)*W; facing = c.get('facing', 1)
        gy = c.get('ground', GROUND.get(bg, 560) / H)*H
        if is_sketch(ep) and 'ground' not in c: gy = max(gy, 650)
        y = gy - 95*s
        dig = wipe = wave = 0.0; eye = 1.0; rot = 0.0; step = 0.0; bob = math.sin(t*5)*3
        if act in ('walk', 'dig', 'run', 'swim') and 'to' in c:
            k = ease_io(lt / max(0.6, dur*c.get('move_frac', 0.85))); x += (c['to']*W - x)*k
            moving = 0 < k < 1
        else:
            moving = False
        if act in ('walk', 'run'):
            step = t*(14 if act == 'run' else 9) if moving else 0; bob = -abs(math.sin(step))*10 if moving else bob
        if act == 'dig': dig = 1.0; particles(ctx, t, x, y, facing, 1.0) if False else None
        if act == 'jump': bob = -abs(math.sin(lt*math.pi*1.3))*90
        if act == 'wow': eye = 1.3; bob = -abs(math.sin(min(lt, 0.7)*math.pi/0.7))*40
        if act == 'wipe': wipe = 1.0
        if act == 'wave': wave = 1.0
        if act == 'dizzy': rot = math.sin(t*4)*0.18
        if act == 'swim': rot = math.sin(t*3)*0.12; bob = math.sin(t*2.5)*14; step = t*8
        if act == 'think': rot = -0.08 + math.sin(t*1.5)*0.03
        if act == 'sleep': blink = True
        if act == 'shiver': x += math.sin(t*60)*3
        talking = lt < tl['voice_len'] + 0.2
        show = ep.get('mascot', True) and not c.get('hide', False)
        energy = mouth if talking else 0.0
        if act in ('idle', 'point', 'think', 'shrug', 'wave', 'wipe'):
            bob += -abs(math.sin(t*6.5))*7*energy; rot += math.sin(t*4.7)*0.035*energy
        sqk = 0.0
        if act in ('wow', 'jump', 'dizzy') and lt < 0.5:
            k_ = lt/0.5; sqk = math.sin(k_*math.pi*2)*(1 - k_)*0.16
        if show:
            ctx.save(); ctx.translate(x, gy); ctx.scale(1 + sqk, 1 - sqk); ctx.translate(-x, -gy)
            draw_host(ctx, ep, x, y + bob, s, t, facing, act, blink, mouth if talking else 0.0, eye, rot, step, energy)
            ctx.restore()
        else: act = 'none'
        if act == 'dig': particles(ctx, t, x, y, facing, 1.0)
        if act == 'dizzy':
            for k in range(3):
                ang = t*4 + k*2.1
                draw_emoji(ctx, '⭐', x + math.cos(ang)*80*s, y - (175 if is_stick(ep) else 120)*s + math.sin(ang)*22, 46)
        if act == 'wow':
            for k in range(5):
                ph = (t*1.4 + k*0.2) % 1
                sparkle(ctx, x + 150*math.cos(k*1.3), y - 60 + 110*math.sin(k*1.9), 16*math.sin(ph*math.pi), math.sin(ph*math.pi))
        if act == 'sleep':
            for k in range(3):
                ph = (t*0.6 + k/3) % 1
                big_word(ctx, 'z', x + 90*facing + ph*60, y - 120 - ph*120, 40 + k*8, 1, 0, 1 - ph, '#ffffff')
        say = c.get('say') if show else None
        if say:
            sa = ease_io((lt - c.get('say_at', 0.2)*dur)/0.3)
            by = y - (225 if is_stick(ep) else 170)*s
            if sa > 0: bubble(ctx, x + 150*facing, by, say, thought=c.get('thought', False), alpha=sa)
        for p in sc.get('props', []):
            if p.get('layer') != 'back' and not ('text' in p and is_noir(ep)): draw_prop(ctx, p, lt, dur)
        ctx.restore()
        if ent > 0.01:
            ctx.set_source_rgba(1, 1, 1, 0.28*max(0, 1 - lt/0.16)); ctx.paint()
        if is_noir(ep):
            grade(surf, i)
            for p in sc.get('props', []):
                if 'text' in p: draw_prop(ctx, p, lt, dur)
        if is_sketch(ep): grade_sketch(surf, i)
        if sc.get('fact'):
            f = sc['fact']; fa = (f.get('at', 0.15))*dur
            fade_out = 1 - ease_io((lt - (dur - 0.35))/0.3)
            ctx.save(); ctx.translate(0, -140*(1 - ease_out_back((lt - fa)/0.45)))
            fact_box(ctx, f.get('label', 'Did you know?'), f['text'], clamp((lt - fa)/0.15)*fade_out, 1.0)
            ctx.restore()
        # subtitles
        if ep.get('subtitles', True) and sc.get('narration'):
            chunks = split_sentences(sc['narration']); tot = sum(len(cn) for cn in chunks)
            pos = (lt - 0.15) / max(0.1, tl['voice_len']) * tot; acc = 0; cur = chunks[-1] if lt > 0.15 else chunks[0]
            for cn in chunks:
                acc += len(cn)
                if pos < acc: cur = cn; break
            if ep.get('captions', 'kinetic') == 'kinetic':
                ch_, age_ = caption_chunk(tl, lt, 3); kinetic(ctx, ch_, age_, W/2, H - 62, 54)
            elif lt < tl['voice_len'] + 0.4: subtitle(ctx, cur)
    # fades at scene edges
    edges = ([INTRO] if INTRO > 0 else [])
    for e in edges:
        if abs(e - ep.get('_nofade_edge', -99)) < 0.01: continue
        d = abs(t - e)
        if d < FADE: ctx.set_source_rgba(0, 0, 0, (1 - d/FADE)*0.9); ctx.paint()
    if INTRO > 0 and t < 0.3: ctx.set_source_rgba(0, 0, 0, 1 - t/0.3); ctx.paint()
    if t > total - 0.5: ctx.set_source_rgba(0, 0, 0, clamp((t - (total - 0.5))/0.5)); ctx.paint()
    return surf


# ---------------------------------------------------------------- 3D frames (three.js world + 2D overlays)
import three3d as T3
def _sprites(sc, lt, dur):
    global EMOJI_INK
    out = []
    for p in sc.get('props', []):
        if 'emoji' not in p: continue
        st = prop_state(p, lt, dur)
        if not st: continue
        x, y, k, rot, a, sq = st
        if k <= 0.01 or a <= 0.01: continue
        EMOJI_INK = True; T3.send_emoji(p['emoji'], emoji_surface(p['emoji'], 256))
        n = p.get('count', 1); size = p.get('size', 160)
        for j in range(n):
            ox = (j - (n - 1)/2)*size*0.9
            out.append(dict(key=p['emoji'], x=(x + ox)/W, y=y/H, size=size*1.75, sc=k, rot=rot, a=a, sq=sq, back=p.get('layer') == 'back'))
    return out

def _host3d(ep, c, act, x, t, lt, dur, mouth, blink, talking, si, energy_s=0.0):
    """Host pose for the 3D world. Returns (state dict, facing)."""
    s = 1.1*clamp(c.get('size', 1.35)/1.35, 0.95, 1.2); facing = c.get('facing', 1)
    bob = 0.0; rot = 0.0; eye = 1.0; step = 0.0
    moving = False
    if act in ('walk', 'dig', 'run', 'swim') and 'to' in c:
        k = ease_io(lt / max(0.6, dur*c.get('move_frac', 0.85))); x += (c['to']*W - x)*k; moving = 0 < k < 1
    if act in ('walk', 'run'): step = t*(14 if act == 'run' else 9) if moving else 0; bob = abs(math.sin(step))*0.08 if moving else 0
    if act == 'jump': bob = abs(math.sin(lt*math.pi*1.3))*0.9
    if act == 'wow': eye = 1.3; bob = abs(math.sin(min(lt, 0.7)*math.pi/0.7))*0.4
    if act == 'dizzy': rot = math.sin(t*4)*0.18
    if act == 'swim': rot = math.sin(t*3)*0.12; bob = 0.3 + math.sin(t*2.5)*0.15; step = t*8
    if act == 'think': rot = -0.06 + math.sin(t*1.5)*0.03
    energy = energy_s if talking else 0.0
    if act in ('idle', 'point', 'think', 'shrug', 'wave', 'wipe'):
        bob += (0.5 - 0.5*math.cos(t*4.2))*0.035*energy
    bob += math.sin(t*3.2)*0.015
    sqk = 0.0
    if act in ('wow', 'jump', 'dizzy') and lt < 0.5:
        k_ = lt/0.5; sqk = math.sin(k_*math.pi*2)*(1 - k_)*0.12
    gy = c.get('ground3d', 0.9)
    return dict(show=True, x=x/W, gy=gy, size=s, act=act, bob=bob, rot=rot, eye=eye, step=step, facing=facing,
                mouth=mouth if talking else 0.0, blink=bool(blink), energy=energy, sq=sqk), facing

def _overlay_effects(ctx, act, hx, hy, facing, t, s):
    if act == 'dizzy':
        for k in range(3):
            ang = t*4 + k*2.1
            draw_emoji(ctx, '⭐', hx + math.cos(ang)*90*s, hy - 95*s + math.sin(ang)*22, 46)
    if act == 'wow':
        for k in range(5):
            ph = (t*1.4 + k*0.2) % 1
            sparkle(ctx, hx + 170*math.cos(k*1.3), hy + 40 + 120*math.sin(k*1.9), 18*math.sin(ph*math.pi), math.sin(ph*math.pi))
    if act == 'sleep':
        for k in range(3):
            ph = (t*0.6 + k/3) % 1
            big_word(ctx, 'z', hx + 90*facing + ph*60, hy - 60 - ph*120, 40 + k*8, 1, 0, 1 - ph, '#ffffff')

def _scene_state3d(t, i, ep, timeline, env):
    blink = ((t + 1.1) % 3.3) < 0.12
    i0 = min(i, len(env) - 1)
    mouth = float(np.mean(env[max(0, i0 - 1):i0 + 2]))            # lips: lightly smoothed
    energy_s = float(np.mean(env[max(0, i0 - 7):i0 + 8]))        # body language: smooth, never jittery
    tl = next(x for x in timeline if x['start'] <= t < x['start'] + x['dur'])
    sc, lt, dur = tl['sc'], t - tl['start'], tl['dur']
    si = timeline.index(tl)
    ent = 1 - ease_out_cubic(lt/0.32)
    z = 1 + 0.07*ease_io(lt/dur) + 0.07*ent
    ox = ent*0.03*(1 if si % 2 else -1)
    events = [p.get('at', 0.0)*dur for p in sc.get('props', []) if 'text' in p and 'pop' in p.get('anim', 'pop')]
    if sc.get('fact'): events.append(sc['fact'].get('at', 0.15)*dur)
    shake = 0.0
    for ev in events:
        d = lt - ev
        if 0 <= d < 0.3: shake = max(shake, 3*(1 - d/0.3)); z += 0.025*(1 - d/0.3)
    c = sc.get('chloe', {})
    act = c.get('action', 'idle')
    if act in ('wow', 'dizzy', 'jump') and lt < 0.45: shake = max(shake, 2.5*(1 - lt/0.45))
    sx_, sy_ = 0.0, 0.0   # no camera shake in 3D: a steady camera reads as more professional
    orbit = (1 if si % 2 else -1)*(0.10 - 0.16*ease_io(lt/dur))
    show = ep.get('mascot', True) and not c.get('hide', False)
    talking = lt < tl['voice_len'] + 0.2
    host, facing = _host3d(ep, c, act, c.get('x', 0.3)*W, t, lt, dur, mouth, blink or act == 'sleep', talking, si, energy_s)
    host['show'] = show
    state = dict(t=t, bg=sc.get('bg', 'meadow'), host=host, sprites=_sprites(sc, lt, dur),
                 cam=dict(z=z, ox=ox, sx=sx_, sy=sy_, orbit=orbit))
    return dict(state=state, tl=tl, sc=sc, lt=lt, dur=dur, act=act, facing=facing, show=show, c=c, ent=ent, host=host, z=z)

def _fit_size(ctx, s, size, maxw):
    set_font(ctx, size); w = ctx.text_extents(s).x_advance
    return size if w <= maxw else max(24, int(size*maxw/w))

def frame3d(i, ep, timeline, total, env):
    t = i / FPS
    blink = ((t + 1.1) % 3.3) < 0.12
    mouth = float(env[min(i, len(env) - 1)])
    if t >= total - OUTRO or t < INTRO:
        lt = t - (total - OUTRO) if t >= total - OUTRO else t
        host = dict(show=ep.get('mascot', True), x=0.5, gy=0.92, size=1.05, act='wave', bob=(0.5 - 0.5*math.cos(lt*3))*0.08, rot=0, eye=1.0, step=0,
                    facing=1, mouth=0.0, blink=bool(blink), energy=0.0, sq=0.0, turn=-0.38)
        T3.set_size(W, H)
        surf, info = T3.render(dict(t=t, bg=ep.get('intro_bg', 'meadow'), host=host, sprites=[], cam=dict(z=1.05 + 0.04*ease_io(lt/OUTRO), orbit=0.12*math.sin(lt*0.6), lift=-0.2)))
        ctx = cairo.Context(surf)
        for k in range(8):
            ph = (t*1.2 + k*0.13) % 1
            sparkle(ctx, 640 + 360*math.cos(k*0.8), 300 + 150*math.sin(k*1.3), 20*math.sin(ph*math.pi), math.sin(ph*math.pi))
        a = ease_io(lt/0.5)
        ctx.push_group(); text(ctx, ep.get('outro_text', 'Stay curious with Sir Digsworth!'), W/2, 110, 62, col='#ffd23f', outline='#3b2a1a', ow=12)
        ctx.pop_group_to_source(); ctx.paint_with_alpha(a)
        bs = ease_out_back((lt - 0.6)/0.6) * (1 + 0.05*math.sin(t*8))
        if bs > 0:
            ctx.save(); ctx.translate(W/2, 660); ctx.scale(bs, bs)
            rrect(ctx, -180, -44, 360, 88, 44); ctx.set_source_rgba(*hexc('#ff0033')); ctx.fill()
            text(ctx, 'SUBSCRIBE', 0, 18, 46, col='#ffffff', outline=None); ctx.restore()
        if t > total - 0.5: ctx.set_source_rgba(0, 0, 0, clamp((t - (total - 0.5))/0.5)); ctx.paint()
        return surf
    X = _scene_state3d(t, i, ep, timeline, env)
    state, tl, sc, lt, dur, act, facing, show, c, ent, host, z = (X[k] for k in ('state', 'tl', 'sc', 'lt', 'dur', 'act', 'facing', 'show', 'c', 'ent', 'host', 'z'))
    T3.set_size(W, H)
    surf, info = T3.render(state)
    ctx = cairo.Context(surf)
    hx, hy = info['head'][0]*W, info['head'][1]*H
    if show:
        _overlay_effects(ctx, act, hx, hy, facing, t, host['size']*z)
        say = c.get('say')
        if say:
            sa = ease_io((lt - c.get('say_at', 0.2)*dur)/0.3)
            bx = clamp(hx + 250*facing, 170, W - 170); by = clamp(hy - 20, 250, H - 220)
            if sa > 0: bubble(ctx, bx, by, say, thought=c.get('thought', False), alpha=sa)
    for p in sc.get('props', []):
        if 'emoji' in p: continue
        q = dict(p)
        if 'text' in q and show and 'to' not in q and c.get('x', 0.3) < 0.5:   # keep big words clear of his head
            q['x'] = max(q.get('x', 0.5), 0.66); q['y'] = min(q.get('y', 0.24), 0.26)
            q['size'] = _fit_size(ctx, q['text'], q.get('size', 90), 2*(W - q['x']*W - 40))
        draw_prop(ctx, q, lt, dur)
    if ent > 0.01:
        ctx.set_source_rgba(1, 1, 1, 0.28*max(0, 1 - lt/0.16)); ctx.paint()
    if sc.get('fact'):
        f = sc['fact']; fa = (f.get('at', 0.15))*dur
        fade_out = 1 - ease_io((lt - (dur - 0.35))/0.3)
        ctx.save(); ctx.translate(0, -140*(1 - ease_out_back((lt - fa)/0.45)))
        fact_box(ctx, f.get('label', 'Did you know?'), f['text'], clamp((lt - fa)/0.15)*fade_out, 1.0)
        ctx.restore()
    if ep.get('subtitles', True) and sc.get('narration'):
        ch_, age_ = caption_chunk(tl, lt, 3); kinetic(ctx, ch_, age_, W/2, H - 62, 54)
    if t > total - 0.5: ctx.set_source_rgba(0, 0, 0, clamp((t - (total - 0.5))/0.5)); ctx.paint()
    return surf

def thumbnail3d(ep, out):
    th = ep.get('thumbnail', {})
    host = dict(show=th.get('mascot', ep.get('mascot', True)), x=0.8, gy=1.02, size=1.55, act='wow', bob=0.0, rot=0.05, eye=1.45, step=0,
                facing=-1, mouth=0.9, blink=False, energy=0.0, sq=0.0, turn=0.1)
    for _ in range(4): surf, info = T3.render(dict(t=0.5, bg=th.get('bg', ep.get('intro_bg', 'meadow')), host=host, sprites=[], cam=dict(z=1.0)))
    ctx = cairo.Context(surf)
    g = cairo.LinearGradient(0, 0, W*0.7, 0); g.add_color_stop_rgba(0, 0, 0, 0, 0.45); g.add_color_stop_rgba(1, 0, 0, 0, 0.0)
    ctx.set_source(g); ctx.paint()
    ex, ey = th.get('emoji_x', 0.33)*W, th.get('emoji_y', 0.64)*H
    g = cairo.RadialGradient(ex, ey, 20, ex, ey, 300)
    g.add_color_stop_rgba(0, 1, 0.85, 0.35, 0.85); g.add_color_stop_rgba(0.5, 1, 0.55, 0.15, 0.35); g.add_color_stop_rgba(1, 1, 0.5, 0.1, 0)
    ctx.set_source(g); ctx.arc(ex, ey, 300, 0, 2*math.pi); ctx.fill()
    global EMOJI_INK
    EMOJI_INK = True
    draw_emoji(ctx, th.get('emoji', '❓'), ex, ey, 330)
    ctx.set_source_rgba(0.95, 0.1, 0.12, 1); ctx.set_line_width(14); ellipse(ctx, ex, ey, 210, 190); ctx.stroke()
    words = th.get('text', ep.get('title', '')).upper()
    lines = wrap(ctx, words, 128, 700)[:2]
    cols = [th.get('color', '#ffffff'), th.get('color2', '#ffd23f')]
    for k, ln in enumerate(lines):
        text(ctx, ln, 36, 140 + k*135, 128, col=cols[min(k, 1)], outline='#000000', ow=26, align='left')
    rgb = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H); c2 = cairo.Context(rgb); c2.set_source_surface(surf); c2.paint()
    png = out.rsplit('.', 1)[0] + '.png'; rgb.write_to_png(png)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', png, '-q:v', '2', out], check=True); os.remove(png)
    print('thumbnail', out)

def cta_host3d(ep, t):
    host = dict(show=True, x=0.5, gy=0.95, size=1.2, act='wave', bob=(0.5 - 0.5*math.cos(t*3))*0.08, rot=0, eye=1.0, step=0, facing=1,
                mouth=0.0, blink=((t + 1.1) % 3.3) < 0.12, energy=0.0, sq=0.0, turn=-0.38)
    surf, _ = T3.render(dict(t=t, bg=ep.get('intro_bg', 'meadow'), host=host, sprites=[], cam=dict(z=1.15, lift=-0.1)))
    return surf

def thumbnail(ep, out):
    if is_3d(ep): return thumbnail3d(ep, out)
    th = ep.get('thumbnail', {})
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); ctx = cairo.Context(surf)
    global EMOJI_INK
    HS.SKETCH = EMOJI_INK = is_sketch(ep)
    background(ctx, th.get('bg', ep.get('intro_bg', 'meadow')), 1.0)
    if is_noir(ep): grade(surf, 0, 0.35)
    if is_sketch(ep): sketch_bg(surf)
    ctx.set_source_rgba(0, 0, 0, 0.30); ctx.paint()
    ex, ey = th.get('emoji_x', 0.33)*W, th.get('emoji_y', 0.64)*H
    g = cairo.RadialGradient(ex, ey, 20, ex, ey, 300)
    g.add_color_stop_rgba(0, 1, 0.85, 0.35, 0.85); g.add_color_stop_rgba(0.5, 1, 0.55, 0.15, 0.35); g.add_color_stop_rgba(1, 1, 0.5, 0.1, 0)
    ctx.set_source(g); ctx.arc(ex, ey, 300, 0, 2*math.pi); ctx.fill()
    draw_emoji(ctx, th.get('emoji', '❓'), ex, ey, 330)
    ctx.set_source_rgba(0.95, 0.1, 0.12, 1); ctx.set_line_width(14)
    ellipse(ctx, ex, ey, 210, 190); ctx.stroke()
    if th.get('mascot', ep.get('mascot', True)) and is_stick(ep):
        g2 = cairo.RadialGradient(1000, 300, 30, 1000, 300, 420)
        g2.add_color_stop_rgba(0, 1, 1, 1, 0.35); g2.add_color_stop_rgba(1, 1, 1, 1, 0)
        ctx.set_source(g2); ctx.paint()
        draw_stick(ctx, 1010, 560, 2.5, 0.3, -1, 1.0, False, 1.45, 'wow')
    elif th.get('mascot', ep.get('mascot', True)):
        chloe(ctx, 1000, 470, 1.25, 0.3, -1, 0, False, eye=1.35, mouth=0.9)
    words = th.get('text', ep.get('title', '')).upper()
    lines = wrap(ctx, words, 128, 700)[:2]
    cols = [th.get('color', '#ffffff'), th.get('color2', '#ffd23f')]
    for k, ln in enumerate(lines):
        text(ctx, ln, 36, 140 + k*135, 128, col=cols[min(k, 1)], outline='#000000', ow=26, align='left')
    rgb = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H); c2 = cairo.Context(rgb); c2.set_source_surface(surf); c2.paint()
    png = out.rsplit('.', 1)[0] + '.png'; rgb.write_to_png(png)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', png, '-q:v', '2', out], check=True); os.remove(png)
    print('thumbnail', out)

def caption_chunk(tl, lt, n=2):
    sc = tl['sc']; words = sc.get('narration', '').split()
    if not words or lt < 0.12 or lt > tl['voice_len'] + 0.3: return None, 0.0
    weights = [len(w) + 2 for w in words]; tot = float(sum(weights))
    pos = (lt - 0.15)/max(0.1, tl['voice_len'])*tot; acc = 0; idx = len(words) - 1
    for k, w in enumerate(weights):
        acc += w
        if pos < acc: idx = k; break
    c0 = (idx // n)*n
    start_w = sum(weights[:c0])/tot*tl['voice_len'] + 0.15
    return ' '.join(words[c0:c0 + n]), lt - start_w

def kinetic(ctx, chunk, age, cx, cy, size):
    if not chunk: return
    hot = any(ch.isdigit() for ch in chunk) or any(len(w.strip('.,!?')) > 1 and w.strip('.,!?').isupper() for w in chunk.split())
    sc_ = 1 + 0.28*(1 - ease_out_cubic(age/0.13))
    cw = ctx.get_target().get_width()
    est = 0.66*size*len(chunk) + size*0.3          # rough width of the bold caption
    size = int(size*min(1.0, (cw - 70)/max(1, est*sc_)))  # shrink long chunks so they never clip
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc_, sc_)
    text(ctx, chunk.upper(), 0, size*0.35, size, col='#ffd23f' if hot else '#ffffff', outline='#000000', ow=max(8, size//6))
    ctx.restore()

def current_sub(timeline, t):
    for tl in timeline:
        if tl['start'] <= t < tl['start'] + tl['dur']:
            sc, lt = tl['sc'], t - tl['start']
            if not sc.get('narration') or lt > tl['voice_len'] + 0.4: return ''
            chunks = split_sentences(sc['narration']); tot = sum(len(c) for c in chunks)
            pos = (lt - 0.15) / max(0.1, tl['voice_len']) * tot; acc = 0
            for c in chunks:
                acc += len(c)
                if pos < acc: return c
            return chunks[-1]
    return ''


def render_short3d(ep, out, preview=False):
    """Full-screen vertical 3D Short (1080x1920): the 3D world fills the phone screen."""
    SW, SH = 1080, 1920
    ep2 = dict(ep); ep2['subtitles'] = False
    timeline, total, mix, env = build(ep2)
    sh = ep.get('short', {})
    target = sh.get('max', 60)
    k0 = sh.get('start_scene', 0); start = timeline[k0]['start'] + 1.0/FPS
    end = None
    for tl in timeline[k0:]:
        e = tl['start'] + tl['dur']
        if e - start <= target: end = e
    if end is None or end - start < 20: end = min(start + target, total - OUTRO)
    seg = end - start; CTA = 3.2; dur_total = seg + CTA
    a = mix[int(start*SR):int(end*SR)].copy(); fl = int(0.35*SR); a[-fl:] *= np.linspace(1, 0, fl)
    cta = synth_music(CTA + 0.5, ep.get('seed', 1) + 7, music_mood(ep))[:int(CTA*SR)]*0.75
    cta[:len(pop_sfx(520))] += pop_sfx(520)*0.3; cta[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))
    audio = np.concatenate([a, cta])
    title = sh.get('title', ep.get('thumbnail', {}).get('text', ep.get('title', ''))).upper()
    K = 1.15; BX, BY = (SW - W*K)/2, 470           # 16:9 overlay coordinates -> middle band of the portrait frame
    T3.set_size(SW, SH)
    def draw(ts, cta_k):
        ta = start + min(ts, seg - 1.0/FPS); i = int(ta*FPS)
        X = _scene_state3d(ta, i, ep2, timeline, env)
        st = X['state']; st['portrait'] = True; st['cam']['ox'] *= 0.5
        if cta_k > 0:
            st = dict(t=start + ts, bg=ep.get('intro_bg', X['state']['bg']), portrait=True, sprites=[],
                      host=dict(show=True, x=0.5, gy=0.9, size=1.15, act='wave', bob=(0.5 - 0.5*math.cos(ts*3))*0.08, rot=0, eye=1.0, step=0, facing=1,
                                mouth=0.0, blink=((ts + 1.1) % 3.3) < 0.12, energy=0.0, sq=0.0, turn=-0.38), cam=dict(z=1.05))
        surf, info = T3.render(st)
        c = cairo.Context(surf)
        g = cairo.LinearGradient(0, 0, 0, 760); g.add_color_stop_rgba(0, 0, 0, 0, 0.55); g.add_color_stop_rgba(1, 0, 0, 0, 0)
        c.set_source(g); c.rectangle(0, 0, SW, 760); c.fill()
        g = cairo.LinearGradient(0, SH - 700, 0, SH); g.add_color_stop_rgba(0, 0, 0, 0, 0); g.add_color_stop_rgba(1, 0, 0, 0, 0.5)
        c.set_source(g); c.rectangle(0, SH - 700, SW, 700); c.fill()
        sc, lt, dur, act, facing, cc = X['sc'], X['lt'], X['dur'], X['act'], X['facing'], X['c']
        fact_a = 0.0
        if cta_k == 0 and sc.get('fact'):
            fa = sc['fact'].get('at', 0.15)*dur
            fact_a = clamp((lt - fa)/0.15)*(1 - ease_io((lt - (dur - 0.35))/0.3))
        c.push_group()
        text(c, 'SIR DIGSWORTH INVESTIGATES', SW/2, 200, 40, col='#ffd23f', outline='#000000', ow=8)
        for j, ln in enumerate(wrap(c, title, 112, 980)[:3]):
            text(c, ln, SW/2, 340 + j*122, 112, col='#ffffff' if j == 0 else '#ffd23f', outline='#000000', ow=20)
        c.pop_group_to_source(); c.paint_with_alpha(1 - 0.85*fact_a if cta_k == 0 else 1 - cta_k)
        if cta_k == 0:
            hx, hy = info['head'][0]*SW, info['head'][1]*SH
            if X['show']:
                _overlay_effects(c, act, hx, hy, facing, ta, 1.6)
                say = cc.get('say')
                if say:
                    sa = ease_io((lt - cc.get('say_at', 0.2)*dur)/0.3)
                    if sa > 0: bubble(c, clamp(hx + 250, 260, SW - 230), clamp(hy - 150, 760, SH - 400), say, thought=cc.get('thought', False), alpha=sa, size=54)
            norm = lambda v: ''.join(ch for ch in v.upper() if ch.isalnum())
            row = 0
            for p in sc.get('props', []):
                if 'emoji' in p or 'text' not in p: continue
                if norm(p['text']) in norm(title) or norm(title) in norm(p['text']): continue   # same words as the title above
                size = p.get('size', 90); est = 0.66*size*len(p['text']) + 40
                kk = min(1.35, 940/est)
                q = dict(p); q['x'] = 0.5; q['y'] = 0.5; q.pop('to', None); q['anim'] = '+'.join(a_ for a_ in p.get('anim', 'pop').split('+') if a_ not in ('move', 'float', 'bounce', 'drop'))
                c.save(); c.translate(SW/2 - W*kk/2, 600 + row*125 - H*kk/2); c.scale(kk, kk)
                c.set_source_rgba(1, 1, 1, 1 - 0.9*fact_a); draw_prop(c, q, lt, dur); c.restore(); row += 1
            if X['ent'] > 0.01: c.set_source_rgba(1, 1, 1, 0.28*max(0, 1 - lt/0.16)); c.paint()
            if fact_a > 0:
                c.save(); c.translate((SW - W)/2, 230 - 140*(1 - ease_out_back((lt - sc['fact'].get('at', 0.15)*dur)/0.45)))
                fact_box(c, sc['fact'].get('label', 'Did you know?'), sc['fact']['text'], fact_a, 1.0); c.restore()
            ch_, age_ = caption_chunk(X['tl'], lt, 2); kinetic(c, ch_, age_, SW/2, 1690, 104)
        else:
            c.set_source_rgba(0, 0, 0, 0.35*cta_k); c.paint()
            c.push_group()
            for j, ln in enumerate(['WANT THE', 'FULL STORY?']):
                text(c, ln, SW/2, 330 + j*130, 120, col='#ffffff' if j == 0 else '#ffd23f', outline='#000000', ow=20)
            text(c, 'Full investigation on the channel', SW/2, 600, 54, col='#ffffff', outline='#000000', ow=10)
            rrect(c, SW/2 - 230, 1640, 460, 110, 55); c.set_source_rgba(1, 0, 0.2, 1); c.fill()
            text(c, 'SUBSCRIBE', SW/2, 1715, 60, col='#ffffff', outline=None)
            c.pop_group_to_source(); c.paint_with_alpha(cta_k)
        return surf
    if preview:
        os.makedirs(out + '_frames', exist_ok=True)
        for j, tt in enumerate([0.0, 1.5, seg*0.3, seg*0.5, seg*0.75, seg - 1, seg + 1.5]):
            draw(tt, clamp((tt - seg)/0.4) if tt >= seg else 0).write_to_png(f'{out}_frames/{j:02d}.png')
        print(f'short preview, length {dur_total:.1f}s'); return
    wav = out + '.wav'
    with wave.open(wav, 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((np.clip(audio, -1, 1)*32767).astype(np.int16).tobytes())
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{SW}x{SH}', '-r', str(FPS),
                          '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-maxrate', '4500k', '-bufsize', '9000k',
                          '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    N = int(dur_total*FPS)
    for i in range(N):
        t = i / FPS
        p.stdin.write(bytes(draw(t, clamp((t - seg)/0.4) if t >= seg else 0).get_data()))
        if i % 300 == 0: print(f'short frame {i}/{N}', flush=True)
    p.stdin.close(); p.wait(); os.remove(wav)
    print(f'done short {out} ({dur_total:.1f}s)')

def render_short(ep, out, preview=False):
    if is_3d(ep): return render_short3d(ep, out, preview)
    """Vertical 1080x1920 YouTube Short cut from the start of the episode, with a hook title,
    big subtitles and a call-to-action end card."""
    SW, SH = 1080, 1920
    ep2 = dict(ep); ep2['subtitles'] = False
    timeline, total, mix, env = build(ep2)
    sh = ep.get('short', {})
    target = sh.get('max', 64)
    k0 = sh.get('start_scene', 0); start = timeline[k0]['start'] + 1.0/FPS
    ep2['_nofade_edge'] = timeline[k0]['start']
    end = None
    for tl in timeline[k0:]:
        e = tl['start'] + tl['dur']
        if e - start <= target: end = e
    if end is None or end - start < 20: end = min(start + target, total - OUTRO)
    seg = end - start
    CTA = 3.2; dur_total = seg + CTA
    a = mix[int(start*SR):int(end*SR)].copy(); fl = int(0.35*SR); a[-fl:] *= np.linspace(1, 0, fl)
    cta = synth_music(CTA + 0.5, ep.get('seed', 1) + 7, music_mood(ep))[:int(CTA*SR)]*0.75
    cta[:len(pop_sfx(520))] += pop_sfx(520)*0.3; cta[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))
    audio = np.concatenate([a, cta])
    title = sh.get('title', ep.get('thumbnail', {}).get('text', ep.get('title', ''))).upper()
    vy = 640; vscale = SW / W; vh = H*vscale
    def compose(src, t, cta_k):
        S = cairo.ImageSurface(cairo.FORMAT_ARGB32, SW, SH); c = cairo.Context(S)
        small = cairo.ImageSurface(cairo.FORMAT_ARGB32, 96, 54); sc_ = cairo.Context(small)
        sc_.scale(96/W, 54/H); sc_.set_source_surface(src); sc_.paint()
        c.save(); k = SH/54; c.translate((SW - 96*k)/2, 0); c.scale(k, k); c.set_source_surface(small); c.get_source().set_filter(cairo.FILTER_BILINEAR); c.paint(); c.restore()
        c.set_source_rgba(0, 0, 0, 0.55); c.paint()
        c.save(); c.translate(0, vy); c.scale(vscale, vscale); c.set_source_surface(src); c.paint(); c.restore()
        c.set_source_rgba(1, 1, 1, 0.9); c.set_line_width(4); c.rectangle(0, vy, SW, vh); c.stroke()
        text(c, 'SIR DIGSWORTH INVESTIGATES', SW/2, 200, 40, col='#ffd23f', outline='#000000', ow=8)
        lines = wrap(c, title, 112, 980)[:3]
        for j, ln in enumerate(lines):
            text(c, ln, SW/2, 340 + j*122, 112, col='#ffffff' if j == 0 else '#ffd23f', outline='#000000', ow=20)
        if cta_k == 0:
            ta = start + t
            for tl_ in timeline:
                if tl_['start'] <= ta < tl_['start'] + tl_['dur']:
                    ch_, age_ = caption_chunk(tl_, ta - tl_['start'], 2); kinetic(c, ch_, age_, SW/2, vy + vh + 190, 104)
                    break
        if cta_k > 0:
            c.set_source_rgba(0, 0, 0, 0.65*cta_k); c.paint()
            c.push_group()
            for j, ln in enumerate(['WANT THE', 'FULL STORY?']):
                text(c, ln, SW/2, 620 + j*130, 120, col='#ffffff' if j == 0 else '#ffd23f', outline='#000000', ow=20)
            text(c, 'Full investigation on the channel', SW/2, 900, 54, col='#ffffff', outline='#000000', ow=10)
            if is_3d(ep):
                hs = cta_host3d(ep, t); c.save(); rrect(c, SW/2 - 380, 990, 760, 660, 40); c.clip()
                c.translate(SW/2 - 380, 990); k3 = 660/720*1.0; c.scale(k3, k3); c.set_source_surface(hs, -(1280 - 760/k3)/2, 0); c.paint(); c.restore()
                rrect(c, SW/2 - 380, 990, 760, 660, 40); c.set_source_rgba(1, 1, 1, 0.9); c.set_line_width(6); c.stroke()
            else:
                draw_stick(c, SW/2, 1400, 2.2, t, 1, 0.0, False, 1.2, 'wave')
            rrect(c, SW/2 - 230, 1700, 460, 110, 55); c.set_source_rgba(1, 0, 0.2, 1); c.fill()
            text(c, 'SUBSCRIBE', SW/2, 1775, 60, col='#ffffff', outline=None)
            c.pop_group_to_source(); c.paint_with_alpha(cta_k)
        return S
    if preview:
        os.makedirs(out + '_frames', exist_ok=True)
        for j, tt in enumerate([0.0, 1.5, seg*0.5, seg - 1, seg + 1.5]):
            i = int((start + min(tt, seg - 0.05))*FPS); src = frame(i, ep2, timeline, total, env)
            compose(src, tt, clamp((tt - seg)/0.4) if tt >= seg else 0).write_to_png(f'{out}_frames/{j:02d}.png')
        print(f'short preview, length {dur_total:.1f}s'); return
    wav = out + '.wav'
    with wave.open(wav, 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((np.clip(audio, -1, 1)*32767).astype(np.int16).tobytes())
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{SW}x{SH}', '-r', str(FPS),
                          '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-maxrate', '4000k', '-bufsize', '8000k',
                          '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    last = None
    for i in range(int(dur_total*FPS)):
        t = i / FPS
        if t < seg: last = frame(int((start + t)*FPS), ep2, timeline, total, env)
        p.stdin.write(bytes(compose(last, t, clamp((t - seg)/0.4) if t >= seg else 0).get_data()))
    p.stdin.close(); p.wait(); os.remove(wav)
    print(f'done short {out} ({dur_total:.1f}s)')

def main():
    if '--short' in sys.argv:
        ep = json.load(open(sys.argv[1]))
        idx = int(sys.argv[sys.argv.index('--index') + 1]) if '--index' in sys.argv else 0
        if ep.get('shorts'): ep['short'] = ep['shorts'][idx]
        render_short(ep, sys.argv[2], '--preview' in sys.argv); return
    ep = json.load(open(sys.argv[1])); out = sys.argv[2]
    if '--thumb' in sys.argv:
        thumbnail(ep, out); return
    preview = '--preview' in sys.argv
    timeline, total, mix, env = build(ep, preview)
    wav = out + '.wav'
    with wave.open(wav, 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((np.clip(mix, -1, 1)*32767).astype(np.int16).tobytes())
    if preview:
        os.makedirs(out + '_frames', exist_ok=True)
        times = [INTRO*0.8] + [x['start'] + x['dur']*0.6 for x in timeline] + [total - OUTRO + 2.5]
        for k, tt in enumerate(times):
            frame(int(tt*FPS), ep, timeline, total, env).write_to_png(f'{out}_frames/{k:02d}.png')
        print(f'preview frames written, total {total:.1f}s'); return
    N = int(total*FPS)
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-maxrate', '2500k', '-bufsize', '5000k', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(N):
        p.stdin.write(bytes(frame(i, ep, timeline, total, env).get_data()))
        if i % 600 == 0: print(f'frame {i}/{N}', flush=True)
    p.stdin.close(); p.wait(); os.remove(wav)
    print(f'done {out} ({total:.1f}s)')

if __name__ == '__main__':
    main()
