# Run in GitHub Codespaces (free tier, no credit card)

This repo ships a [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) that turns a Codespace into a ready-to-run ShopK8s sandbox — all 5 microservices + Postgres + React frontend on public, forwarded URLs.

## 1. Push the repo to GitHub

```powershell
cd C:\Users\pjape\Desktop\practice\K8s\ec\project-root
git init
git add .
git commit -m "shopk8s initial"
gh repo create shopk8s --public --source=. --push     # needs `gh` CLI
# or create the repo on github.com and `git remote add origin ...` + `git push -u origin main`
```

## 2. Open in a Codespace

On the repo page on github.com:

`Code` → `Codespaces` tab → `Create codespace on main`

GitHub will:
1. Spin up a 2-core Ubuntu VM.
2. Install Docker-in-Docker, JDK 21 + Maven, Node 20, kubectl + helm.
3. Run `docker compose up -d --build` automatically (`postAttachCommand`).

First boot takes 5–10 min (Maven pulls a lot of jars). Subsequent attaches are seconds.

## 3. Open the app

When the build finishes, watch the **PORTS** tab at the bottom of VS Code:

| Port | Service | Visibility |
|---|---|---|
| 3000 | frontend (React) | auto-opens in browser |
| 5000 | api-gateway | public URL |
| 5001-5004 | user/product/order/payment | private (used by gateway) |
| 5432 | postgres | local only |

Right-click port 3000 → **Port Visibility → Public** to share the URL.

## 4. Free tier limits

- **60 core-hours / month** on a 2-core machine = 30 hrs uptime.
  Bumping to 4 cores halves that.
- Codespace **auto-stops after 30 min idle**. Restart from the github.com Codespaces page — your containers and `node_modules` / `~/.m2` cache persist.
- After 30 days of no use, the Codespace is deleted. Push your branch first.

## 5. Useful commands inside the Codespace

```bash
docker compose ps
docker compose logs -f api-gateway
docker compose restart user-service
docker compose down -v          # nuke postgres volume too
```

## 6. Cost-saving tips

- Stop the Codespace from the github.com UI when you're done; don't just close the tab.
- Use 2-core unless you need the speed.
- Pre-warm with `onCreateCommand` (already configured for `postgres:16-alpine`).

## 7. What about K8s / Helm / ArgoCD?

Codespaces is great for the docker-compose path but won't run a real K8s cluster on free quota. To exercise the Helm chart, use **Oracle Cloud Always Free** (4× ARM + 24 GB RAM, CC for verification only) with `k3s` — see [helm/README.md](helm/README.md).
