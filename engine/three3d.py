"""Bridge to the three.js world (engine/three/scene.html), rendered in headless Chrome.

render(state) -> (cairo.ImageSurface 1280x720, info) where info has the on-screen head/feet position of Sir Digsworth.
"""
import base64, functools, http.server, io, os, shutil, socket, threading
import numpy as np
import cairo
from PIL import Image

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'three')
_pw = _browser = _page = _srv = None
_emoji_sent = set()

def _chrome():
    for p in ('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(p): return p
    return shutil.which('google-chrome') or shutil.which('chromium')

def start():
    global _pw, _browser, _page, _srv
    if _page: return
    from playwright.sync_api import sync_playwright
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=HERE)
    _srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), h)
    threading.Thread(target=_srv.serve_forever, daemon=True).start()
    _pw = sync_playwright().start()
    kw = dict(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    exe = _chrome()
    if exe: kw['executable_path'] = exe
    _browser = _pw.chromium.launch(**kw)
    _page = _browser.new_page(viewport={'width': 1280, 'height': 720})
    _page.on('pageerror', lambda e: print('3D page error:', e, flush=True))
    _page.goto(f'http://127.0.0.1:{port}/scene.html')
    _page.wait_for_function('window.ready === true', timeout=60000)

def stop():
    global _pw, _browser, _page, _srv
    try:
        if _browser: _browser.close()
        if _pw: _pw.stop()
        if _srv: _srv.shutdown()
    finally:
        _pw = _browser = _page = _srv = None; _emoji_sent.clear()

def send_emoji(key, surf):
    """Upload a cairo surface (an emoji drawn with its ink outline) as a sprite texture."""
    if key in _emoji_sent: return
    start()
    buf = io.BytesIO(); surf.write_to_png(buf)
    url = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    _page.evaluate('([k, u]) => window.addEmoji(k, u)', [key, url])
    _emoji_sent.add(key)

_size = (1280, 720)
def set_size(w, h):
    global _size
    start()
    if (w, h) != _size:
        _page.set_viewport_size({'width': w, 'height': h}); _page.evaluate('([w, h]) => window.setSize(w, h)', [w, h]); _size = (w, h)

def render(state):
    start()
    r = _page.evaluate('s => window.renderFrame(s)', state)
    raw = base64.b64decode(r['img'].split(',', 1)[1])
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    a = np.asarray(im)
    bgra = np.empty((a.shape[0], a.shape[1], 4), np.uint8)
    bgra[..., 0] = a[..., 2]; bgra[..., 1] = a[..., 1]; bgra[..., 2] = a[..., 0]; bgra[..., 3] = 255
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, a.shape[1], a.shape[0])
    np.ndarray((a.shape[0], surf.get_stride() // 4, 4), np.uint8, surf.get_data())[:, :a.shape[1]] = bgra
    surf.mark_dirty()
    return surf, r
