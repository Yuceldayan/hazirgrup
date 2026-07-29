// Metro yapılandırması — monorepo desteği.
// Workspace paketleri (packages/*) TypeScript kaynağı olarak tüketilir.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Monorepo kökündeki dosyaları izle (packages/* değişiklikleri yansısın).
config.watchFolders = [workspaceRoot];

// 2. Bağımlılıkları hem uygulama hem kök node_modules içinde ara.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Hoisting nedeniyle yinelenen paket çözümlemesini engelle.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
