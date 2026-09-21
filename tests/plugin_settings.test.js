/*
## 核心功能

覆盖 plugin settings 出厂默认值与已保存设置归一化行为的 Vitest 测试用例。

## 输入

接收 `createDefaultSettings`、`normalizeLoadedSettings` 以及模拟的已保存 data.json。

## 输出

输出自动化断言结果，保护新用户出厂默认与既有用户设置不被改写。

## 定位

位于 tests/，是回归测试层；测试应描述用户可见或服务契约行为。

## 依赖

关键依赖：Vitest、`services/plugin-settings.js`。

## 维护规则

- 修改逻辑后同步更新本文件说明书，并检查 tests 的文件夹 README 是否仍准确。
- 保持职责边界清晰，跨层行为优先通过既有服务、视图或测试 helper 协作。
*/

import { describe, it, expect } from 'vitest';

const {
  createDefaultSettings,
  normalizeLoadedSettings,
} = require('../services/plugin-settings.js');

describe('Plugin settings factory defaults', () => {
  it('should ship 地图帮默认 and orange for new users', () => {
    const defaults = createDefaultSettings();

    expect(defaults.theme).toBe('ditubang');
    expect(defaults.themeColor).toBe('orange');
    expect(defaults.customColor).toBe('#fd7e14');
  });

  it('should fill missing theme keys with the factory default', () => {
    const { settings } = normalizeLoadedSettings({
      wechatAccounts: [],
      defaultAccountId: '',
    });

    expect(settings.theme).toBe('ditubang');
    expect(settings.themeColor).toBe('orange');
    expect(settings.customColor).toBe('#fd7e14');
  });

  it('should keep an explicitly saved theme and color', () => {
    const { settings } = normalizeLoadedSettings({
      theme: 'github',
      themeColor: 'blue',
      customColor: '#0366d6',
      wechatAccounts: [],
      defaultAccountId: '',
    });

    expect(settings.theme).toBe('github');
    expect(settings.themeColor).toBe('blue');
    expect(settings.customColor).toBe('#0366d6');
  });
});
