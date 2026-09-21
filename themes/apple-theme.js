/*
## 核心功能

定义微信公众号文章的 Apple 风格主题、内联样式和内置预设。

## 输入

接收主题设置、渲染后的 HTML 结构和微信编辑器兼容约束。

## 输出

输出 同文件内副作用、配置对象、测试断言或样式规则，供 converter.js 应用主题样式。

## 定位

位于 themes/，是文章主题层；不处理 Markdown 解析或发布同步。

## 依赖

关键依赖：`./apple-theme-config.js`、`./apple-theme-headings.js`。

## 维护规则

- 修改逻辑后同步更新本文件说明书，并检查 themes 的文件夹 README 是否仍准确。
- 保持职责边界清晰，跨层行为优先通过既有服务、视图或测试 helper 协作。
*/

/**
 * 🍎 Apple Style 多主题系统
 * 支持多种主题风格：简约、经典、水墨、极光等
 * 设计理念：克制、优雅、注重细节
 */

/**
 * @typedef {'ditubang' | 'ditubang-rect' | 'github' | 'wechat' | 'serif' | 'paper' | 'grid' | 'typo' | 'media' | 'colorful'} AppleThemeName
 * @typedef {'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'rose' | 'ruby' | 'slate'} AppleThemeColorName
 * @typedef {'sans-serif' | 'serif' | 'monospace'} AppleFontFamilyName
 * @typedef {1 | 2 | 3 | 4 | 5} AppleFontSizeName
 * @typedef {{ base: number, h1: number, h2: number, h3: number, h4: number, h5: number, h6: number, code: number, caption: number }} AppleFontSizeConfig
 * @typedef {{
 *   name: string,
 *   lineHeight: number,
 *   paragraphGap: number,
 *   h1Decoration?: string,
 *   h2Decoration?: string,
 *   h3Decoration?: string,
 *   h4Decoration?: string,
 *   h5Decoration?: string,
 *   h6Decoration?: string,
 *   headingWeight?: number,
 *   headingLetterSpacing?: number,
 *   textColor: string,
 *   headingColor?: string,
 *   mutedTextColor?: string,
 *   sectionBg?: string,
 *   sectionBgStyle?: string,
 *   sectionBgSize?: string,
 *   sectionSidePaddingOffset?: number,
 *   gridLineAlpha?: string,
 *   shiftHeadingDecorationsDown?: boolean,
 *   linkDecoration?: string,
 *   linkColor?: string,
 *   blockquoteBorderWidth?: number,
 *   blockquoteBorderColor?: string,
 *   blockquoteBg?: string,
 *   blockquoteStyle?: string,
 *   blockquoteTextColor?: string,
 *   tableHeaderBg?: string,
 *   tableBorderColor?: string,
 *   tableCellPadding?: number,
 *   figurePadding?: number,
 *   figureBorderColor?: string,
 *   paragraphTextIndent?: string,
 *   strongBg?: boolean,
 *   compactHeadings?: boolean,
 *   textAlign?: string,
 *   letterSpacing?: number,
 *   strongColor?: string,
 *   strongWeight?: number | string,
 *   emColor?: string,
 *   delColor?: string,
 *   codeSurface?: string,
 *   codeColor?: string,
 *   codeBg?: string,
 *   preBg?: string,
 *   preColor?: string,
 *   listPaddingLeft?: number,
 *   listMargin?: string,
 *   captionColor?: string,
 *   figureChrome?: string,
 *   imageRadius?: number,
 *   hrColor?: string,
 *   hrMargin?: number,
 * }} AppleThemeConfig
 * @typedef {{
 *   theme?: AppleThemeName | string,
 *   themeColor?: AppleThemeColorName | 'custom' | string,
 *   customColor?: string | null,
 *   quoteCalloutStyleMode?: 'theme' | 'neutral' | string,
 *   fontFamily?: AppleFontFamilyName | string,
 *   fontSize?: AppleFontSizeName | number,
 *   macCodeBlock?: boolean,
 *   codeLineNumber?: boolean,
 *   sidePadding?: number,
 *   lineHeight?: number | null,
 *   paragraphGap?: number | null,
 *   letterSpacing?: number | null,
 *   coloredHeader?: boolean,
 * }} AppleThemeOptions
 */

import {
  THEME_COLORS,
  THEME_COLORS_DEEP,
  FONT_SIZES,
  FONTS,
  THEME_CONFIGS,
  SPACING,
  RADIUS,
  QUOTE_CALLOUT_NEUTRAL_BG,
  QUOTE_NEUTRAL_BORDER,
} from './apple-theme-config.js';
import {
  buildH1Style,
  buildH2Style,
  buildH3Style,
  buildH4Style,
  buildH5Style,
  buildH6Style,
} from './apple-theme-headings.js';

// Use assignment expression to avoid "Identifier has already been declared" errors if re-eval'd
const APPLE_THEME_GLOBAL = /** @type {Record<string, unknown>} */ (typeof window !== 'undefined' ? window : {});

/* eslint-disable @typescript-eslint/no-unsafe-return -- reason: extracted heading builders retain the legacy dynamic theme method contract */
class AppleTheme {
  static THEME_COLORS = THEME_COLORS;
  static THEME_COLORS_DEEP = THEME_COLORS_DEEP;
  static FONT_SIZES = FONT_SIZES;
  static FONTS = FONTS;
  static THEME_CONFIGS = THEME_CONFIGS;
  static SPACING = SPACING;
  static RADIUS = RADIUS;
  static QUOTE_CALLOUT_NEUTRAL_BG = QUOTE_CALLOUT_NEUTRAL_BG;
  static QUOTE_NEUTRAL_BORDER = QUOTE_NEUTRAL_BORDER;

  /**
   * 当前配置
   * @param {AppleThemeOptions} [options]
   */
  constructor(options = {}) {
    /** @type {AppleThemeName | string} */
    this.themeName = typeof options.theme === 'string' && options.theme ? options.theme : 'ditubang';
    /** @type {AppleThemeColorName | 'custom' | string} */
    this.themeColor = typeof options.themeColor === 'string' && options.themeColor ? options.themeColor : 'orange';
    /** @type {string | null} */
    this.customColor = typeof options.customColor === 'string' && options.customColor ? options.customColor : null;
    /** @type {'theme' | 'neutral' | string} */
    this.quoteCalloutStyleMode = typeof options.quoteCalloutStyleMode === 'string' ? options.quoteCalloutStyleMode : 'theme';
    /** @type {AppleFontFamilyName | string} */
    this.fontFamily = typeof options.fontFamily === 'string' && options.fontFamily ? options.fontFamily : 'sans-serif';
    /** @type {AppleFontSizeName | number} */
    this.fontSize = typeof options.fontSize === 'number' ? options.fontSize : 3;
    /** @type {boolean} */
    this.macCodeBlock = options.macCodeBlock !== false;
    /** @type {boolean} */
    this.codeLineNumber = Boolean(options.codeLineNumber);
    // 侧边距设置 (默认 16px)
    /** @type {number} */
    this.sidePadding = options.sidePadding !== undefined ? Number(options.sidePadding) : 16;
    // 间距微调（全局覆盖；null/undefined = 继承当前主题默认）
    // 注意：字距默认 0（与正文现状一致），合法值 0 必须用 ?? 解析，不能用 ||
    /** @type {number | null | undefined} */
    this.lineHeight = options.lineHeight;
    /** @type {number | null | undefined} */
    this.paragraphGap = options.paragraphGap;
    /** @type {number | null | undefined} */
    this.letterSpacing = options.letterSpacing;
    // 标题染色设置
    /** @type {boolean} */
    this.coloredHeader = Boolean(options.coloredHeader);
  }

  /**
   * 获取当前主题色值
   * @returns {string}
   */
  getThemeColorValue() {
    if (this.themeColor === 'custom' && this.customColor) {
      return this.customColor;
    }
    return AppleTheme.THEME_COLORS[/** @type {AppleThemeColorName} */ (this.themeColor)] || AppleTheme.THEME_COLORS.blue;
  }

  /**
   * 获取标题专用深色值
   * @returns {string}
   */
  getHeadingColorValue() {
    // 1. 如果未开启标题染色，返回默认深灰
    if (!this.coloredHeader) {
      return this.getThemeConfig().headingColor || '#3e3e3e';
    }

    // 2. 自定义颜色：自动计算变深 20%
    if (this.themeColor === 'custom' && this.customColor) {
      return this.adjustColorBrightness(this.customColor, -20);
    }

    // 3. 预设颜色：返回深色板对应值
    return AppleTheme.THEME_COLORS_DEEP[/** @type {AppleThemeColorName} */ (this.themeColor)] || AppleTheme.THEME_COLORS_DEEP.blue;
  }

  /**
   * 辅助：调整 Hex 颜色亮度
   * @param {string} hex - #RRGGBB
   * @param {number} percent - -100 to 100
   * @returns {string}
   */
  adjustColorBrightness(hex, percent) {
    hex = hex.replace(/^#/, '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.round(r * (100 + percent) / 100);
    g = Math.round(g * (100 + percent) / 100);
    b = Math.round(b * (100 + percent) / 100);

    r = (r < 255) ? r : 255;
    g = (g < 255) ? g : 255;
    b = (b < 255) ? b : 255;

    // Pad with 0 if necessary
    const rr = ((r.toString(16).length === 1) ? '0' + r.toString(16) : r.toString(16));
    const gg = ((g.toString(16).length === 1) ? '0' + g.toString(16) : g.toString(16));
    const bb = ((b.toString(16).length === 1) ? '0' + b.toString(16) : b.toString(16));

    return `#${rr}${gg}${bb}`;
  }

  /**
   * 获取当前主题配置
   * @returns {AppleThemeConfig}
   */
  getThemeConfig() {
    return AppleTheme.THEME_CONFIGS[/** @type {AppleThemeName} */ (this.themeName)] || AppleTheme.THEME_CONFIGS.github;
  }

  /**
   * 获取字体尺寸配置
   * @returns {AppleFontSizeConfig}
   */
  getSizes() {
    return AppleTheme.FONT_SIZES[/** @type {AppleFontSizeName} */ (this.fontSize)] || AppleTheme.FONT_SIZES[3];
  }

  /**
   * 获取字体栈
   * @returns {string}
   */
  getFontFamily() {
    return AppleTheme.FONTS[/** @type {AppleFontFamilyName} */ (this.fontFamily)] || AppleTheme.FONTS['sans-serif'];
  }

  /**
   * @returns {'theme' | 'neutral'}
   */
  getQuoteCalloutStyleMode() {
    return this.quoteCalloutStyleMode === 'neutral' ? 'neutral' : 'theme';
  }

  /**
   * 获取元素样式
   * @param {string} tagName - HTML 标签名
   * @returns {string} - CSS 样式字符串
   */
  getStyle(tagName) {
    const config = this.getThemeConfig();
    const sizes = this.getSizes();
    const font = this.getFontFamily();
    const color = this.getThemeColorValue();
    const quoteCalloutStyleMode = this.getQuoteCalloutStyleMode();
    const s = AppleTheme.SPACING;
    const r = AppleTheme.RADIUS;

    // 标题颜色逻辑：使用专门的深色系标题色
    // 注意：某些特殊主题装饰(h1Decoration)可能已经包含了颜色设置，这里主要针对文字本身
    const textColor = config.textColor;
    const mutedTextColor = config.mutedTextColor;
    const headingColor = this.getHeadingColorValue();
    const sectionSidePadding = this.getSectionSidePadding(config);

    // 间距微调有效值：全局覆盖优先，null/undefined 回退主题默认。
    // 字距：实例覆盖优先，否则用主题配置，再默认 0；0 是合法值，必须用 ?? 保留。
    const effectiveLineHeight = this.lineHeight ?? config.lineHeight;
    const effectiveParagraphGap = this.paragraphGap ?? config.paragraphGap;
    const effectiveLetterSpacing = this.letterSpacing ?? config.letterSpacing ?? 0;
    const paragraphAlign = config.textAlign || 'justify';
    /** @param {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'} level */
    const headingSize = (level) => {
      if (!config.compactHeadings) return sizes[level];
      const offsets = { h1: 5, h2: 2, h3: 0, h4: 0, h5: 0, h6: 0 };
      return sizes.base + (offsets[level] || 0);
    };

    switch (tagName) {
      case 'section':
        // 使用配置的 sidePadding
        if (config.sectionBgStyle !== 'grid') {
          return this.joinStyleStrings(
            `font-family: ${font}; font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; padding: 20px ${sectionSidePadding}px; background: ${config.sectionBg || '#ffffff'}; ${this.getSectionBoxSizingStyle(config)}max-width: 100%; word-wrap: break-word; word-break: normal; overflow-wrap: break-word; line-break: strict; text-align: ${paragraphAlign}`
          );
        }

        return this.joinStyleStrings(
          `font-family: ${font}; font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; padding: 20px ${sectionSidePadding}px; box-sizing: border-box; max-width: 100%; word-wrap: break-word; word-break: normal; overflow-wrap: break-word; line-break: strict; text-align: ${paragraphAlign}`,
          `background-color: ${config.sectionBg || '#ffffff'}`,
          `background-image: linear-gradient(${this.hexToRgba(color, config.gridLineAlpha || '09')} 1px, transparent 1px), linear-gradient(90deg, ${this.hexToRgba(color, config.gridLineAlpha || '09')} 1px, transparent 1px)`,
          config.sectionBgSize ? `background-size: ${config.sectionBgSize}` : ''
        );

      case 'h1': return this.getH1Style(config.h1Decoration, color, headingSize('h1'), font, headingColor, config);
      case 'h2':
        return config.shiftHeadingDecorationsDown
          ? this.getH1Style(config.h1Decoration, color, headingSize('h2'), font, headingColor, config)
          : this.getH2Style(config.h2Decoration, color, headingSize('h2'), font, headingColor, config);
      case 'h3':
        return config.shiftHeadingDecorationsDown
          ? this.getH2Style(config.h2Decoration, color, headingSize('h3'), font, headingColor, config)
          : this.getH3Style(config.h3Decoration, color, headingSize('h3'), font, headingColor, config);
      case 'h4':
        return config.shiftHeadingDecorationsDown
          ? this.getH3Style(config.h3Decoration, color, headingSize('h4'), font, headingColor, config)
          : this.getH4Style(config.h4Decoration, color, headingSize('h4'), font, headingColor);

      case 'h5':
        return this.getH5Style(config.h5Decoration, color, headingSize('h5'), font, headingColor);
      case 'h6':
        return this.getH6Style(config.h6Decoration, color, headingSize('h6'), font, headingColor, mutedTextColor);
      case 'h2 inner':
        if (config.h2Decoration === 'ditubang-rect-chapter') {
          return 'display: inline-block; font-weight: bold; background: #faf36e; color: #000000; padding: 3px 10px 1px; border-top-right-radius: 18px; border-top-left-radius: 3px; margin-right: 3px; line-height: 1.45; vertical-align: bottom; max-width: 100%; box-sizing: border-box;';
        }
        return '';
      case 'h3 inner':
        if (config.h3Decoration === 'ditubang-rect-section') {
          return 'display: inline-block; padding-left: 8px; border-left: 8px solid #f9da64; line-height: 1.4; vertical-align: middle; max-width: 100%; box-sizing: border-box;';
        }
        return '';

      case 'p':
        return this.joinStyleStrings(
          `font-family: ${font}; font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; margin: 0 0 ${effectiveParagraphGap}px 0; text-align: ${paragraphAlign};${paragraphAlign === 'justify' ? ' text-align-last: left;' : ''}${effectiveLetterSpacing ? ` letter-spacing: ${effectiveLetterSpacing}px;` : ' letter-spacing: 0;'} word-break: normal; overflow-wrap: break-word; line-break: strict`,
          config.paragraphTextIndent ? `text-indent: ${config.paragraphTextIndent}` : ''
        );





      case 'blockquote':
        if (config.blockquoteStyle === 'card') {
          const cardBg = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_CALLOUT_NEUTRAL_BG
            : (config.blockquoteBg || '#FFF8F1');
          const cardBorder = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_NEUTRAL_BORDER
            : (config.blockquoteBorderColor || `${color}33`);
          const cardAccent = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_NEUTRAL_BORDER
            : color;
          const cardText = config.blockquoteTextColor || 'rgba(0, 0, 0, 0.68)';
          return `font-size: ${Math.max(sizes.base - 1, 13)}px; line-height: 1.85; color: ${cardText}; background: ${cardBg}; margin: 20px 0; padding: 12px 14px; border: 1px solid ${cardBorder}; border-left: ${config.blockquoteBorderWidth || 4}px solid ${cardAccent}; border-radius: ${r.md}px; box-sizing: border-box;`;
        }
        if (config.blockquoteStyle === 'note') {
          const noteBg = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_CALLOUT_NEUTRAL_BG
            : (config.blockquoteBg || '#fff9ec');
          const noteBorder = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_NEUTRAL_BORDER
            : (config.blockquoteBorderColor || '#f3c969');
          const noteText = quoteCalloutStyleMode === 'neutral'
            ? '#595959'
            : (config.blockquoteTextColor || '#666666');
          return `font-size: ${sizes.base}px; line-height: 1.85; color: ${noteText}; background: ${noteBg}; margin: 20px 0; padding: 10px 14px; border-left: ${config.blockquoteBorderWidth || 4}px solid ${noteBorder}; border-radius: 4px; box-sizing: border-box;`;
        }
        if (config.blockquoteStyle === 'center') {
          const centeredBackground = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_CALLOUT_NEUTRAL_BG
            : (config.blockquoteBg || color + '1F');
          const centeredRuleColor = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_NEUTRAL_BORDER
            : `${color}55`;
          return `font-family: ${AppleTheme.FONTS.serif}; font-size: ${sizes.base}px; line-height: 1.85; color: #4f4a45; background: ${centeredBackground}; width: 92%; box-sizing: border-box; margin: 24px auto; padding: 18px 20px; text-align: justify; border-top: 1px solid ${centeredRuleColor}; border-bottom: 1px solid ${centeredRuleColor}; border-left: none; border-right: none; border-radius: ${r.sm}px;`;
        }
        if (config.blockquoteStyle === 'paper') {
          const paperBg = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_CALLOUT_NEUTRAL_BG
            : (config.blockquoteBg || color + '1F');
          const paperBorder = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_NEUTRAL_BORDER
            : `${color}99`;
          return `font-family: ${AppleTheme.FONTS.serif}; font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: #5f574c; background: ${paperBg}; margin: 22px 0 22px 8px; padding: 16px 18px; border-left: 3px solid ${paperBorder}; border-radius: ${r.sm}px; text-align: justify;`;
        }
        if (config.blockquoteStyle === 'soft') {
          const softBg = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_CALLOUT_NEUTRAL_BG
            : (config.blockquoteBg || color + '14');
          const softTextColor = config.blockquoteTextColor || '#595959';
          const softBorderColor = quoteCalloutStyleMode === 'neutral'
            ? AppleTheme.QUOTE_NEUTRAL_BORDER
            : `${color}99`;
          const softBorderWidth = this.themeName === 'wechat'
            ? 3
            : (config.blockquoteBorderWidth || 4);
          return `font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${softTextColor}; background: ${softBg}; margin: ${s.md}px 0 ${s.md}px 8px; padding: ${s.md}px; border-left: ${softBorderWidth}px solid ${softBorderColor}; border-radius: ${r.sm}px;`;
        }

        if (quoteCalloutStyleMode === 'neutral') {
          const neutralBorderWidth = this.themeName === 'wechat'
            ? 3
            : (config.blockquoteBorderWidth || 4);
          return `font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: #595959; background: ${AppleTheme.QUOTE_CALLOUT_NEUTRAL_BG}; margin: ${s.md}px 0 ${s.md}px 8px; padding: ${s.md}px; border-left: ${neutralBorderWidth}px solid ${AppleTheme.QUOTE_NEUTRAL_BORDER}; border-radius: ${r.sm}px;`;
        }

        // 经典主题（wechat）：使用更细的边框和更浅的颜色，与 H3 区分
        // H3: 4px 主题色 100% 左边框，顶格
        // 引用块: 3px 主题色 60% 左边框，缩进 4px
        if (this.themeName === 'wechat') {
          return `font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: #595959; background: ${config.blockquoteBg || color + '1F'}; margin: ${s.md}px 0 ${s.md}px 4px; padding: ${s.md}px; border-left: 3px solid ${color}99; border-radius: 3px;`;
        }

        // Standard Blockquote: Restoring Italic and adjusting padding/background to match the screenshot
        // Background: Light opacity of theme color (1F) for better visibility
        // Border: Solid theme color
        // Font: Normal (removed italic) for better legibility on mobile
        return `font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: #595959; background: ${config.blockquoteBg || color + '1F'}; margin: ${s.md}px 0; padding: ${s.md}px; border-left: ${config.blockquoteBorderWidth}px solid ${config.blockquoteBorderColor || color}; border-radius: 3px;`;

      case 'blockquote p':
        if (config.blockquoteStyle === 'card') {
          return `margin: 0; padding: 0; font-size: ${Math.max(sizes.base - 1, 13)}px; color: ${config.blockquoteTextColor || 'rgba(0, 0, 0, 0.68)'}; line-height: 1.85; letter-spacing: 0; text-indent: 0; text-align: left;`;
        }
        if (config.blockquoteStyle === 'note') {
          return `margin: 0; padding: 0; font-size: ${sizes.base}px; color: ${config.blockquoteTextColor || '#666666'}; line-height: 1.85; letter-spacing: 0; text-indent: 0; text-align: left;`;
        }
        return '';

      case 'pre':
        if (config.preBg) {
          return `background: ${config.preBg}; border-radius: 6px; padding: 12px 14px; margin: 18px 0; overflow-x: auto; font-family: ${AppleTheme.FONTS.monospace}; font-size: ${sizes.code}px; line-height: 1.7; color: ${config.preColor || '#444444'};`;
        }
        if (config.codeSurface === 'neutral') {
          return `background: #fafafa; border: 1px solid #f0f0f0; border-radius: ${r.md}px; padding: 14px 16px; margin: ${s.md}px 0; overflow-x: auto; font-family: ${AppleTheme.FONTS.monospace}; font-size: ${sizes.code}px; line-height: 1.7; color: ${textColor};`;
        }
        return `background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: ${r.md}px; padding: ${s.md}px; margin: ${s.md}px 0; overflow-x: auto; font-family: ${AppleTheme.FONTS.monospace}; font-size: ${sizes.code}px; line-height: 1.6; color: #24292e;`;

      case 'code':
        if (config.codeColor || config.codeBg) {
          return `background: ${config.codeBg || '#f8f8f8'}; color: ${config.codeColor || color}; padding: 2px 4px; border-radius: 3px; font-family: ${AppleTheme.FONTS.monospace}; font-size: ${sizes.code}px;`;
        }
        if (config.codeSurface === 'neutral') {
          return `background: #fafafa; color: ${color}; padding: 2px 6px; margin: 0 2px; border: 1px solid #f0f0f0; border-radius: 4px; font-family: ${AppleTheme.FONTS.monospace}; font-size: ${sizes.code}px;`;
        }
        return `background: ${color}1A; color: ${color}; padding: 2px 4px; border-radius: 3px; font-family: ${AppleTheme.FONTS.monospace}; font-size: ${sizes.code}px;`;

      case 'ul':
        return `font-family: ${font}; font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; margin: ${config.listMargin || '12px 0'}; padding-left: ${config.listPaddingLeft || 20}px; list-style-type: disc;`;
      case 'ol':
        return `font-family: ${font}; font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; margin: ${config.listMargin || '12px 0'}; padding-left: ${config.listPaddingLeft || 20}px; list-style-type: decimal;`;
      case 'li':
        return `font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; margin: 4px 0;${effectiveLetterSpacing ? ` letter-spacing: ${effectiveLetterSpacing}px;` : ''}`;
      case 'li-task':
        return `font-size: ${sizes.base}px; line-height: ${effectiveLineHeight}; color: ${textColor}; margin: 4px 0; list-style-type: none; margin-left: -20px;`;
      case 'li p':
        return `margin: 0; padding: 0; line-height: ${effectiveLineHeight};`;




      case 'figure':
        if (config.figureChrome === 'none') {
          return `display: block; margin: 18px 0; text-align: center; padding: 0;`;
        }
        // Fix: Restoring wireframe (border/padding) & balanced spacing (20px top/bottom)
        // No shadow for cleaner look
        return `display: block; margin: 20px 0; text-align: center; border: 1px solid ${config.figureBorderColor || '#e1e4e8'}; border-radius: ${r.md}px; padding: ${config.figurePadding || 10}px;`;

      case 'figcaption':
        return `font-size: ${sizes.caption}px; color: ${config.captionColor || '#999'}; text-align: center; margin-top: ${s.sm}px;`;

      case 'img':
        return `display: block; margin: 0 auto; max-width: 100%; border-radius: ${config.imageRadius || 4}px;`;

      case 'a': {
        const linkColor = config.linkColor || color;
        if (config.linkDecoration === 'solid') {
          return `color: ${linkColor}; text-decoration: none; border-bottom: 1px solid ${linkColor}59; word-break: break-word; overflow-wrap: anywhere;`;
        }
        return `color: ${linkColor}; text-decoration: ${config.linkDecoration}; border-bottom: ${config.linkDecoration === 'none' ? `1px dashed ${linkColor}` : 'none'}; word-break: break-word; overflow-wrap: anywhere;`;
      }

      case 'table-wrapper':
        return `display: block; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: scroll; overflow-y: hidden; -webkit-overflow-scrolling: touch; margin: ${s.md}px 0; padding-bottom: 10px;`;
      case 'table':
        return `border-collapse: collapse; width: 720px; min-width: 100%; max-width: none; table-layout: auto; border: 1px solid ${config.tableBorderColor || '#e1e4e8'};`;
      case 'th':
        return `background: ${config.tableHeaderBg || color + '1F'}; font-weight: bold; color: ${textColor}; border: 1px solid ${config.tableBorderColor || '#e1e4e8'}; padding: ${config.tableCellPadding || 12}px; text-align: left; white-space: nowrap; word-break: keep-all; overflow-wrap: normal;`;
      case 'td':
        return `border: 1px solid ${config.tableBorderColor || '#e1e4e8'}; padding: ${config.tableCellPadding || 12}px; text-align: left; white-space: nowrap; word-break: keep-all; overflow-wrap: normal;`;
      case 'thead':
        return `background: ${config.tableHeaderBg || '#f6f8fa'};`;

      case 'hr':
        return `border: 0; border-top: 1px solid ${config.hrColor || 'rgba(0,0,0,0.08)'}; margin: ${config.hrMargin || 40}px 0; max-width: 100%; box-sizing: border-box;`;

      case 'strong':
        if (config.strongBg) {
          return `font-weight: bold; color: ${color}; background: ${color}18; padding: 0 3px; border-radius: 3px;`;
        }
        return `font-weight: ${config.strongWeight || 'bold'}; color: ${config.strongColor || color};`;
      case 'em':
        return config.emColor ? `font-style: italic; color: ${config.emColor};` : `font-style: italic;`;
      case 'del':
        return `text-decoration: line-through; color: ${config.delColor || '#999'};`;
      case 'mark':
        return `background-color: #fff1a8; padding: 0 2px; border-radius: 2px;`;

      case 'avatar-header':
        return `margin: 0 0 ${s.sm}px 0 !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; width: 100%; flex-direction: row !important; flex-wrap: nowrap !important; text-align: left !important;`;
      case 'avatar':
        return `display: inline-block !important; vertical-align: middle !important; margin: 0 !important; width: 32px !important; height: 32px !important; border-radius: 50%; object-fit: cover; border: 1px solid #e8e8ed; flex-shrink: 0;`;
      case 'avatar-caption':
        return `display: inline-block !important; vertical-align: middle !important; font-size: ${sizes.caption}px; color: #666; margin-left: 10px; line-height: 1.4; text-align: left !important;`;

      default:
        return '';
    }
  }

  // === Helper Methods ===

  /**
   * @param {string | undefined} type
   * @param {string} color
   * @param {number} fontSize
   * @param {string} font
   * @param {string} headingColor
   * @param {AppleThemeConfig} [config]
   * @returns {string}
   */
  getH1Style(type, color, fontSize, font, headingColor, config = AppleTheme.THEME_CONFIGS.github) {
    return /** @type {string} */ (buildH1Style.call(this, AppleTheme, type, color, fontSize, font, headingColor, config));
  }

  /**
   * @param {string | undefined} type
   * @param {string} color
   * @param {number} fontSize
   * @param {string} font
   * @param {string} headingColor
   * @param {AppleThemeConfig} [config]
   * @returns {string}
   */
  getH2Style(type, color, fontSize, font, headingColor, config = AppleTheme.THEME_CONFIGS.github) {
    return /** @type {string} */ (buildH2Style.call(this, AppleTheme, type, color, fontSize, font, headingColor, config));
  }

  /**
   * @param {string | undefined} type
   * @param {string} color
   * @param {number} fontSize
   * @param {string} font
   * @param {string} headingColor
   * @param {AppleThemeConfig} [config]
   * @returns {string}
   */
  getH3Style(type, color, fontSize, font, headingColor, config = AppleTheme.THEME_CONFIGS.github) {
    return /** @type {string} */ (buildH3Style.call(this, AppleTheme, type, color, fontSize, font, headingColor, config));
  }

  /**
   * @param {string | undefined} type
   * @param {string} color
   * @param {number} fontSize
   * @param {string} font
   * @param {string} headingColor
   * @returns {string}
   */
  getH4Style(type, color, fontSize, font, headingColor) {
    return /** @type {string} */ (buildH4Style.call(this, AppleTheme, type, color, fontSize, font, headingColor));
  }

  /**
   * @param {string | undefined} type
   * @param {string} color
   * @param {number} fontSize
   * @param {string} font
   * @param {string} headingColor
   * @returns {string}
   */
  getH5Style(type, color, fontSize, font, headingColor) {
    return /** @type {string} */ (buildH5Style.call(this, AppleTheme, type, color, fontSize, font, headingColor));
  }

  /**
   * @param {string | undefined} type
   * @param {string} color
   * @param {number} fontSize
   * @param {string} font
   * @param {string} headingColor
   * @param {string} [mutedColor]
   * @returns {string}
   */
  getH6Style(type, color, fontSize, font, headingColor, mutedColor = '#6b7280') {
    return /** @type {string} */ (buildH6Style.call(this, AppleTheme, type, color, fontSize, font, headingColor, mutedColor));
  }

  /**
   * @param {string} hexColor
   * @param {string} [alphaHex]
   * @returns {string}
   */
  hexToRgba(hexColor, alphaHex = 'ff') {
    const normalized = String(hexColor || '').trim().replace(/^#/, '');
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      return hexColor;
    }
    const alpha = Number.parseInt(String(alphaHex || 'ff'), 16);
    const clampedAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(255, alpha)) : 255;
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${(clampedAlpha / 255).toFixed(3)})`;
  }

  /**
   * @param {...string} styles
   * @returns {string}
   */
  joinStyleStrings(...styles) {
    return styles
      .map((style) => (style || '').trim())
      .filter(Boolean)
      .map((style) => style.endsWith(';') ? style : `${style};`)
      .join(' ');
  }

  /**
   * @param {AppleThemeConfig} [config]
   * @returns {number}
   */
  getSectionSidePadding(config = AppleTheme.THEME_CONFIGS.github) {
    const configuredPadding = Number(this.sidePadding);
    const themeOffset = Number(config.sectionSidePaddingOffset || 0);
    const safeConfiguredPadding = Number.isFinite(configuredPadding) ? configuredPadding : 16;
    const safeThemeOffset = Number.isFinite(themeOffset) ? themeOffset : 0;
    return safeConfiguredPadding + safeThemeOffset;
  }

  /**
   * @param {AppleThemeConfig} [config]
   * @returns {string}
   */
  getSectionBoxSizingStyle(config = AppleTheme.THEME_CONFIGS.github) {
    return config.sectionSidePaddingOffset ? 'box-sizing: border-box; ' : '';
  }

   /**
   * 更新配置
   * @param {AppleThemeOptions} options
   */
  update(options) {
    if (typeof options.theme === 'string') this.themeName = options.theme;
    if (typeof options.themeColor === 'string') this.themeColor = options.themeColor;
    if (typeof options.customColor === 'string' || options.customColor === null) this.customColor = options.customColor;
    if (typeof options.quoteCalloutStyleMode === 'string') this.quoteCalloutStyleMode = options.quoteCalloutStyleMode;
    if (typeof options.fontFamily === 'string') this.fontFamily = options.fontFamily;
    if (typeof options.fontSize === 'number') this.fontSize = options.fontSize;
    if (options.macCodeBlock !== undefined) this.macCodeBlock = options.macCodeBlock !== false;
    if (options.codeLineNumber !== undefined) this.codeLineNumber = Boolean(options.codeLineNumber);
    if (options.sidePadding !== undefined) this.sidePadding = Number(options.sidePadding);
    // 间距微调：允许 null 显式重置为继承主题默认
    if (options.lineHeight !== undefined) this.lineHeight = options.lineHeight;
    if (options.paragraphGap !== undefined) this.paragraphGap = options.paragraphGap;
    if (options.letterSpacing !== undefined) this.letterSpacing = options.letterSpacing;
    if (options.coloredHeader !== undefined) this.coloredHeader = Boolean(options.coloredHeader);
  }

  /**
   * 获取主题列表
   * @returns {{ value: string, label: string }[]}
   */
  static getThemeList() {
    return Object.entries(AppleTheme.THEME_CONFIGS).map(([key, config]) => ({
      value: key,
      label: config.name,
    }));
  }

  /**
   * 获取主题色列表
   * @returns {{ value: string, color: string }[]}
   */
  static getColorList() {
    return Object.entries(AppleTheme.THEME_COLORS).map(([key, value]) => ({
      value: key,
      color: value,
    }));
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-return -- reason: resume typed linting after AppleTheme class boundary */

// 导出到全局作用域
APPLE_THEME_GLOBAL.AppleTheme = AppleTheme;
if (typeof window !== 'undefined') {
  window.AppleTheme = APPLE_THEME_GLOBAL.AppleTheme;
}

export default AppleTheme;
