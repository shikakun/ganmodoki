import { execSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { glob } from 'glob';
import { optimize } from 'svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../icons');
const OUTPUT_DIR = path.join(__dirname, '../src/icons');
const INDEX_FILE = path.join(__dirname, '../src/index.tsx');
const TYPES_FILE = path.join(__dirname, '../src/types.tsx');

const require = createRequire(import.meta.url);
const svgoConfig = require('../svgo.config.js');

function clearOutputDirectory() {
  fs.emptyDirSync(OUTPUT_DIR);
  console.log('Cleared output directory');
}

function createTypesFile() {
  const typesContent = `
import * as React from 'react';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  children?: never;
  color?: string;
}
`;
  fs.writeFileSync(TYPES_FILE, typesContent);
  console.log('Created: types.tsx');
}

function optimizeAndConvertSvgFiles() {
  const svgFiles = glob.sync(`${ICONS_DIR}/*.svg`);
  const componentNames = svgFiles
    .map((filePath) => {
      const fileName = path.basename(filePath, '.svg');
      const componentName =
        fileName.charAt(0).toUpperCase() + fileName.slice(1);
      let svgContent = fs.readFileSync(filePath, 'utf8');

      const optimizedSvg = optimize(svgContent, {
        path: filePath,
        ...svgoConfig,
      });
      if (optimizedSvg.error) {
        console.error(`Error optimizing SVG file: ${filePath}`);
        return null;
      }
      svgContent = optimizedSvg.data;

      const svgElementMatch = svgContent.match(/<svg[^>]*>[\s\S]*<\/svg>/);
      if (!svgElementMatch) {
        console.error(`Invalid SVG content in file: ${filePath}`);
        return null;
      }
      let svgElement = svgElementMatch[0];

      svgElement = addDefaultDimensions(svgElement);
      svgElement = removeUnwantedAttributes(svgElement);

      const tsxContent = createTsxContent(componentName, svgElement);
      const outputPath = path.join(OUTPUT_DIR, `${fileName}.tsx`);
      fs.ensureDirSync(path.dirname(outputPath));
      fs.writeFileSync(outputPath, tsxContent);
      console.log(`Created: ${fileName}.tsx`);
      return componentName;
    })
    .filter(Boolean);

  return componentNames;
}

function addDefaultDimensions(svgElement) {
  if (!svgElement.includes('width=')) {
    svgElement = svgElement.replace('<svg', '<svg width="24"');
  }
  if (!svgElement.includes('height=')) {
    svgElement = svgElement.replace('<svg', '<svg height="24"');
  }
  return svgElement;
}

function removeUnwantedAttributes(svgElement) {
  svgElement = svgElement.replace(/style="[^"]*"/g, '');
  svgElement = svgElement.replace(/data-name="[^"]*"/g, '');
  return svgElement;
}

function createTsxContent(componentName, svgElement) {
  return `
import * as React from 'react';
import { IconProps } from '../types';

export const ${componentName} = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', ...props }, forwardedRef) => {
    return (
      ${svgElement
        .replace('<svg', '<svg {...props} ref={forwardedRef}')
        .replace(/<path/g, '<path fill={color}')}
    );
  }
);
${componentName}.displayName = '${componentName}';

export default ${componentName};
`;
}

function createIndexFile(componentNames) {
  const indexContent = componentNames
    .map((name) => `export { default as ${name} } from './icons/${name}';`)
    .join('\n');
  fs.writeFileSync(INDEX_FILE, indexContent);
  console.log('Created: index.tsx');
}

function formatWithPrettier() {
  execSync('npx prettier --write src');
  console.log('Formatted code with Prettier');
}

function main() {
  clearOutputDirectory();
  createTypesFile();
  createIndexFile(optimizeAndConvertSvgFiles());
  formatWithPrettier();
}

main();
