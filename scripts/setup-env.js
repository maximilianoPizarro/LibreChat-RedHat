#!/usr/bin/env node
/**
 * Script para configurar automáticamente el archivo .env desde env.example.podman
 * Se ejecuta antes de los comandos de podman compose
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '..', 'env.example.podman');
const envPath = path.join(__dirname, '..', '.env');

// Verificar si existe env.example.podman
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ Error: No se encontró el archivo env.example.podman');
  process.exit(1);
}

// Si .env ya existe, no hacer nada
if (fs.existsSync(envPath)) {
  console.log('✓ Archivo .env ya existe, no se modificará');
  process.exit(0);
}

// Copiar env.example.podman a .env
try {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✓ Archivo .env creado automáticamente desde env.example.podman');
  console.log('⚠️  IMPORTANTE: Edita el archivo .env y configura las siguientes variables:');
  console.log('   - MEILI_MASTER_KEY (genera una clave segura)');
  console.log('   - JWT_SECRET (genera una clave segura)');
  console.log('   - JWT_REFRESH_SECRET (genera una clave segura)');
  console.log('   - DOMAIN (ajusta según tu configuración)');
  console.log('');
  console.log('   Puedes generar claves seguras en PowerShell con:');
  console.log('   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})');
  process.exit(0);
} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
  process.exit(1);
}

