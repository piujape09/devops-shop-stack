# Logging — Loki + Promtail

Lightweight log aggregation. Promtail tails every pod's stdout/stderr on each node and pushes to Loki. Grafana queries Loki via its built-in datasource.

## 1. Install Loki

```powershell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

kubectl create namespace logging

helm upgrade --install loki grafana/loki-stack `
  -n logging `
  -f loki-values.yaml
```

`loki-stack` deploys Loki (single-binary) + Promtail DaemonSet.

## 2. Add Loki as a Grafana datasource

If Grafana was installed via kube-prometheus-stack (namespace `monitoring`), add a datasource pointing at:

```
http://loki.logging.svc.cluster.local:3100
```

Or apply [grafana-datasource.yaml](grafana-datasource.yaml) (consumed by the Grafana sidecar):

```powershell
kubectl apply -f grafana-datasource.yaml
```

## 3. Query examples (Explore → Loki)

```logql
# All backend logs
{namespace="shop-dev", app="backend"}

# Only errors
{namespace="shop-dev", app="backend"} |= "ERROR"

# Error rate (per second)
sum(rate({namespace="shop-dev", app="backend"} |= "ERROR" [1m]))
```

## Alternative: EFK stack

Swap Loki for Elasticsearch + Fluent Bit + Kibana if you need full-text search or have existing ES infra:

```powershell
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging
helm install kibana        elastic/kibana        -n logging
helm install fluent-bit    fluent/fluent-bit     -n logging
```
