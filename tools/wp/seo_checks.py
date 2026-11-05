# tools/wp/seo_checks.py
"""Live SEO checks for the czeramaison.com store (Rank Math, WooCommerce).

Usage:
    python tools/wp/seo_checks.py <check>
    python tools/wp/seo_checks.py all          # every check, in the order listed by usage
    python tools/wp/seo_checks.py selftest     # offline tests of the pure helpers
    python tools/wp/seo_checks.py push-meta    # write tools/wp/seo_meta.json into Rank Math

Environment:
    WP_AUTH       Required. A WordPress application password for an admin user,
                  given as 'user:password' (wp-admin > Users > Profile >
                  Application Passwords).

Purge the LiteSpeed cache (MCP ability `hostinger-ai/litespeed-cache-flush`) before
a run, so the checks see the current heads, sitemaps and llms.txt.

Each check prints `PASS <name>` or `FAIL <name>: <reason>`; the script exits
non-zero if any check fails. The checks are read-only against production and need
Rank Math's "Headless CMS Support" switched on (General Settings > Others), which
registers /wp-json/rankmath/v1/getHead. The front end is behind a coming-soon
redirect for logged-out visitors, so rendered <head> HTML comes from getHead, while
sitemaps, llms.txt and the redirect itself are fetched logged out.

`tools/wp/seo_meta.json` holds the wanted search title and description for each
indexable page, product category and product, keyed by WordPress ID:
    {"pages": {"<id>": {"title": str, "description": str}}, "terms": {...}, "products": {...}}
A page's description is also its excerpt, which Rank Math's llms.txt uses as the page summary.
"""
import base64, html, json, os, re, sys, urllib.parse, urllib.request, urllib.error, uuid
from pathlib import Path

SITE = 'https://czeramaison.com'
TIMEOUT = 30
META_FILE = Path(__file__).resolve().parent / 'seo_meta.json'
BOX_ID = 210
PAGE_IDS = (87, 74, 12)  # Home, Build your box, Returns & exchanges
PAGE_SLUGS = ('shop', 'about', 'faq')
CATEGORY_SLUGS = ('towels', 'bathrobes', 'gift-sets', 'beach')
NOINDEX_URLS = ('/cart/', '/checkout/', '/my-account/', '/product/build-your-czera-box/')
PRIVATE_EXTRA = ('/cart/', '/checkout/', '/my-account/', '/coming-soon/')  # heads checked for author data
OPTIONAL_PAGE_SLUGS = ('faq',)  # not created until a later phase
NOINDEX = re.compile(r'<meta name="robots" content="[^"]*\bnoindex\b', re.I)
COMING_SOON = 'window.location.href = "https://czeramaison.com/coming-soon/"'
ARABIC = re.compile(r'[\u0600-\u06FF]')
BANNED = re.compile(
    r'discover|elevate|indulge|best in class|egyptian cotton|by hand|handmade|!|instapay'
    r'|next day|2\s*[–-]\s*5 days|machine wash|tumble|deliver\w*[^.]{0,30}\bin \d+ days', re.I)
MONEY = re.compile(r'(?:\b(?:EGP|LE)\b|£)\s*\d|\d\s*(?:\b(?:EGP|LE)\b|£)', re.I)

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

def fetch(path):
    """A logged-out GET of a front-end path, as text. A browser or crawler sees this."""
    url = SITE + path + ('&' if '?' in path else '?') + 'nocache=' + uuid.uuid4().hex
    req = urllib.request.Request(url, headers={'Cache-Control': 'no-cache'})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        raise SystemExit(f'HTTP {e.code} {path}')

def head(url):
    """The rendered <head> HTML of a URL, from Rank Math's getHead route."""
    r = api('/rankmath/v1/getHead?url=' + urllib.parse.quote(url, safe=''))
    assert r.get('success'), f'getHead failed for {url}: {str(r)[:200]}'
    return r['head']

def products():
    """Published products other than the box, with their live prices."""
    out = api('/wc/v3/products?per_page=100&status=publish'
              '&_fields=id,name,slug,permalink,price,regular_price,sale_price')
    return [p for p in out if p['id'] != BOX_ID]

def indexable():
    """Every page, category and product that should appear in search. Fails if a page or
    category the store must have is missing; only the pages in OPTIONAL_PAGE_SLUGS may be."""
    items, missing = [], []
    for pid in PAGE_IDS:
        p = api(f'/wp/v2/pages/{pid}?_fields=id,link,title')
        items.append({'kind': 'page', 'id': p['id'], 'url': p['link'], 'name': html.unescape(p['title']['rendered'])})
    for slug in PAGE_SLUGS:
        found = api(f'/wp/v2/pages?slug={slug}&status=publish&_fields=id,link,title')
        if not found and slug not in OPTIONAL_PAGE_SLUGS:
            missing.append(f'page {slug!r}')
        for p in found:
            items.append({'kind': 'page', 'id': p['id'], 'url': p['link'], 'name': html.unescape(p['title']['rendered'])})
    cats = {c['slug']: c for c in api('/wp/v2/product_cat?per_page=100&_fields=id,slug,link,name')}
    for slug in CATEGORY_SLUGS:
        c = cats.get(slug)
        if not c:
            missing.append(f'product category {slug!r}')
            continue
        items.append({'kind': 'cat', 'id': c['id'], 'url': c['link'], 'name': html.unescape(c['name'])})
    assert not missing, 'indexable(): not found on the store: ' + ', '.join(missing)
    for p in products():
        items.append({'kind': 'product', 'id': p['id'], 'url': p['permalink'], 'name': html.unescape(p['name'])})
    return items

def jsonld(markup):
    """Every JSON-LD node in a <head>, with @graph flattened."""
    nodes = []
    for raw in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', markup, re.S):
        data = json.loads(raw)
        nodes.extend(data['@graph'] if isinstance(data, dict) and '@graph' in data else
                     data if isinstance(data, list) else [data])
    return nodes

def of_type(nodes, kind):
    return [n for n in nodes if kind in (n['@type'] if isinstance(n.get('@type'), list) else [n.get('@type')])]

def first(value):
    return value[0] if isinstance(value, list) and value else value

def strings(value):
    """Every string inside parsed JSON, at any depth."""
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for v in value.values():
            yield from strings(v)
    elif isinstance(value, list):
        for v in value:
            yield from strings(v)

def jsonld_encoding_problems(nodes):
    """JSON-LD strings still HTML-encoded. JSON is not HTML: '&' should appear as '&'."""
    return sorted({s for s in strings(nodes) if '&amp;' in s or '&#038;' in s})

def privacy_problems(markup):
    """Traces in a <head> of the admin's author URL (which carries the login slug) or Gravatar."""
    return [needle for needle in ('/author/', 'gravatar.com') if needle in markup]

def coming_soon_live():
    """True while a logged-out visitor to / is redirected to /coming-soon/."""
    return COMING_SOON in fetch('/')

def check_site():
    for path in ('/', '/product/bath-towel/'):
        assert COMING_SOON in fetch(path), f'{path} does not redirect logged-out visitors to /coming-soon/'

def check_cleanup():
    problems = []
    posts = api('/wp/v2/posts?status=publish&_fields=id')
    if posts:
        problems.append(f'{len(posts)} published post(s): ' + ', '.join(str(p['id']) for p in posts))
    cats = api('/wc/v3/products/categories?per_page=100&_fields=id,slug')
    if any(c['slug'] == 'uncategorized' for c in cats):
        problems.append('product category "uncategorized" still exists')
    # default_product_cat is not exposed over REST, so check its visible effect: the
    # box, which is filed under the default category, must be in gift-sets only.
    box_cats = [c['slug'] for c in api(f'/wc/v3/products/{BOX_ID}?_fields=categories')['categories']]
    if box_cats != ['gift-sets']:
        problems.append(f'product {BOX_ID} categories are {box_cats}, expected ["gift-sets"]')
    index = fetch('/sitemap_index.xml')
    for name in ('post-sitemap.xml', 'category-sitemap.xml'):
        if name in index:
            problems.append(f'sitemap_index.xml lists {name}')
    if 'product_cat-sitemap.xml' not in index:
        problems.append('sitemap_index.xml lists no product_cat-sitemap.xml')
    else:
        cat_map = fetch('/product_cat-sitemap.xml')
        for it in indexable():
            if it['kind'] == 'cat' and f'<loc>{it["url"]}</loc>' not in cat_map:
                problems.append(f'product_cat-sitemap.xml lacks {it["url"]}')
    assert not problems, '; '.join(problems)

def check_noindex():
    problems = []
    for path in NOINDEX_URLS:
        if not NOINDEX.search(head(SITE + path)):
            problems.append(f'{path} is not noindex')
    if 'build-your-czera-box' in fetch('/product-sitemap.xml'):
        problems.append('product-sitemap.xml lists build-your-czera-box')
    if '/build-your-box/' not in fetch('/page-sitemap.xml'):
        problems.append('page-sitemap.xml does not list /build-your-box/')
    assert not problems, '; '.join(problems)

def check_schema():
    problems = []
    live = {p['id']: p for p in products()}
    for it in indexable():
        nodes = jsonld(head(it['url']))
        for bad in jsonld_encoding_problems(nodes):
            problems.append(f'{it["kind"]} {it["id"]}: JSON-LD string still HTML-encoded: {bad!r}')
        if it['kind'] != 'product':
            continue
        p = live[it['id']]
        prods = of_type(nodes, 'Product')
        if not prods:
            problems.append(f'{p["slug"]}: no Product JSON-LD')
            continue
        prod = prods[0]
        if prod.get('name') != html.unescape(p['name']):
            problems.append(f'{p["slug"]}: Product name {prod.get("name")!r}, store name {html.unescape(p["name"])!r}')
        offers = first(prod.get('offers')) or {}
        if offers.get('priceCurrency') != 'EGP':
            problems.append(f'{p["slug"]}: priceCurrency {offers.get("priceCurrency")!r}, expected EGP')
        try:
            if float(offers.get('price')) != float(p['price']):
                problems.append(f'{p["slug"]}: offer price {offers.get("price")}, live price {p["price"]}')
        except (TypeError, ValueError):
            problems.append(f'{p["slug"]}: offer price {offers.get("price")!r} is not a number')
        brand = prod.get('brand')
        if not isinstance(brand, dict) or brand.get('name') != 'CZERA':
            problems.append(f'{p["slug"]}: brand is {brand!r}, expected name CZERA')
        if not of_type(nodes, 'BreadcrumbList'):
            problems.append(f'{p["slug"]}: no BreadcrumbList')
    home = jsonld(head(SITE + '/'))
    orgs = [o for o in of_type(home, 'Organization') if o.get('name') == 'CZERA']
    if not orgs:
        problems.append('Home: no Organization named CZERA')
    else:
        same = orgs[0].get('sameAs') or []
        same = [same] if isinstance(same, str) else same
        for url in ('https://www.instagram.com/czera_maison', 'https://www.facebook.com/CzeraMaison'):
            if url not in same:
                problems.append(f'Home: Organization sameAs lacks {url}')
    for bad in jsonld_encoding_problems(home):
        problems.append(f'Home: JSON-LD string still HTML-encoded: {bad!r}')
    sites = of_type(home, 'WebSite')
    if not sites:
        problems.append('Home: no WebSite')
    elif (sites[0].get('name'), sites[0].get('alternateName')) != ('CZERA', 'Czera Maison'):
        problems.append(f'Home: WebSite name {sites[0].get("name")!r} / alternateName '
                        f'{sites[0].get("alternateName")!r}, expected CZERA / Czera Maison')
    shown = ' | '.join(problems[:6]) + (' | ...' if len(problems) > 6 else '')
    assert not problems, f'{len(problems)} problem(s): {shown}'

def check_privacy():
    """No head names the admin: no /author/<slug>/ URL, no Gravatar (#155)."""
    urls = [it['url'] for it in indexable()] + [SITE + path for path in PRIVATE_EXTRA]
    problems = [f'{url} has {needle!r}' for url in urls for needle in privacy_problems(head(url))]
    assert not problems, '; '.join(problems)

def read_meta():
    return json.loads(META_FILE.read_text(encoding='utf-8'))

def raw_tag(markup, pattern):
    """The first capture group of pattern in markup, exactly as served (still HTML-encoded)."""
    m = re.search(pattern, markup, re.S)
    return m.group(1) if m else None

def encoding_problems(raw):
    """Double or numeric encodings in raw served text; unescaping once would hide them."""
    return [bad for bad in ('&amp;amp;', '&#038;') if raw and bad in raw]

def price_hits(text, p):
    """Prices stated in text: a number beside EGP/LE/pound, or the product's live or regular
    price standing alone (sizes such as 70 x 140 cm and GSM figures do not count)."""
    hits = [m.group(0) for m in MONEY.finditer(text)]
    for value in {p['price'], p['regular_price']} if p else ():
        if not value or float(value) == 0:
            continue
        num = f'{float(value):g}'
        pat = (r'(?<![\d.,])(?<!×)(?<!×\s)(?<!\bx)(?<!\bx\s)' + re.escape(num) +
               r'(?:\.0+)?(?![\d.,])(?!\s*(?:\+|×|x\b|cm\b|gsm\b|kg\b|%))')
        hits += [f'{num}, the live price' for _ in re.finditer(pat, text, re.I)]
    return hits

def check_meta():
    wanted = read_meta()
    section = {'page': 'pages', 'cat': 'terms', 'product': 'products'}
    by_id = {p['id']: p for p in products()}
    problems, titles, descs = [], {}, {}
    for it in indexable():
        label = f'{it["kind"]} {it["id"]} ({it["name"]})'
        want = wanted.get(section[it['kind']], {}).get(str(it['id']))
        if not want:
            problems.append(f'{label}: no entry in seo_meta.json')
            continue
        markup = head(it['url'])
        raw_title = raw_tag(markup, r'<title>(.*?)</title>')
        raw_desc = raw_tag(markup, r'<meta name="description" content="(.*?)"\s*/?>')
        for field, raw in (('title', raw_title), ('description', raw_desc)):
            for bad in encoding_problems(raw):
                problems.append(f'{label}: {field} is double-encoded ({bad} in {raw!r})')
        title = html.unescape(raw_title) if raw_title is not None else None
        desc = html.unescape(raw_desc) if raw_desc is not None else None
        if title != want['title']:
            problems.append(f'{label}: title is {title!r}, wanted {want["title"]!r}')
        if desc != want['description']:
            problems.append(f'{label}: description is {desc!r}, wanted {want["description"]!r}')
        for field, text in (('title', title), ('description', desc)):
            if text is None:
                continue
            if field == 'title' and not text.endswith(' | CZERA'):
                problems.append(f'{label}: title does not end " | CZERA"')
            if field == 'description':
                if len(text) > 155:
                    problems.append(f'{label}: description is {len(text)} characters (max 155)')
                for hit in price_hits(text, by_id.get(it['id']) if it['kind'] == 'product' else None):
                    problems.append(f'{label}: description states a price ({hit})')
            for what, hit in (('a banned word', BANNED.search(text)), ('Arabic', ARABIC.search(text)),
                              ('EGP', re.search('EGP', text))):
                if hit:
                    problems.append(f'{label}: {field} has {what} {hit.group(0)!r}')
        titles.setdefault(title, []).append(label)
        descs.setdefault(desc, []).append(label)
    for kind, seen in (('title', titles), ('description', descs)):
        for text, labels in seen.items():
            if text is not None and len(labels) > 1:
                problems.append(f'duplicate {kind} {text!r}: ' + '; '.join(labels))
    shown = ' | '.join(problems[:6]) + (' | ...' if len(problems) > 6 else '')
    assert not problems, f'{len(problems)} problem(s): {shown}'

def page_summary_problems(text):
    """Problems with the lines under '## Pages': each needs a summary of 6+ words, none the JS notice."""
    problems = []
    m = re.search(r'^## Pages\n(.*?)(?=^## |\Z)', text, re.S | re.M)
    if not m:
        return ["no '## Pages' section"]
    for line in m.group(1).splitlines():
        if not line.startswith('- ['):
            continue
        entry = re.match(r'- \[([^\]]*)\]\(([^)]*)\)(?::\s*(.*))?$', line)
        name, url, summary = (entry.group(1), entry.group(2), (entry.group(3) or '').strip()) if entry else (line, line, '')
        if url.rstrip('/').endswith('/coming-soon'):
            continue  # the placeholder page has no description of its own
        if 'turn on javascript' in summary.lower():
            problems.append(f'{name!r} summary is the JavaScript notice')
        elif len(summary.split()) < 6:
            problems.append(f'{name!r} summary has fewer than 6 words: {summary!r}')
    return problems

def check_llms():
    text = fetch('/llms.txt')
    problems = []
    missing = [it['url'] for it in indexable() if it['url'] not in text]
    if missing:
        problems.append(f'{len(missing)} indexable URL(s) missing, e.g. {missing[0]}')
    # /coming-soon/ is an indexable page, so Rank Math lists it. It is only
    # acceptable in the file while the coming-soon redirect is live.
    forbidden = ['hello-world', 'EGP'] + ([] if coming_soon_live() else ['/coming-soon/'])
    for needle in forbidden:
        if needle in text:
            problems.append(f'contains {needle!r}')
    for needle in ('## About CZERA', '650+ GSM'):
        if needle not in text:
            problems.append(f'missing {needle!r}')
    problems += page_summary_problems(text)
    if ARABIC.search(text):
        problems.append('contains Arabic text')
    # The whole file, the About CZERA block included, follows the copy rules.
    for m in BANNED.finditer(text):
        problems.append(f'has a banned word {m.group(0)!r}')
    for p in [None] + products():
        for hit in price_hits(text, p):
            problems.append(f'states a price ({hit})')
    # Page summaries come from the excerpts, which must equal the seo_meta.json descriptions.
    for pid, m in read_meta().get('pages', {}).items():
        raw = api(f'/wp/v2/pages/{pid}?context=edit&_fields=excerpt')['excerpt']['raw']
        if raw != m['description']:
            problems.append(f'page {pid} excerpt is {raw!r}, wanted its description')
    assert not problems, '; '.join(problems)

def push_meta():
    """Write seo_meta.json into Rank Math: the title and description of every listed object,
    and each page's description as its excerpt too (llms.txt's page summary)."""
    wanted = read_meta()
    kinds = {'pages': 'post', 'products': 'post', 'terms': 'term'}
    count = 0
    for section, object_type in kinds.items():
        for oid, m in wanted.get(section, {}).items():
            api('/rankmath/v1/updateMeta', 'POST', {'objectType': object_type, 'objectID': int(oid),
                'meta': {'rank_math_title': m['title'], 'rank_math_description': m['description']}})
            if section == 'pages':
                api(f'/wp/v2/pages/{int(oid)}', 'POST', {'excerpt': m['description']})
            count += 1
    print(f'push-meta: wrote {count} object(s)')

CHECKS = {'site': check_site, 'cleanup': check_cleanup, 'noindex': check_noindex,
          'schema': check_schema, 'privacy': check_privacy, 'meta': check_meta, 'llms': check_llms}

def run(names):
    failed = 0
    for name in names:
        try:
            CHECKS[name]()
            print(f'PASS {name}')
        except (AssertionError, SystemExit) as e:
            failed += 1
            print(f'FAIL {name}: {e}')
        except Exception as e:  # one check crashing must not hide the others
            failed += 1
            print(f'FAIL {name}: {type(e).__name__}: {e}')
    return 1 if failed else 0

def selftest():
    """Offline checks of the pure helpers, with literal inputs. Needs no network or WP_AUTH."""
    product = {'price': '650', 'regular_price': '650'}
    cases = [
        ('raw title with &amp;amp; fails', bool(encoding_problems('His &amp;amp; Hers | CZERA'))),
        ('raw title with &#038; fails', bool(encoding_problems('His &#038; Hers | CZERA'))),
        ('single-encoded title passes', not encoding_problems('His &amp; Hers Robes | CZERA')),
        ('single-encoded title unescapes to &',
         html.unescape('His &amp; Hers Robes | CZERA') == 'His & Hers Robes | CZERA'),
        ('650+ GSM is not a price', not price_hits('Bath Sheet, 90 × 160 cm, 650+ GSM', product)),
        ('130 kg is not a price', not price_hits('Holds 130 kg', {'price': '130', 'regular_price': '130'})),
        ('650 EGP is a price', bool(price_hits('Bath Sheet for 650 EGP', product))),
        ('standalone 650 is a price', bool(price_hits('Bath Sheet at 650 only', product))),
        ('"2 less" is not money', not MONEY.search('2 less')),
        ('"2 LE" is money', bool(MONEY.search('2 LE'))),
        ('Arabic matches U+0628', bool(ARABIC.search('\u0628'))),
        ('Arabic does not match abc', not ARABIC.search('abc')),
        ('page summary of 6 words passes',
         not page_summary_problems('## Pages\n- [A](https://x/a/): one two three four five six\n\n## Products\n')),
        ('page without summary fails',
         bool(page_summary_problems('## Pages\n- [A](https://x/a/)\n\n## Products\n'))),
        ('page with 5 words fails',
         bool(page_summary_problems('## Pages\n- [A](https://x/a/): one two three four five\n'))),
        ('JavaScript notice fails',
         bool(page_summary_problems('## Pages\n- [A](https://x/a/): Turn on JavaScript to build a box now\n'))),
        ('noindex, follow is noindex', bool(NOINDEX.search('<meta name="robots" content="noindex, follow"/>'))),
        ('follow, noindex is noindex', bool(NOINDEX.search('<meta name="robots" content="follow, noindex"/>'))),
        ('index, follow is not noindex', not NOINDEX.search('<meta name="robots" content="index, follow"/>')),
        ('&amp; in a nested JSON-LD string fails',
         bool(jsonld_encoding_problems([{'item': {'name': 'Hand &amp; Bath Sheet Set'}}]))),
        ('&#038; in a JSON-LD list fails', bool(jsonld_encoding_problems([{'a': ['x &#038; y']}]))),
        ('a plain & in JSON-LD passes', not jsonld_encoding_problems([{'name': 'His & Hers Robes'}])),
        ('an author URL fails privacy', bool(privacy_problems('"url":"https://x/author/admin-slug/"'))),
        ('a Gravatar fails privacy', bool(privacy_problems('https://secure.gravatar.com/avatar/abc'))),
        ('a clean head passes privacy', not privacy_problems('<title>Bath Towel | CZERA</title>')),
        ('a banned word is caught in llms text', bool(BANNED.search('- Orders arrive next day.'))),
        ('the About block beach line passes the copy rules', not BANNED.search(
            '- Beach towels are 100 × 200 cm, in blue or yellow stripes; the beach towel gift set pairs blue and orange.')
            and not price_hits('- Beach towels are 100 × 200 cm', {'price': '200', 'regular_price': '200'})),
        ('coming-soon entry needs no summary',
         not page_summary_problems('## Pages\n- [Coming soon](https://x/coming-soon/)\n')),
    ]
    failed = 0
    for name, ok in cases:
        failed += not ok
        print(f'{"PASS" if ok else "FAIL"} selftest: {name}')
    return 1 if failed else 0

def usage():
    print(__doc__.split('\n\n')[0])
    print('\nusage: python tools/wp/seo_checks.py <check|all|selftest|push-meta>\n\nchecks:')
    for name in CHECKS:
        print(f'  {name}')
    print('  all        run every check above, in this order')
    print('  selftest   offline checks of the helper functions (no network, no WP_AUTH)')
    print('  push-meta  write tools/wp/seo_meta.json into Rank Math')
    print('\nWP_AUTH must hold an admin application password as user:password.')

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) == 2 else None
    if arg == 'all':
        sys.exit(run(CHECKS))
    elif arg in CHECKS:
        sys.exit(run([arg]))
    elif arg == 'selftest':
        sys.exit(selftest())
    elif arg == 'push-meta':
        push_meta()
    else:
        usage()
        sys.exit(2)
