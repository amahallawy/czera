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

CHECKS = {'plugins': check_plugins}

if __name__ == '__main__':
    CHECKS[sys.argv[1]]()
