source "https://rubygems.org"

# Plain Jekyll; the github-pages meta-gem was retired with GitHub Pages
gem "jekyll", "~> 4.4"
gem "minima", "~> 2.5"  # legacy pages still chain page -> default (DES-010)

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"     # minima's head.html calls feed_meta
  gem "jekyll-seo-tag", "~> 2.8"   # minima's head.html calls seo
end

gem "webrick", "~> 1.8"  # local `jekyll serve` on Ruby 3+
