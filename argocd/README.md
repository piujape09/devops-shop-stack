# ArgoCD — GitOps for ShopK8s

ArgoCD watches a Git repo and continuously reconciles cluster state to match it.

## 1. Install ArgoCD

```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait until ready
kubectl -n argocd rollout status deploy/argocd-server
```

## 2. Access the UI

```powershell
kubectl -n argocd port-forward svc/argocd-server 8081:443
# Open https://localhost:8081

# Initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret `
  -o jsonpath="{.data.password}" | %{ [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_)) }
```

Username is `admin`.

## 3. Register the GitOps repo (private repos)

```powershell
argocd login localhost:8081
argocd repo add git@github.com:your-org/shopk8s-gitops.git --ssh-private-key-path ~/.ssh/id_ed25519
```

Public HTTPS repos need no registration.

## 4. Create the Application

```powershell
kubectl apply -f application-dev.yaml
```

ArgoCD will:
- Clone the repo
- Apply every manifest under `kubernetes/dev/`
- Auto-sync on every Git change (self-heal + prune enabled)

## GitOps flow

```
Developer push → Jenkins build → image pushed → Jenkins commits new tag
                                                       to GitOps repo
                                                              ↓
                                          ArgoCD detects diff & syncs cluster
                                                              ↓
                                       Kubernetes performs rolling update
```

## Useful commands

```powershell
argocd app list
argocd app get shopk8s-dev
argocd app sync shopk8s-dev
argocd app rollback shopk8s-dev <revision>
```
