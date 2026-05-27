# Terraform — AWS EKS for ShopK8s

Provisions a production-style EKS cluster:

- VPC with public + private subnets across 2 AZs (NAT gateway, IGW)
- EKS control plane (v1.30) with IRSA enabled
- Managed node group (`t3.medium` × 2, autoscale 2–5)
- Core add-ons: CoreDNS, kube-proxy, VPC CNI, EBS CSI driver

Built from the official `terraform-aws-modules/{vpc,eks}` modules so you don't reinvent IAM.

## Prerequisites

- Terraform ≥ 1.6
- AWS CLI configured (`aws sts get-caller-identity` works)
- IAM perms to create VPC / EKS / IAM resources

## Use

```powershell
cd terraform
terraform init
terraform plan  -out=tfplan
terraform apply tfplan

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name shopk8s-dev
kubectl get nodes
```

## Destroy

```powershell
terraform destroy
```

## Next layers (apply on top of the cluster)

1. **Nginx Ingress Controller**
   ```powershell
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace
   ```
2. **Monitoring** — see [../monitoring/README.md](../monitoring/README.md)
3. **Logging** — see [../logging/README.md](../logging/README.md)
4. **ArgoCD** — see [../argocd/README.md](../argocd/README.md)

## Remote state (recommended)

Uncomment the `backend "s3"` block in [providers.tf](providers.tf) once you've created:

```powershell
aws s3api create-bucket --bucket shopk8s-tfstate-<acct-id> --region us-east-1
aws dynamodb create-table --table-name shopk8s-tflock `
  --attribute-definitions AttributeName=LockID,AttributeType=S `
  --key-schema AttributeName=LockID,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST
```
