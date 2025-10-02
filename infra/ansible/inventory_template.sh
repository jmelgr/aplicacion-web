#!/bin/bash

ASG_NAME="terraform-20250929184714291500000003"

# Obtener IDs de las instancias activas en el ASG
INSTANCE_IDS=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-name "$ASG_NAME" \
  --query "AutoScalingGroups[0].Instances[?LifecycleState=='InService'].InstanceId" \
  --output text)

# Obtener las IPs públicas de esas instancias
EC2_IPS=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_IDS \
  --query "Reservations[*].Instances[*].PublicIpAddress" \
  --output text)

# Imprimir inventario dinámico en JSON
cat <<EOF
{
  "backend": {
    "hosts": [
$(for i in $EC2_IPS; do
  echo "      \"$i\","
done | sed '$ s/,$//')
    ],
    "vars": {
      "ansible_ssh_private_key_file": "/home/melgar/Downloads/grupo6-key.pem",
      "ansible_user": "ubuntu",
      "ansible_ssh_common_args": "-o StrictHostKeyChecking=no"
    }
  }
}
EOF

