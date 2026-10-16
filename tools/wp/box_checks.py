# tools/wp/box_checks.py
"""Live checks for the czeramaison.com Build your box page.

Usage:
    python tools/wp/box_checks.py <check>
    python tools/wp/box_checks.py all        # every check, in the order listed by usage

Environment:
    WP_AUTH       Required. A WordPress application password for an admin user,
                  given as 'user:password' (wp-admin > Users > Profile >
                  Application Passwords).
    CZERA_BOX_ID  The box product ID. Defaults to 210.

These checks run against production. `rules` and `cache` post add-to-cart
requests as a guest (no login), so each run leaves throwaway guest carts in the
store's session table. No order is ever placed.
"""
import base64, http.cookiejar, json, os, sys, urllib.parse, uuid, urllib.request, urllib.error
from pathlib import Path

SITE = 'https://czeramaison.com'
TIMEOUT = 30
TOWELS = [57, 60, 63, 66, 69, 72]
ROBES = [51, 54]
BOX_ID = int(os.environ.get('CZERA_BOX_ID', '210'))
LIVE = Path(__file__).resolve().parent / 'live'
SNIPPETS = {5: 'czera-box-rules.php', 8: 'czera-box-builder.php'}
RETIRED = {6: 'CZERA box labels', 7: 'CZERA box keyboard'}

_auth = None

def auth():
    """The Basic auth header, read from WP_AUTH on first use."""
    global _auth
    if _auth is None:
        creds = os.environ.get('WP_AUTH', '')
        if ':' not in creds:
            raise SystemExit('WP_AUTH is not set. Export a WordPress application password '
                             "for an admin user as 'user:password'.")
        _auth = 'Basic ' + base64.b64encode(creds.encode()).decode()
    return _auth

def api(path, method='GET', body=None):
    """Call the site's REST API as the admin user. Exits on any HTTP error.
    GETs carry a random nocache parameter: LiteSpeed caches authenticated REST
    GETs, so a repeated URL can return an old copy."""
    if method == 'GET':
        path += ('&' if '?' in path else '?') + 'nocache=' + uuid.uuid4().hex
    req = urllib.request.Request(SITE + '/wp-json' + path, method=method,
        headers={'Authorization': auth(), 'Content-Type': 'application/json'},
        data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f'HTTP {e.code} {path}: {e.read().decode(errors="replace")[:300]}')

def check_plugins():
    active = {p['plugin'].split('/')[0] for p in api('/wp/v2/plugins') if p['status'] == 'active'}
    missing = {'wpc-composite-products', 'code-snippets'} - active
    assert not missing, f'not active: {missing}'
    print('plugins OK')

def box_meta():
    p = api(f'/wc/v3/products/{BOX_ID}?context=edit')
    return p, {m['key']: m['value'] for m in p['meta_data']}

def components(meta):
    """Return {component name: (key, component)} from the box's wooco_components meta."""
    comps = meta['wooco_components']
    items = comps.items() if isinstance(comps, dict) else enumerate(comps)
    return {c.get('name'): (str(k), c) for k, c in items}

def component_keys():
    """Return {'Towels': key, 'Bathrobes': key}."""
    _, meta = box_meta()
    return {name: key for name, (key, _) in components(meta).items()}

def check_product():
    p, meta = box_meta()
    assert p['type'] == 'composite', p['type']
    assert p['catalog_visibility'] == 'hidden', p['catalog_visibility']
    assert p['name'] == 'Build your CZERA box', p['name']
    assert meta.get('wooco_pricing') == 'exclude', meta.get('wooco_pricing')
    assert str(meta.get('wooco_qty_min')) == '2' and str(meta.get('wooco_qty_max')) == '8'
    comps = components(meta)
    assert sorted(comps) == ['Bathrobes', 'Towels'], sorted(comps)
    for name, products, cap in (('Towels', TOWELS, 6), ('Bathrobes', ROBES, 2)):
        _, c = comps[name]
        got = sorted(int(x) for x in c['products'])
        assert got == products, f'{name} products: {got}'
        assert str(c['m_max']) == str(cap), f'{name} m_max: {c["m_max"]}'
    print('product OK', BOX_ID)

def guest_session():
    """An opener with its own cookie jar: one guest shopper."""
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

def add_to(op, ids, times=1):
    for _ in range(times):
        data = urllib.parse.urlencode({'add-to-cart': BOX_ID, 'quantity': 1, 'wooco_ids': ids}).encode()
        op.open(f'{SITE}/', data, timeout=TIMEOUT).read()

def store_cart(op):
    """GET the Store API cart the way the cart and checkout blocks do: no cache-busting
    parameter. Returns (headers, cart)."""
    with op.open(f'{SITE}/wp-json/wc/store/v1/cart', timeout=TIMEOUT) as r:
        return r.headers, json.loads(r.read())

def boxes(cart):
    return sum(i['quantity'] for i in cart['items'] if i['id'] == BOX_ID)

def add_box(ids, times=1):
    """Add the box `times` times in one guest session with a crafted wooco_ids string.
    Returns the number of boxes in that session's cart.
    The cart is read without a nocache parameter: /wp-json/wc/store/ is excluded from
    LiteSpeed, so the session's own cart comes back. If that exclusion is lost, these
    reads return a cached cart and the `cache` check says so."""
    op = guest_session()
    add_to(op, ids, times)
    return boxes(store_cart(op)[1])

def check_rules():
    k = component_keys()
    t, r = k['Towels'], k['Bathrobes']
    cases = [
        (f'63/2/{t},54/1/{r}', 1, 1),            # 2 bath towels + black robe -> added
        (f'63/7/{t}', 1, 0),                      # 7 towels -> rejected
        (f'51/3/{r}', 1, 0),                      # 3 robes -> rejected
        (f'57/1/{t}', 1, 0),                      # 1 item -> rejected
        (f'63/2/{t},25/1/{t}', 1, 0),             # foreign product (gift set) -> rejected
        (f'63/2/{t},60/0/{t}', 1, 1),             # zero quantity ignored -> added
        (f'63/2/{t}', 2, 2),                      # two valid boxes -> both added
        (f'63/4/{t},60/3/{t}', 1, 0),             # 7 towels split over two lines -> rejected
        (f'51/1/{r},54/2/{r}', 1, 0),             # 3 robes split over two lines -> rejected
        (f'63/4/{t},60/-3/{t}', 1, 0),            # negative qty bypass (plugin cleans '-3' to '3') -> rejected
        (f'63/1.5/{t},54/0.5/{r}', 1, 0),         # fractional quantities summing to 2 -> rejected
        (f'51/2/{t},63/1/{t}', 1, 0),             # robes under the Towels key -> rejected
        (f'63/2/{r}', 1, 0),                      # towels under the Bathrobes key -> rejected
    ]
    for ids, times, expected in cases:
        got = add_box(ids, times)
        assert got == expected, f'{ids} x{times}: expected {expected} box(es), got {got}'
    print('rules OK')

def check_page():
    req = urllib.request.Request(f'{SITE}/build-your-box/?nocache={uuid.uuid4().hex}', headers={'Authorization': auth()})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        html = r.read().decode('utf-8', 'ignore')
    via = 'front end'
    if '/coming-soon/' in html and len(html) < 500:
        # Coming-soon mode serves logged-out requests (an application password does
        # not log the front end in) a redirect stub. Fall back to the page's REST
        # render, which runs the same blocks and [czera_box_builder] shortcode server-side.
        html = api('/wp/v2/pages?slug=build-your-box')[0]['content']['rendered']
        via = 'REST render; front end is behind coming-soon'
    for needle in ('czera-box-builder', 'Build your own box', 'Choose a colour', 'Choose your towels',
                   'Choose your bathrobes', 'Clear selection', 'Add box to bag', 'name="wooco_ids"',
                   'data-box-toast', 'View bag ›'):
        assert needle in html, f'{needle!r} missing from the page'
    assert 'woocommerce-message' not in html, "WooCommerce's notice box is still on the page; the CZERA toast replaces it"
    assert f'name="add-to-cart" value="{BOX_ID}"' in html, 'the builder form does not post the box product'
    assert 'czera-box-intro' not in html, 'the old Spectra intro is still on the page'
    assert 'wooco-wrap' not in html, "the plugin's own picker is still on the page"
    data = json.loads(html.split('data-box-data>', 1)[1].split('</script>', 1)[0])
    ids = sorted(i['id'] for i in data['items'])
    assert ids == sorted(TOWELS + ROBES), f'builder items {ids}, expected {sorted(TOWELS + ROBES)}'
    assert data['caps'] == {'towels': 6, 'bathrobes': 2} and data['min'] == 2, f'builder rules {data}'
    print(f'page OK ({via})')

def reference_code(path):
    """The snippet code in a tools/wp/live reference copy, without its header
    (the '<?php' line and comment lines up to the first blank line)."""
    text = path.read_text(encoding='utf-8').replace('\r\n', '\n')
    assert text.startswith('<?php\n// Reference copy of live Code Snippet'), f'{path.name}: header missing'
    return text.partition('\n\n')[2].strip()

def check_snippets():
    listed = {s['id']: s for s in api('/code-snippets/v1/snippets')}
    for sid, name in RETIRED.items():
        s = listed.get(sid)
        assert s is None or (s.get('trashed') and not s.get('active')), \
            f'retired snippet {sid} "{name}" is still in use; deactivate and trash it'
    for sid, name in SNIPPETS.items():
        s = api(f'/code-snippets/v1/snippets/{sid}')
        assert s['active'] is True, f'snippet {sid} "{s["name"]}" is not active'
        live = s['code'].replace('\r\n', '\n').strip()
        assert live == reference_code(LIVE / name), \
            f'snippet {sid} "{s["name"]}" differs from tools/wp/live/{name}; update the one that is wrong'
    print('snippets OK', ', '.join(map(str, SNIPPETS)))

def check_cache():
    k = component_keys()
    op = guest_session()
    add_to(op, f'63/2/{k["Towels"]},54/1/{k["Bathrobes"]}')
    for n in (1, 2):
        headers, cart = store_cart(op)
        lsc = (headers.get('x-litespeed-cache') or '').lower()
        assert 'hit' not in lsc, f'GET {n}: x-litespeed-cache: {lsc} (Store API cart served from cache)'
        assert 'no-store' in (headers.get('Cache-Control') or ''), f'GET {n}: Cache-Control: {headers.get("Cache-Control")}'
        assert boxes(cart) == 1, f'GET {n}: expected the box in this session cart, got {boxes(cart)}'
    _, cart = store_cart(guest_session())
    assert not cart['items'], f'a fresh session saw {len(cart["items"])} item(s): a cart is being shared'
    print('cache OK')

CHECKS = {'plugins': check_plugins, 'product': check_product, 'rules': check_rules,
          'page': check_page, 'snippets': check_snippets, 'cache': check_cache}

def usage():
    print(__doc__.split('\n\n')[0])
    print('\nusage: python tools/wp/box_checks.py <check>\n\nchecks:')
    for name in CHECKS:
        print(f'  {name}')
    print('  all       run every check above, in this order')
    print('\nWP_AUTH must hold an admin application password as user:password; CZERA_BOX_ID defaults to 210.')

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) == 2 else None
    if arg == 'all':
        for check in CHECKS.values():
            check()
    elif arg in CHECKS:
        CHECKS[arg]()
    else:
        usage()
        sys.exit(2)
