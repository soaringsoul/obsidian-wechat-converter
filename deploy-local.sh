#!/usr/bin/env bash
#
# 把当前仓库的最新构建同步到本机 Obsidian 插件目录。
# 默认会先 npm run build，再覆盖 main.js / manifest.json / styles.css，
# 并保留目标目录里的 data.json（账号、设置不会被清掉）。
#
# 用法：
#   ./deploy-local.sh
#   ./deploy-local.sh --skip-build
#   ./deploy-local.sh --dest "/path/to/vault/.obsidian/plugins/wechat-converter"
#   ./deploy-local.sh --vault "/path/to/vault"
#   ./deploy-local.sh --all
#   ./deploy-local.sh --dry-run
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ID="wechat-converter"
RUNTIME_FILES=(main.js manifest.json styles.css)

SKIP_BUILD=0
DRY_RUN=0
DEPLOY_ALL=0
DEST_OVERRIDE=""
VAULT_OVERRIDE=""

usage() {
  cat <<'EOF'
把当前项目构建并同步到本机 Obsidian。

用法:
  ./deploy-local.sh [选项]

选项:
  --skip-build          跳过构建，直接复制现有 main.js / manifest.json / styles.css
  --dest <插件目录>     指定插件目录（.../.obsidian/plugins/wechat-converter）
  --vault <库目录>      指定 Obsidian 库根目录
  --all                 同步到所有已安装该插件的库
  --dry-run             只打印目标路径，不构建、不复制
  -h, --help            显示帮助

环境变量:
  OBSIDIAN_PLUGIN_DIR   同 --dest
  OBSIDIAN_VAULT        同 --vault

默认会读取 Obsidian 桌面端配置，优先使用当前打开的库。
若库里还没有插件目录，会创建 wechat-converter 并写入社区插件启用列表。
不会覆盖 data.json。
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --all) DEPLOY_ALL=1; shift ;;
    --dest)
      DEST_OVERRIDE="${2:-}"
      if [[ -z "$DEST_OVERRIDE" ]]; then
        echo "[ERROR] --dest 需要插件目录路径" >&2
        exit 1
      fi
      shift 2
      ;;
    --vault)
      VAULT_OVERRIDE="${2:-}"
      if [[ -z "$VAULT_OVERRIDE" ]]; then
        echo "[ERROR] --vault 需要库目录路径" >&2
        exit 1
      fi
      shift 2
      ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "[ERROR] 未知参数: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

DEST_OVERRIDE="${DEST_OVERRIDE:-${OBSIDIAN_PLUGIN_DIR:-}}"
VAULT_OVERRIDE="${VAULT_OVERRIDE:-${OBSIDIAN_VAULT:-}}"

resolve_targets() {
  node --input-type=module - "$ROOT" "$PLUGIN_ID" "$DEST_OVERRIDE" "$VAULT_OVERRIDE" "$DEPLOY_ALL" <<'NODE'
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [root, pluginId, destOverride, vaultOverride, deployAllFlag] = process.argv.slice(2);
const deployAll = deployAllFlag === "1";
const folderAliases = [pluginId, "obsidian-wechat-converter"];

function fail(message) {
  console.error(`[ERROR] ${message}`);
  process.exit(1);
}

function existsDir(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function configCandidates() {
  const home = os.homedir();
  return [
    path.join(home, "Library", "Application Support", "obsidian", "obsidian.json"),
    path.join(home, ".config", "obsidian", "obsidian.json"),
    path.join(process.env.APPDATA || "", "obsidian", "obsidian.json"),
  ].filter((item) => item && item !== path.join("obsidian", "obsidian.json"));
}

function listVaults() {
  const vaults = [];
  for (const configPath of configCandidates()) {
    if (!fs.existsSync(configPath)) continue;
    let parsed;
    try {
      parsed = readJson(configPath);
    } catch (error) {
      fail(`无法读取 Obsidian 配置: ${configPath}\n${error.message}`);
    }
    const entries = parsed?.vaults && typeof parsed.vaults === "object" ? parsed.vaults : {};
    for (const vault of Object.values(entries)) {
      if (!vault || typeof vault.path !== "string" || !vault.path.trim()) continue;
      vaults.push({
        path: path.resolve(vault.path),
        open: vault.open === true,
      });
    }
    break;
  }
  return vaults;
}

function findExistingPluginDir(vaultPath) {
  for (const folder of folderAliases) {
    const pluginDir = path.join(vaultPath, ".obsidian", "plugins", folder);
    if (existsDir(pluginDir) && fs.existsSync(path.join(pluginDir, "manifest.json"))) {
      return pluginDir;
    }
    if (existsDir(pluginDir)) return pluginDir;
  }
  return "";
}

function pluginDirForVault(vaultPath, createIfMissing) {
  const existing = findExistingPluginDir(vaultPath);
  if (existing) return { pluginDir: existing, created: false };
  if (!createIfMissing) return { pluginDir: "", created: false };
  return {
    pluginDir: path.join(vaultPath, ".obsidian", "plugins", pluginId),
    created: true,
  };
}

function emit(pluginDir, created) {
  process.stdout.write(`${pluginDir}\t${created ? "1" : "0"}\n`);
}

if (destOverride) {
  emit(path.resolve(destOverride), !existsDir(path.resolve(destOverride)));
  process.exit(0);
}

if (vaultOverride) {
  const vaultPath = path.resolve(vaultOverride);
  if (!existsDir(vaultPath)) fail(`库目录不存在: ${vaultPath}`);
  const result = pluginDirForVault(vaultPath, true);
  emit(result.pluginDir, result.created);
  process.exit(0);
}

const vaults = listVaults();
if (vaults.length === 0) {
  fail("没有找到 Obsidian 库。请用 --vault 或 --dest 指定目录，或先在 Obsidian 里打开一个库。");
}

const existing = [];
for (const vault of vaults) {
  const pluginDir = findExistingPluginDir(vault.path);
  if (pluginDir) existing.push({ ...vault, pluginDir });
}

if (deployAll) {
  const targets = existing.length > 0
    ? existing
    : vaults.filter((vault) => vault.open).map((vault) => ({
      ...vault,
      pluginDir: path.join(vault.path, ".obsidian", "plugins", pluginId),
      created: true,
    }));
  if (targets.length === 0) {
    fail("没有可同步的库。请先打开 Obsidian 库，或用 --vault / --dest 指定路径。");
  }
  for (const target of targets) {
    emit(target.pluginDir, Boolean(target.created) || !existsDir(target.pluginDir));
  }
  process.exit(0);
}

if (existing.length === 1) {
  emit(existing[0].pluginDir, false);
  process.exit(0);
}

const openExisting = existing.filter((item) => item.open);
if (openExisting.length === 1) {
  emit(openExisting[0].pluginDir, false);
  process.exit(0);
}

const openVaults = vaults.filter((vault) => vault.open);
if (openVaults.length === 1 && existing.length === 0) {
  const result = pluginDirForVault(openVaults[0].path, true);
  emit(result.pluginDir, result.created);
  process.exit(0);
}

const lines = [
  "找到多个 Obsidian 库，请指定目标：",
  ...vaults.map((vault) => {
    const pluginDir = findExistingPluginDir(vault.path) || "(未安装)";
    return `- ${vault.open ? "已打开" : "未打开"}  ${vault.path}  ->  ${pluginDir}`;
  }),
  "",
  `当前仓库: ${root}`,
  "示例: ./deploy-local.sh --vault \"/path/to/vault\"",
];
fail(lines.join("\n"));
NODE
}

ensure_plugin_enabled() {
  local vault_dir="$1"
  local community_json="$vault_dir/.obsidian/community-plugins.json"
  node --input-type=module - "$community_json" "$PLUGIN_ID" <<'NODE'
import fs from "node:fs";
import path from "node:path";

const [filePath, pluginId] = process.argv.slice(2);
const dir = path.dirname(filePath);
fs.mkdirSync(dir, { recursive: true });

let list = [];
if (fs.existsSync(filePath)) {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(parsed)) list = parsed;
}

if (!list.includes(pluginId)) {
  list.push(pluginId);
  fs.writeFileSync(filePath, `${JSON.stringify(list, null, 2)}\n`);
  console.log(`[OK] 已写入社区插件启用列表: ${pluginId}`);
}
NODE
}

copy_runtime() {
  local dest="$1"
  local created="$2"
  local dest_abs
  local root_abs
  root_abs="$(cd "$ROOT" && pwd)"

  mkdir -p "$dest"
  dest_abs="$(cd "$dest" && pwd)"

  if [[ "$dest_abs" == "$root_abs" ]]; then
    echo "[OK] 当前仓库就在 Obsidian 插件目录内，构建完成后无需再复制。"
    return 0
  fi

  local file
  for file in "${RUNTIME_FILES[@]}"; do
    if [[ ! -f "$ROOT/$file" ]]; then
      echo "[ERROR] 缺少构建产物: $ROOT/$file" >&2
      exit 1
    fi
    cp -f "$ROOT/$file" "$dest/$file"
  done

  if [[ -f "$ROOT/images/support-wechat.png" || -f "$ROOT/images/support-alipay.jpg" ]]; then
    mkdir -p "$dest/images"
    [[ -f "$ROOT/images/support-wechat.png" ]] && cp -f "$ROOT/images/support-wechat.png" "$dest/images/"
    [[ -f "$ROOT/images/support-alipay.jpg" ]] && cp -f "$ROOT/images/support-alipay.jpg" "$dest/images/"
  fi

  if [[ "$created" == "1" ]]; then
    local vault_dir
    vault_dir="$(cd "$dest/../../.." && pwd)"
    ensure_plugin_enabled "$vault_dir"
  fi

  local version author
  version="$(node -p "require(process.argv[1]).version" "$dest/manifest.json")"
  author="$(node -p "require(process.argv[1]).author" "$dest/manifest.json")"
  echo "[OK] 已同步到: $dest"
  echo "     版本 $version / 作者 $author"
  if [[ -f "$dest/data.json" ]]; then
    echo "     已保留现有 data.json（插件设置不会被覆盖）"
  fi
}

echo "[INFO] 仓库: $ROOT"

TARGET_ROWS=""
while IFS= read -r row; do
  [[ -z "$row" ]] && continue
  if [[ -z "$TARGET_ROWS" ]]; then
    TARGET_ROWS="$row"
  else
    TARGET_ROWS="$TARGET_ROWS
$row"
  fi
done <<EOF
$(resolve_targets)
EOF

if [[ -z "$TARGET_ROWS" ]]; then
  echo "[ERROR] 没有解析到目标插件目录" >&2
  exit 1
fi

echo "[INFO] 目标插件目录:"
while IFS=$'\t' read -r dest created; do
  [[ -z "$dest" ]] && continue
  echo "     $dest"
done <<EOF
$TARGET_ROWS
EOF

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[OK] dry-run 完成，未构建、未复制。"
  exit 0
fi

if [[ "$SKIP_BUILD" != "1" ]]; then
  if [[ ! -d "$ROOT/node_modules" ]]; then
    echo "[INFO] 未找到 node_modules，先安装依赖..."
    (cd "$ROOT" && npm install)
  fi
  echo "[INFO] 正在构建最新产物..."
  (cd "$ROOT" && npm run build)
else
  echo "[INFO] 已跳过构建，使用现有产物。"
fi

for file in "${RUNTIME_FILES[@]}"; do
  if [[ ! -f "$ROOT/$file" ]]; then
    echo "[ERROR] 缺少 $file，请先成功运行 npm run build。" >&2
    exit 1
  fi
done

while IFS=$'\t' read -r dest created; do
  [[ -z "$dest" ]] && continue
  copy_runtime "$dest" "$created"
done <<EOF
$TARGET_ROWS
EOF

echo
echo "[OK] 本地同步完成。"
echo "     请到 Obsidian：设置 -> 社区插件，关闭再打开「Wechat Converter」，"
echo "     或重启 Obsidian 后查看最新改动。"
