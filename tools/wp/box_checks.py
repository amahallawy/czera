# tools/wp/box_checks.py
"""Live checks for the czeramaison.com Build your box page.
Usage: WP_AUTH='user:app password' CZERA_BOX_ID=<id> python tools/wp/box_checks.py <check>"""
import base64, http.cookiejar, json, os, sys, urllib.parse, uuid, urllib.request, urllib.error

SITE = 'https://czeramaison.com'
AUTH = 'Basic ' + base64.b64encode(os.environ['WP_AUTH'].encode()).decode()

def api(path, method='GET', body=None):
    req = urllib.request.Request(SITE + '/wp-json' + path, method=method,
        headers={'Authorization': AUTH, 'Content-Type': 'application/json'},
        data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'body': e.read().decode()[:300]}

def check_plugins():
    active = {p['plugin'].split('/')[0] for p in api('/wp/v2/plugins') if p['status'] == 'active'}
    missing = {'wpc-composite-products', 'code-snippets'} - active
    assert not missing, f'not active: {missing}'
    print('plugins OK')

TOWELS = [57, 60, 63, 66, 69, 72]
ROBES = [51, 54]
BOX_ID = int(os.environ.get('CZERA_BOX_ID', '0'))

def box_meta():
    p = api(f'/wc/v3/products/{BOX_ID}?context=edit')
    return p, {m['key']: m['value'] for m in p['meta_data']}

def component_keys():
    """Return {'Towels': key, 'Bathrobes': key} from the box's wooco_components meta."""
    _, meta = box_meta()
    comps = meta['wooco_components']
    items = comps.items() if isinstance(comps, dict) else enumerate(comps)
    return {c.get('name'): str(k) for k, c in items}

def check_product():
    assert BOX_ID, 'set CZERA_BOX_ID'
    p, meta = box_meta()
    assert p['type'] == 'composite', p['type']
    assert p['catalog_visibility'] == 'hidden', p['catalog_visibility']
    assert p['name'] == 'Build your CZERA box', p['name']
    assert meta.get('wooco_pricing') == 'exclude', meta.get('wooco_pricing')
    assert str(meta.get('wooco_qty_min')) == '2' and str(meta.get('wooco_qty_max')) == '8'
    assert sorted(component_keys()) == ['Bathrobes', 'Towels'], component_keys()
    print('product OK', BOX_ID)

def add_box(ids, times=1):
    """Add the box `times` times in one session with a crafted wooco_ids string.
    Returns the number of boxes in that session's cart."""
    jar = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    for _ in range(times):
        data = urllib.parse.urlencode({'add-to-cart': BOX_ID, 'quantity': 1, 'wooco_ids': ids}).encode()
        op.open(f'{SITE}/', data).read()
    # nocache: LiteSpeed would otherwise serve a cached, empty cart for this REST route
    cart = json.loads(op.open(f'{SITE}/wp-json/wc/store/v1/cart?nocache={uuid.uuid4().hex}').read())
    return sum(i['quantity'] for i in cart['items'] if i['id'] == BOX_ID)

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
    req = urllib.request.Request(f'{SITE}/build-your-box/?nocache={uuid.uuid4().hex}', headers={'Authorization': AUTH})
    html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')
    via = 'front end'
    if '/coming-soon/' in html and len(html) < 500:
        # Coming-soon mode serves logged-out requests (an application password does
        # not log the front end in) a redirect stub. Fall back to the page's REST
        # render, which runs the same blocks and [product_page] shortcode server-side.
        html = api('/wp/v2/pages?slug=build-your-box')[0]['content']['rendered']
        via = 'REST render; front end is behind coming-soon'
    assert 'czera-box-intro' in html, 'intro missing'
    assert 'wooco' in html, 'builder form missing'
    assert 'Choose up to six towels and two bathrobes' in html, 'intro line missing'
    print(f'page OK ({via})')

CHECKS = {'plugins': check_plugins, 'product': check_product, 'rules': check_rules, 'page': check_page}

if __name__ == '__main__':
    CHECKS[sys.argv[1]]()
