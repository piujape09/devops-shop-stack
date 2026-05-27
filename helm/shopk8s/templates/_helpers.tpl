{{/* vim: set filetype=mustache: */}}

{{/* ----------------------------------------------------------------------
     Naming
   ---------------------------------------------------------------------- */}}
{{- define "shopk8s.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "shopk8s.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{ .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else -}}
{{ printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end -}}
{{- end -}}

{{- define "shopk8s.chart" -}}
{{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end -}}

{{/* ----------------------------------------------------------------------
     Labels
   ---------------------------------------------------------------------- */}}
{{- define "shopk8s.commonLabels" -}}
helm.sh/chart: {{ include "shopk8s.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ include "shopk8s.name" . }}
{{- end -}}

{{- define "shopk8s.serviceLabels" -}}
{{ include "shopk8s.commonLabels" . }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/component: {{ .svc.kind | default "backend" }}
{{- end -}}

{{- define "shopk8s.selectorLabels" -}}
app: {{ .name }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
{{- end -}}

{{/* ----------------------------------------------------------------------
     Shared env (Postgres + JWT) injected via envFrom* flags on each service.
   ---------------------------------------------------------------------- */}}
{{- define "shopk8s.envFromPostgres" -}}
- name: SPRING_DATASOURCE_URL
  value: {{ printf "jdbc:postgresql://postgres:5432/%s" .Values.postgres.auth.database | quote }}
- name: SPRING_DATASOURCE_DRIVER
  value: org.postgresql.Driver
- name: SPRING_DATASOURCE_USERNAME
  valueFrom:
    secretKeyRef:
      name: {{ include "shopk8s.fullname" . }}-postgres
      key: username
- name: SPRING_DATASOURCE_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "shopk8s.fullname" . }}-postgres
      key: password
{{- end -}}

{{- define "shopk8s.envFromJwt" -}}
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: {{ include "shopk8s.fullname" . }}-jwt
      key: secret
- name: JWT_ISSUER
  value: {{ .Values.jwt.issuer | quote }}
- name: JWT_TTL_SECONDS
  value: {{ .Values.jwt.ttlSeconds | quote }}
{{- end -}}
