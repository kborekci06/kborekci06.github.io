source "https://rubygems.org"

# Plain Jekyll; the github-pages meta-gem and minima were retired with GitHub Pages (minima's files live under experiments/legacy/site)
gem "jekyll", "~> 4.4"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"     # the legacy site's head (experiments/legacy/site) calls feed_meta
  gem "jekyll-seo-tag", "~> 2.8"   # the legacy site's head calls seo
end

gem "webrick", "~> 1.8"  # local `jekyll serve` on Ruby 3+
