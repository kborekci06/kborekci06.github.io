# DEV

Local preview for `kborekci06.github.io`. Pinned versions (`Gemfile.lock`): github-pages 232, jekyll 3.10.0, minima 2.5.1. Ruby 3.2.4 (`.ruby-version`).

## One-time setup

Already done on this Mac (rbenv via Homebrew, Ruby 3.2.4, gems installed). For a new machine:

```zsh
brew install rbenv ruby-build
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc && source ~/.zshrc   # skip if rbenv init is already in ~/.zshrc
rbenv install 3.2.4          # skip if already installed
cd ~/Desktop/kborekci06.github.io
ruby -v                      # expect ruby 3.2.4 (picked up from .ruby-version)
gem install bundler
bundle install
```

## Daily preview (live reload)

VS Code route: `Cmd+Shift+B` runs the default build task "Jekyll Dev". It cleans, serves, and opens http://127.0.0.1:4000 after 3 s.

Terminal route:

```zsh
cd ~/Desktop/kborekci06.github.io
bundle exec jekyll serve --livereload --trace
```

If output looks stale, clean first:

```zsh
bundle exec jekyll clean && rm -rf .jekyll-cache .sass-cache && bundle exec jekyll serve --livereload --trace
```

Then open http://127.0.0.1:4000.

- Live reload: saving any `.md`, `.html`, `.scss`, `.yml`, or `.js` file rebuilds the site and refreshes the browser automatically.
- Exception: `_config.yml` is read only at startup. After editing it, stop the server (`Ctrl+C`) and run the command again.
- Live reload is a full page refresh, so scroll position resets. Form state and theme toggle state in `localStorage` survive.
- Stop the server with `Ctrl+C`.

## Troubleshooting

- Port 4000 in use: find and stop the old server.
  ```zsh
  lsof -i :4000        # note the PID
  kill <PID>
  ```
  Or serve elsewhere: add `--port 4001`.
- Stale or odd output: rerun the clean step.
  ```zsh
  bundle exec jekyll clean && rm -rf .jekyll-cache .sass-cache
  ```
- `faraday-retry` warning at startup: benign, ignore.
- Sass errors: printed in the terminal running the server (`--trace` shows the full stack). The page keeps the last good CSS until fixed.
- Browser does not refresh: confirm the tab is on http://127.0.0.1:4000, not a `file://` URL, and that the terminal shows the rebuild.

## Branches

`dev` is the working branch: commit here, preview locally, push whenever. `main` is the live site: merge `dev` into `main` only when the site is ready to publish.

```zsh
git switch main && git merge --ff-only dev && git push && git switch dev
```

## Before pushing

```zsh
git status                       # review every modified/untracked file; CLAUDE.md, CONTEXT.md, FILE_MAP.md, ISSUE_LOG.md, ROADMAP.md must not appear
git pull --rebase                # always, before pushing
git push
```
