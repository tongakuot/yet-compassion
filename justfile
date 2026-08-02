# Y.E.T. Compassion website — task runner
# Usage: `just` lists recipes; `just <recipe>` runs one.

# Default: list available recipes
default:
    @just --list

# Live-reload preview of the site
preview:
    quarto preview

# Render the full site to _site/
render:
    quarto render

# Checks every .qmd: YAML front matter parses, fenced divs balance,
# no opener-directly-after-text leaks (the literal ':::' bug); plus
# SCSS brace balance. Prints the hex-color inventory of custom.scss
# so palette drift stays visible — once the redesign locks the
# palette, tighten the inventory into a hard allowed-set check.
# Validate sources before rendering (qmd + SCSS + palette report)
check:
    #!/usr/bin/env python3
    import glob, re, sys
    ok = True
    fo = re.compile(r'^:{3,}\s*(\{.*\}|[\w-]+)\s*$')
    fc = re.compile(r'^:{3,}\s*$')
    qmds = [p for p in glob.glob('**/*.qmd', recursive=True)
            if not p.startswith(('_site/', '.quarto/'))]
    for p in sorted(qmds):
        src = open(p).read()
        m = re.match(r'^---\n(.*?)\n---\n', src, re.S)
        if m:
            try:
                import yaml
                yaml.safe_load(m.group(1))
            except ModuleNotFoundError:
                pass
            except Exception as e:
                ok = False; print(f'FAIL: {p}: YAML front matter: {e}')
            body = src[m.end():]
        else:
            body = src
        lines = body.splitlines()
        leaks = [i + 1 for i in range(1, len(lines))
                 if fo.match(lines[i].strip()) and lines[i - 1].strip()
                 and not fo.match(lines[i - 1].strip())
                 and not fc.match(lines[i - 1].strip())]
        if leaks:
            ok = False
            print(f"FAIL: {p}: opening fence directly after text "
                  f"(renders literal ':::') at body lines {leaks}")
        depth = 0
        for n, l in enumerate(lines, 1):
            s = l.strip()
            if fo.match(s): depth += 1
            elif fc.match(s): depth -= 1
            if depth < 0:
                ok = False
                print(f'FAIL: {p}: extra closing fence near body line {n}')
                depth = 0
        if depth != 0:
            ok = False; print(f'FAIL: {p}: {depth} unclosed fenced div(s)')
    # Donation-link guard: these Stripe payment links are load-bearing.
    # Each must appear EXACTLY once in donate.qmd, byte-identical.
    STRIPE_LINKS = [
        'https://donate.stripe.com/14AdR85cu0Jzami1TcdnW02',  # one-time
        'https://donate.stripe.com/5kQ7sK9sKak96621TcdnW03',  # $25/mo
        'https://donate.stripe.com/5kQ8wO5cuak9dyu7dwdnW04',  # $50/mo
        'https://donate.stripe.com/8x23cu7kCfEtgKG41kdnW05',  # $100/mo
        'https://donate.stripe.com/28E14m5cu2RH0LIcxQdnW06',  # $250/mo
    ]
    donate = open('donate.qmd').read()
    for url in STRIPE_LINKS:
        n = donate.count(url)
        if n != 1:
            ok = False
            print(f'FAIL: donate.qmd: Stripe link {url[-8:]} appears {n}x (expected 1)')
    scss = open('styles/custom.scss').read()
    if scss.count('{') != scss.count('}'):
        ok = False; print('FAIL: styles/custom.scss brace mismatch')
    colors = sorted({c.upper() for c in re.findall(r'#[0-9a-fA-F]{6}\b', scss)})
    print(f'palette inventory ({len(colors)} colors in custom.scss): '
          + ' '.join(colors))
    print('all checks passed' if ok else 'checks FAILED')
    sys.exit(0 if ok else 1)

# Validate, then render — the safe pre-publish path
build: check render

# Remove generated output (_site/ and Quarto caches)
clean:
    rm -rf _site .quarto

# Report images over 500 KB — candidates for compression before deploy
heavy-images:
    #!/usr/bin/env python3
    import os
    hits = []
    for root, dirs, files in os.walk('images'):
        for f in files:
            p = os.path.join(root, f)
            kb = os.path.getsize(p) / 1024
            if kb > 500:
                hits.append((kb, p))
    for kb, p in sorted(hits, reverse=True):
        print(f'{kb / 1024:6.1f} MB  {p}')
    print(f'{len(hits)} image(s) over 500 KB' if hits
          else 'no images over 500 KB')

# Netlify's Quarto plugin renders and deploys on push, so a push
# IS the deploy step — this recipe asks before pushing.
# Validate, then push to origin/main to trigger the Netlify deploy
publish: check
    #!/usr/bin/env bash
    set -euo pipefail
    read -r -p "Push to origin/main and trigger the Netlify deploy? [y/N] " a
    [[ "$a" == [yY]* ]] || { echo "aborted"; exit 1; }
    git push origin main
