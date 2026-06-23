# South of the Vindhyas

A minimal Eleventy site for mapping and writing about South Indian railway journeys.

## Structure

- `index.njk` renders the map.
- `blog.njk` lists every post.
- `posts/` contains Markdown posts.
- `data/` contains railway GeoJSON files.
- `scripts/` contains the cleanup scripts used to produce the filtered data.
- `assets/` contains the small amount of CSS and JavaScript for the site.

The map currently loads:

- `data/south-india-railways.geojson`
- `data/south-india-railwaystations.geojson`

The full source files are preserved too:

- `data/railwaylines.geojson`
- `data/railwaystations.geojson`

## Posts and Map Links

Use front matter to connect posts to railway lines or stations. Prefer OSM ids when possible because names can repeat.

```yaml
---
title: Arakkonam Junction
date: 2026-07-01
railway_stations:
  - node/123456
railway_lines:
  - way/4774129
tags:
  - posts
  - station:Arakkonam
---
```

The map also understands tags beginning with `line:` and `station:`. If multiple posts match a line or station, the popup lists all of them.

## Local Development

```sh
npm install
npm run serve
```

## Deployment

The site deploys with the official GitHub Pages Actions flow:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

GitHub Pages should be configured to use **GitHub Actions** as the build and deployment source.
