#!/usr/bin/env python3
"""Dig Deeper video engine.

Usage:  python3 render.py episode.json out.mp4 [--preview]

Turns an episode JSON (scenes with narration, background, Chloe action,
emoji props, captions) into a finished 1280x720 MP4 with Chloe's voice
(Kokoro, voice af_heart), lip-sync, background music, subtitles, an intro
and a subscribe outro. See ../README.md for the episode format.
"""
import cairo, math, random, subprocess, sys, json, os, re, wave
import numpy as np

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
def emoji_surface(e, size):
    key = (e, size)
    if key not in _emoji_cache:
        pad = int(size * 0.35); sz = int(size * 1.4) + pad
        s = cairo.ImageSurface(cairo.FORMAT_ARGB32, sz, sz); c = cairo.Context(s)
        c.select_font_face('Noto Color Emoji'); c.set_font_size(size)
        ext = c.text_extents(e)
        c.move_to(sz/2 - ext.width/2 - ext.x_bearing, sz/2 - ext.height/2 - ext.y_bearing)
        c.show_text(e)
        _emoji_cache[key] = s
    return _emoji_cache[key]

def draw_emoji(ctx, e, x, y, size, scale=1.0, rot=0.0, alpha=1.0):
    if scale <= 0.01 or alpha <= 0.01: return
    base = 128 if size <= 160 else 256
    s = emoji_surface(e, base)
    k = size / base * scale
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k)
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

# ---------------------------------------------------------------- backgrounds
rnd0 = random.Random(7)
STONES = [(rnd0.uniform(0, W), rnd0.uniform(0, 1), rnd0.uniform(8, 22), rnd0.choice(['#8b6a4f', '#7a5b42', '#a08066'])) for _ in range(45)]
STARS = [(rnd0.uniform(0, W), rnd0.uniform(0, H), rnd0.uniform(1, 3.2), rnd0.uniform(0, 6)) for _ in range(140)]
BUBBLES = [(rnd0.uniform(0, W), rnd0.uniform(0, 1), rnd0.uniform(5, 16), rnd0.uniform(0.6, 1.4)) for _ in range(30)]
GROUND = {'meadow': 560, 'split': 300, 'underground': 470, 'sky': 600, 'space': 560, 'ocean': 600, 'forest': 560, 'night': 560}

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

def background(ctx, kind, t):
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
    sc, rot, a = 1.0, 0.0, 1.0
    anims = p.get('anim', 'pop').split('+')
    if u < 0: return None
    if 'pop' in anims: sc *= ease_out_back(u / 0.55)
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
    return x, y, sc, rot, a

def draw_prop(ctx, p, lt, dur):
    st = prop_state(p, lt, dur)
    if not st: return
    x, y, sc, rot, a = st
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
            draw_emoji(ctx, p['emoji'], x + ox, y, p.get('size', 160), sc, rot, a)
    elif 'text' in p:
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

def synth_music(dur, seed):
    rng = random.Random(seed)
    n = int(SR*dur); out = np.zeros(n, dtype=np.float32)
    bpm = 112; beat = 60/bpm
    key = rng.choice([0, 2, 5, 7, -3])
    def note(f, start, d, vol):
        s = int(start*SR); L = int(d*SR)
        if s >= n or L <= 0: return
        L = min(L, n - s); tt = np.arange(L)/SR
        env = np.exp(-tt*5)*np.minimum(1, tt*200)
        w = np.sin(2*np.pi*f*tt) + 0.4*np.sin(4*np.pi*f*tt) + 0.15*np.sin(6*np.pi*f*tt)
        out[s:s+L] += (vol*env*w).astype(np.float32)
    m = lambda k: 440*2**((k + key - 69)/12)
    progs = [[[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]],
             [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]],
             [[60, 64, 67], [67, 71, 74], [57, 60, 64], [65, 69, 72]]]
    chords = rng.choice(progs)
    scale = [60, 62, 64, 67, 69, 72, 74, 76]
    mel = [rng.choice(scale) + 12 if rng.random() < 0.85 else None for _ in range(16)]
    tpos, bar = 0.0, 0
    while tpos < dur:
        ch = chords[bar % 4]
        for b in range(4):
            note(m(ch[0] - 12), tpos + b*beat, beat*0.9, 0.16)
            for k in ch: note(m(k), tpos + b*beat + beat/2, beat*0.4, 0.05)
        for j in range(8):
            k = mel[(bar % 2)*8 + j]
            if k and bar % 4 != 3: note(m(k), tpos + j*beat/2, beat*0.5, 0.08)
        tpos += 4*beat; bar += 1
    return out / max(1e-6, np.abs(out).max())

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
    mus = synth_music(total + 1, ep.get('seed', 1))[:n]
    gain = np.full(n, 0.11, np.float32)
    gain[:int(INTRO*SR)] = 0.32; gain[int((total - OUTRO)*SR):] = 0.30
    gain = np.convolve(gain, np.ones(4800)/4800, mode='same').astype(np.float32)
    mix = vt + mus*gain
    for tl in timeline:
        for p in tl['sc'].get('props', []):
            if 'pop' in p.get('anim', 'pop'):
                s0 = int((tl['start'] + p.get('at', 0)*tl['dur'])*SR); sfx = pop_sfx(rng_f(p))*0.22
                mix[s0:s0 + len(sfx)] += sfx[:max(0, n - s0)]
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
    t = i / FPS
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); ctx = cairo.Context(surf)
    blink = (t % 3.3) < 0.12
    mouth = float(env[min(i, len(env) - 1)])
    title = ep.get('title', '')
    if t < INTRO:
        background(ctx, 'meadow', t)
        pop = ease_out_back((t - 0.3)/0.9); cy = 760 - pop*330
        ctx.save(); ctx.rectangle(0, 0, W, 560); ctx.clip()
        chloe(ctx, 640, cy, 0.9, t, 1, 0, blink, wave=1.0 if t > 1.6 else 0)
        ctx.restore()
        ctx.set_source_rgba(*hexc('#8a5a38')); ellipse(ctx, 640, 556, 150, 26); ctx.fill()
        ts = ease_out_back((t - 0.9)/0.7)
        if ts > 0:
            ctx.save(); ctx.translate(W/2, 130); ctx.scale(ts, ts)
            text(ctx, 'DIG DEEPER', 0, 38, 96, col='#ffd23f', outline='#3b2a1a', ow=14); ctx.restore()
        sa = ease_io((t - 1.5)/0.5)
        if sa > 0:
            lines = wrap(ctx, title, 46, 1100)
            ctx.push_group()
            for k, ln in enumerate(lines): text(ctx, ln, W/2, 640 + k*54 - (len(lines) - 1)*27, 46, col='#ffffff', outline='#3b2a1a', ow=9)
            ctx.pop_group_to_source(); ctx.paint_with_alpha(sa)
    elif t >= total - OUTRO:
        lt = t - (total - OUTRO)
        background(ctx, 'meadow', t)
        chloe(ctx, 640, 560 - 95*0.95 - abs(math.sin(lt*3))*20, 0.95, t, 1, 0, blink, wave=1.0)
        for k in range(8):
            ph = (t*1.2 + k*0.13) % 1
            sparkle(ctx, 640 + 330*math.cos(k*0.8), 300 + 150*math.sin(k*1.3), 20*math.sin(ph*math.pi), math.sin(ph*math.pi))
        a = ease_io(lt/0.5)
        ctx.push_group(); text(ctx, 'Dig deeper with Chloe!', W/2, 120, 62, col='#ffd23f', outline='#3b2a1a', ow=12)
        ctx.pop_group_to_source(); ctx.paint_with_alpha(a)
        bs = ease_out_back((lt - 0.6)/0.6) * (1 + 0.05*math.sin(t*8))
        if bs > 0:
            ctx.save(); ctx.translate(W/2, 650); ctx.scale(bs, bs)
            rrect(ctx, -180, -44, 360, 88, 44); ctx.set_source_rgba(*hexc('#ff0033')); ctx.fill()
            text(ctx, 'SUBSCRIBE', 0, 18, 46, col='#ffffff', outline=None); ctx.restore()
    else:
        tl = next(x for x in timeline if x['start'] <= t < x['start'] + x['dur'])
        sc, lt, dur = tl['sc'], t - tl['start'], tl['dur']
        bg = sc.get('bg', 'meadow'); background(ctx, bg, t)
        for p in sc.get('props', []):
            if p.get('layer') == 'back': draw_prop(ctx, p, lt, dur)
        c = sc.get('chloe', {})
        act = c.get('action', 'idle'); s = c.get('size', 0.85)
        x = c.get('x', 0.3)*W; facing = c.get('facing', 1)
        gy = c.get('ground', GROUND.get(bg, 560) / H)*H
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
        if act == 'sleep': blink = True
        if act == 'shiver': x += math.sin(t*60)*3
        talking = lt < tl['voice_len'] + 0.2
        chloe(ctx, x, y + bob, s, t, facing, dig, blink, wipe, wave, mouth if talking else 0.0, eye, rot, step)
        if act == 'dig': particles(ctx, t, x, y, facing, 1.0)
        if act == 'dizzy':
            for k in range(3):
                ang = t*4 + k*2.1
                draw_emoji(ctx, '⭐', x + math.cos(ang)*80*s, y - 120*s + math.sin(ang)*22, 46)
        if act == 'wow':
            for k in range(5):
                ph = (t*1.4 + k*0.2) % 1
                sparkle(ctx, x + 150*math.cos(k*1.3), y - 60 + 110*math.sin(k*1.9), 16*math.sin(ph*math.pi), math.sin(ph*math.pi))
        if act == 'sleep':
            for k in range(3):
                ph = (t*0.6 + k/3) % 1
                big_word(ctx, 'z', x + 90*facing + ph*60, y - 120 - ph*120, 40 + k*8, 1, 0, 1 - ph, '#ffffff')
        say = c.get('say')
        if say:
            sa = ease_io((lt - c.get('say_at', 0.2)*dur)/0.3)
            if sa > 0: bubble(ctx, x + 150*facing, y - 170*s, say, thought=c.get('thought', False), alpha=sa)
        for p in sc.get('props', []):
            if p.get('layer') != 'back': draw_prop(ctx, p, lt, dur)
        if sc.get('fact'):
            f = sc['fact']; fa = (f.get('at', 0.15))*dur
            fade_out = 1 - ease_io((lt - (dur - 0.35))/0.3)
            fact_box(ctx, f.get('label', 'Did you know?'), f['text'], ease_io((lt - fa)/0.4)*fade_out, 0.85 + 0.15*ease_out_back((lt - fa)/0.5))
        # subtitles
        if ep.get('subtitles', True) and sc.get('narration'):
            chunks = split_sentences(sc['narration']); tot = sum(len(cn) for cn in chunks)
            pos = (lt - 0.15) / max(0.1, tl['voice_len']) * tot; acc = 0; cur = chunks[-1] if lt > 0.15 else chunks[0]
            for cn in chunks:
                acc += len(cn)
                if pos < acc: cur = cn; break
            if lt < tl['voice_len'] + 0.4: subtitle(ctx, cur)
    # fades at scene edges
    edges = [INTRO] + [x['start'] + x['dur'] for x in timeline]
    for e in edges:
        d = abs(t - e)
        if d < FADE: ctx.set_source_rgba(0, 0, 0, (1 - d/FADE)*0.9); ctx.paint()
    if t < 0.3: ctx.set_source_rgba(0, 0, 0, 1 - t/0.3); ctx.paint()
    if t > total - 0.5: ctx.set_source_rgba(0, 0, 0, clamp((t - (total - 0.5))/0.5)); ctx.paint()
    return surf

def main():
    ep = json.load(open(sys.argv[1])); out = sys.argv[2]
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
                          '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(N):
        p.stdin.write(bytes(frame(i, ep, timeline, total, env).get_data()))
        if i % 600 == 0: print(f'frame {i}/{N}', flush=True)
    p.stdin.close(); p.wait(); os.remove(wav)
    print(f'done {out} ({total:.1f}s)')

if __name__ == '__main__':
    main()
