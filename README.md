# matdata.eu

Source of the MatData company website: **<https://matdata.eu>**

The aliases [matdata.be](https://www.matdata.be) and [matdata.store](https://www.matdata.store)
point to the same site.

The site is a small [Jekyll](https://jekyllrb.com/) site. All texts and lists live in plain YAML
files under [`_data/`](_data/), so most changes never touch HTML.

## Editing the content

Edit a file in `_data/` (directly on GitHub is fine) and push to `main`. The site rebuilds and
goes live on its own. Each YAML file starts with a comment explaining its
fields.

| File | What it controls |
| --- | --- |
| [`home.yml`](_data/home.yml) | Headings and texts of every homepage section, contact details, footer |
| [`nav.yml`](_data/nav.yml) | The menu at the top of every page |
| [`roles.yml`](_data/roles.yml) | The roles typed in the hero ("I'm Mathias, ...") |
| [`credentials.yml`](_data/credentials.yml) | The strip of credentials under the hero |
| [`specialisms.yml`](_data/specialisms.yml) | The two "Expertise" cards |
| [`services.yml`](_data/services.yml) | The service cards |
| [`projects.yml`](_data/projects.yml) | The project cards (screenshots go in `assets/img/projects/`) |
| [`product_services.yml`](_data/product_services.yml) | The "Services around my tools" page ([`products.html`](products.html)) |
| [`career.yml`](_data/career.yml) | The "Track record" timeline |
| [`talks.yml`](_data/talks.yml) | Talks and papers |
| [`slide_decks.yml`](_data/slide_decks.yml) | The slide deck cards under "Talks & papers" |
| [`clients.yml`](_data/clients.yml) | The customers & partners logo grid |
| [`social.yml`](_data/social.yml) | Profile links in "About" |
| [`network_explorer.yml`](_data/network_explorer.yml) | Texts of the animated "One network, seven views" explorer |

Text is plain text: no HTML or Markdown, and a bare `&` is fine. Quote a value that contains a
colon (`"like: this"`).

## Project structure

```
_data/            all texts and lists (see above)
_layouts/         default.html: page shell with header, menu and footer
_includes/        network-explorer.html: markup of the animated explorer
index.html        the homepage, section by section
products.html     the "Services around my tools" page
privacy.html      privacy statement
404.html          not-found page
assets/css/       site.css: all styles
assets/js/        site.js (menu, typed roles) and network-explorer.js (explorer drawings)
assets/img/       logos, photos, favicons and project screenshots
assets/shared/    files offered for download (course material)
_config.yml       site title, description, keywords and build excludes
CNAME             custom domain for GitHub Pages
```

## Deployment

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds the site with GitHub Pages'
own Jekyll builder (`actions/jekyll-build-pages`) and deploys it to GitHub Pages on every push
to `main`. It can also be started by hand from the Actions tab.

The custom domain is set in [`CNAME`](CNAME) (`matdata.eu`); `www.matdata.eu` redirects to it
automatically.

`.gitlab-ci.yml` and `_redirects` are left over from the earlier GitLab Pages and Netlify hosting.
They are excluded from the build and not used by the GitHub deployment.

## Preview locally

With Ruby installed:

```sh
gem install github-pages
jekyll serve
```

Then open <http://localhost:4000>. The `github-pages` gem pins the same Jekyll version and plugins
GitHub uses, so what you see locally matches the live site.

Or, without installing Ruby, with Docker:

```sh
docker run --rm -it -v "$PWD":/srv/jekyll -p 4000:4000 jekyll/jekyll:pages jekyll serve
```
