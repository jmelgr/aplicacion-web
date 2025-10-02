# Proyecto Grupo 6 – Infraestructura como Código

Este proyecto implementa una aplicación web completa en AWS utilizando Terraform y Ansible, con un backend en Node.js, un frontend en React, y servicios gestionados de AWS como RDS, S3, SQS y Lambda.

# 🚀 Arquitectura

## Frontend (React)
Aplicación web que permite a los usuarios subir archivos.

Backend (Node.js + Express)
API que recibe las solicitudes del frontend, guarda archivos en S3 y registra metadatos en RDS.
También envía mensajes a una cola SQS.

## Servicios de AWS

RDS (PostgreSQL): base de datos para almacenar metadatos.

S3: almacenamiento de archivos.

SQS: cola de mensajes para procesar tareas asíncronas.

Lambda: procesamiento de mensajes desde SQS. (pendiente de revisión en esta versión)

ALB (Application Load Balancer): balanceador de carga para el backend.

EC2: instancias que ejecutan el backend y sirven el frontend.

## Infraestructura como Código

Terraform: crea toda la infraestructura en AWS.

Ansible: configura las instancias EC2 (Nginx, Node.js, backend, etc.).

# 📂 Estructura del repositorio

```bash
proyecto/  
├── backend/        # API en Node.js (Express)  
├── frontend/       # Aplicación web en React  
├── infra/          # Terraform + Ansible para la infraestructura  
└── README.md       # Documentación del proyecto
```
# ⚙️ Requisitos
- Node.js 18+
- Terraform
- Ansible
- AWS CLI configurado

# 🛠️ Uso del proyecto

1. Clonar el repositorio
```bash
git clone https://github.com/<tu-usuario>/proyecto-grupo6.git
cd proyecto-grupo6
```
2. Desplegar infraestructura con Terraform
```bash
cd infra/terraform
terraform init
terraform apply
```
3. Configurar instancias con Ansible
```bash
cd ../ansible
ansible-playbook -i inventory_template.sh site.yml
```
4. Backend

Corre en las instancias EC2 detrás del ALB.

Expone endpoints como /upload.

5. Frontend

Actualmente se puede ejecutar en local:
```bash
cd frontend
npm install
npm start
```

# 📌 Estado actual

✅ Infraestructura creada en AWS (VPC, EC2, RDS, S3, ALB, SQS).
✅ Backend en Node.js desplegado y conectado a RDS y S3.
✅ Frontend en React funcional en local y listo para deploy.
⚠️ Pendiente: integración completa con Lambda para procesar mensajes de SQS.

# 👥 Autores
- Eyder Melanio Avalos Gastañadui
- Jose Manuel Melgarejo Ramos
- Sergio Genaro Guevara Rios
- Yoli Alexandra Corrales Chavez