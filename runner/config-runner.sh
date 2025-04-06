if [ -z "$PAT" ]; then
  echo "Error: Not found PAT"
  exit 1
fi

helm repo add actions-runner-controller https://actions-runner-controller.github.io/actions-runner-controller
helm repo update

helm repo add jetstack https://charts.jetstack.io
helm repo update

kubectl create namespace actions-runner-system
kubectl create namespace cert-manager

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --set installCRDs=true \
  --version v1.11.0

kubectl get pods -n cert-manager

kubectl create secret generic controller-manager \
  --namespace actions-runner-system \
  --from-literal=github_token=${PAT}

helm install \
  actions-runner-controller actions-runner-controller/actions-runner-controller \
  --namespace actions-runner-system \
  --create-namespace \
  --version 0.22.0 \
  -f runner-controller.yaml
