# ShopK8s — Production-style Cloud-Native Project

End-to-end DevOps reference: React + Spring Boot + Postgres, deployed on Kubernetes via Jenkins CI and ArgoCD GitOps, with Prometheus/Grafana monitoring, Loki logging, and Terraform-provisioned AWS EKS infrastructure.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), React Router, Nginx |
| Backend | Spring Boot 3 / Java 21, Spring Web, Data JPA, Actuator, Micrometer |
| Data | PostgreSQL 16 |
| Container | Docker (multi-stage), Docker Compose |
| Orchestration | Kubernetes (HPA, probes, Ingress, ConfigMap, Secret) |
| CI | Jenkins (test → SonarQube → build → Trivy → push → GitOps commit) |
| CD | ArgoCD (auto-sync, self-heal, prune) |
| Monitoring | kube-prometheus-stack (Prometheus, Grafana, Alertmanager) |
| Logging | Loki + Promtail (EFK optional) |
| Infra | Terraform → AWS VPC + EKS + managed node group |

## Folder layout

```
project-root/
├── frontend-react/          # React app + Nginx Dockerfile
├── backend-services/
│   └── backend/             # Spring Boot products API (MVP)
├── docker-compose.yml       # Local dev: postgres + backend + frontend
├── kubernetes/
│   ├── dev/                 # Namespace, ConfigMap, Secret, Postgres, backend, frontend, Ingress, HPA
│   ├── staging/
│   └── production/
├── jenkins/Jenkinsfile      # CI pipeline
├── argocd/                  # AppProject + Application + setup notes
├── monitoring/              # kube-prometheus-stack values + ServiceMonitor + dashboard
├── logging/                 # Loki + Promtail setup + Grafana datasource
├── terraform/               # AWS VPC + EKS
├── helm/  docker/  scripts/  docs/
└── README.md
```

## Deployment progression

| Phase | What | Where |
|---|---|---|
| 1 | Local dev with Docker Compose | [docker-compose.yml](docker-compose.yml) |
| 2 | Kubernetes manifests + Ingress + HPA | [kubernetes/dev/README.md](kubernetes/dev/README.md) |
| 3 | Jenkins CI | [jenkins/Jenkinsfile](jenkins/Jenkinsfile) |
| 4 | ArgoCD GitOps | [argocd/README.md](argocd/README.md) |
| 5 | Monitoring + Logging | [monitoring/README.md](monitoring/README.md), [logging/README.md](logging/README.md) |
| 6 | AWS infra (Terraform → EKS) | [terraform/README.md](terraform/README.md) |

## Quick start (local)

```powershell
# 1. Start Docker Desktop, then:
cd project-root
docker compose up --build
# → http://localhost:3000  (React)
# → http://localhost:5000/products, /health
# → postgres on localhost:5432
```

## Quick start (Kubernetes / minikube)

```powershell
minikube start --memory=4096 --cpus=2
minikube addons enable ingress metrics-server

# Build images into minikube's docker
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -t backend:latest        backend-services/backend
docker build -t frontend-react:latest frontend-react

kubectl apply -f kubernetes/dev/
kubectl -n shop-dev get pods,svc,ingress,hpa

# Map hostname (run as Administrator)
$ip = (minikube ip)
Add-Content "$env:windir\System32\drivers\etc\hosts" "$ip shop.local"
# → http://shop.local             (frontend)
# → http://shop.local/api/health  (backend via Ingress)
```

## CI/CD flow

```
GitHub push
   │
   ▼
Jenkins ── test ── SonarQube ── build ── Trivy scan ── docker push
                                                          │
                                                          ▼
                                          commits new image tag to GitOps repo
                                                          │
                                                          ▼
                                              ArgoCD detects diff
                                                          │
                                                          ▼
                                              Kubernetes rolling update
                                                          │
                                                          ▼
                                          Prometheus scrapes new pods
                                          Loki tails new pod logs
```

## Why each tool

| Tool | Why |
|---|---|
| Docker | Reproducible runtime; same image on laptop and prod |
| Compose | Fast local dev with full dependency graph (db + app) |
| Kubernetes | Self-healing, rolling updates, horizontal scaling, declarative |
| Jenkins | Mature CI; easy to add scan / quality gates as stages |
| SonarQube | Static analysis: bugs, code smells, vulnerabilities, coverage |
| Trivy | CVE scan for images + manifests before they reach prod |
| ArgoCD | GitOps: Git = source of truth, automatic drift correction |
| Prometheus | Pull-based metrics, ideal for Kubernetes |
| Grafana | Visualize Prometheus + Loki in one place |
| Loki | Cheap, label-based log store; same UX as Prometheus |
| Terraform | Versioned infra; reproducible cluster recreation |
| Nginx Ingress | Single entrypoint, path-based routing, TLS termination |
| HPA | Auto-scale pods on CPU/memory (and custom metrics) |

