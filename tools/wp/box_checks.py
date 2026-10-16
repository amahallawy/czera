# tools/wp/box_checks.py
"""Live checks for the czeramaison.com Build your box page.
Usage: WP_AUTH='user:app password' CZERA_BOX_ID=<id> python tools/wp/box_checks.py <check>"""
import base64, json, os, sys, urllib.request, urllib.error

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

CHECKS = {'plugins': check_plugins, 'product': check_product}

if __name__ == '__main__':
    CHECKS[sys.argv[1]]()
