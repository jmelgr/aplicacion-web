#!/usr/bin/env bash
set -e

PLUGINS_FILE="$1"

echo "Instalando plugins..."

jenkins-plugin-cli --plugin-file $PLUGINS_FILE

echo "Plugins instalados"
