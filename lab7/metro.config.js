// @ts-check
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// В корне лежат тяжёлые PDF/DOCX (методичка, отчёт). Их не импортируют, но исключение
// из графа резолва снижает риск сбоев и лишней работы Metro на Windows.
config.resolver.blockList = [
  ...(config.resolver.blockList ?? []),
  /\.pdf$/,
  /\.docx$/,
];

module.exports = config;
