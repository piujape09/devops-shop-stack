# ShopK8s Helm chart

Single umbrella chart that templates every microservice + the React frontend + Postgres + Ingress + HPA + Prometheus `ServiceMonitor`s from one `services:` map in `values.yaml`.

## Layout

```
helm/shopk8s/
├── Chart.yaml
├── values.yaml          # defaults (every knob, sane values)
├── values-dev.yaml      # 1-replica, no HPA, shop.local
├── values-staging.yaml  # 2 replicas, TLS
├── values-prod.yaml     # 3 replicas, RDS, HPA up to 10
└── templates/
    ├── _helpers.tpl
    ├── secret.yaml          # JWT + Postgres credentials
    ├── postgres.yaml        # PVC + Deployment + Service (toggle via postgres.enabled)
    ├── services.yaml        # Deployment + Service per .Values.services.*
    ├── hpa.yaml             # per service where hpa.enabled
    ├── ingress.yaml         # shop.local/api → api-gateway, /* → frontend
    ├── servicemonitor.yaml  # per service where prometheus.enabled
    └── NOTES.txt
```

## Install / upgrade

```powershell
# Lint + render locally (no cluster needed)
helm lint helm/shopk8s -f helm/shopk8s/values-dev.yaml
helm template shopk8s helm/shopk8s -f helm/shopk8s/values-dev.yaml | Select-Object -First 100

# Install to dev
kubectl create namespace shop-dev
helm upgrade --install shopk8s helm/shopk8s `
  -n shop-dev `
  -f helm/shopk8s/values-dev.yaml `
  --set jwt.secret=$(New-Guid).Guid$(New-Guid).Guid    # 72 random chars

# Promote to staging / prod with the matching values file
helm upgrade --install shopk8s helm/shopk8s -n shop-staging -f helm/shopk8s/values-staging.yaml --create-namespace
helm upgrade --install shopk8s helm/shopk8s -n shop-prod    -f helm/shopk8s/values-prod.yaml    --create-namespace
```

## Override image tags from CI

```powershell
helm upgrade --install shopk8s helm/shopk8s `
  -n shop-dev -f helm/shopk8s/values-dev.yaml `
  --set services.api-gateway.image.tag=$BUILD_TAG `
  --set services.user-service.image.tag=$BUILD_TAG `
  --set services.product-service.image.tag=$BUILD_TAG `
  --set services.order-service.image.tag=$BUILD_TAG `
  --set services.payment-service.image.tag=$BUILD_TAG `
  --set services.frontend.image.tag=$BUILD_TAG
```

## Rollback

```powershell
helm -n shop-dev history  shopk8s
helm -n shop-dev rollback shopk8s 1
```

## Uninstall

```powershell
helm -n shop-dev uninstall shopk8s
# PVC is retained by design; delete manually if you want to drop the DB.
kubectl -n shop-dev delete pvc shopk8s-shopk8s-postgres
```

## With ArgoCD

Point your `Application.spec.source` at the chart instead of raw manifests:

```yaml
source:
  repoURL: https://github.com/your-org/shopk8s-gitops.git
  targetRevision: main
  path: helm/shopk8s
  helm:
    valueFiles:
      - values-dev.yaml
```
