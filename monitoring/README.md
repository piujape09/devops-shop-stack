# Monitoring — kube-prometheus-stack

Installs Prometheus, Alertmanager, Grafana, node-exporter, and kube-state-metrics in one Helm chart.

## 1. Install

```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace monitoring

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack `
  -n monitoring `
  -f values.yaml
```

## 2. Access Grafana

```powershell
# default admin password (also set in values.yaml below)
kubectl -n monitoring get secret monitoring-grafana `
  -o jsonpath="{.data.admin-password}" | %{ [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_)) }

kubectl -n monitoring port-forward svc/monitoring-grafana 3001:80
# Open http://localhost:3001  (admin / admin123)
```

## 3. Scrape the backend

The backend exposes metrics at `/actuator/prometheus`. Apply [servicemonitor-backend.yaml](servicemonitor-backend.yaml):

```powershell
kubectl apply -f servicemonitor-backend.yaml
```

The `ServiceMonitor` CRD is provided by kube-prometheus-stack. The label
`release: monitoring` matches the chart's `serviceMonitorSelector`.

## 4. Import dashboards

In Grafana → Dashboards → Import:
- **315**  — Kubernetes cluster monitoring
- **6417** — Spring Boot Statistics (Micrometer)
- **1860** — Node Exporter Full

Or import [dashboards/shopk8s-overview.json](dashboards/shopk8s-overview.json) for a starter ShopK8s dashboard.

## What's monitored

| Metric source | What you see |
|---|---|
| node-exporter | CPU, memory, disk, network per node |
| kube-state-metrics | Deployment / Pod / HPA state, restart counts |
| cAdvisor (kubelet) | Per-container CPU/memory |
| Spring Boot Actuator | HTTP request rate, latency p50/p95/p99, JVM heap/GC |
