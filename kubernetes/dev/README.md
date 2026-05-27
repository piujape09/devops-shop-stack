# kubernetes/dev

> **Superseded by the Helm chart at [../../helm/shopk8s/](../../helm/shopk8s/).**

The raw, monolith-era manifests that used to live here have been removed in favor of the umbrella Helm chart, which renders Deployment + Service + HPA + Ingress + ServiceMonitor for every microservice from a single `values.yaml`.

## Deploy to a dev namespace

```powershell
kubectl create namespace shop-dev
helm upgrade --install shopk8s ../../helm/shopk8s `
  -n shop-dev `
  -f ../../helm/shopk8s/values-dev.yaml
```

## Inspect what would be applied (no cluster needed)

```powershell
helm template shopk8s ../../helm/shopk8s -f ../../helm/shopk8s/values-dev.yaml | code -
```

## Why no raw manifests?

A 6-service deployment with HPAs, ServiceMonitors and Ingress would be ~25 nearly-identical YAML files. The chart's `range` over `.Values.services` keeps that down to a handful of templates with one source of truth in `values.yaml`. If you need a raw-YAML snapshot for review, pipe `helm template` to a file and commit that.
