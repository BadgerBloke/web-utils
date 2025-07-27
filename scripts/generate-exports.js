import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, parse } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Default configuration
const defaultConfig = {
    autoGenerate: true,
    customExports: {},
    include: ['src'],
    exclude: ['.test.', '.spec.'],
    pathMappings: {},
    paths: {
        jsOutput: './lib/',
        typesOutput: './lib/types/'
    }
};

/**
 * Load configuration
 */
async function loadConfig() {
    const configPath = join(rootDir, 'exports.config.js');

    if (existsSync(configPath)) {
        try {
            const { default: config } = await import(configPath);
            return { ...defaultConfig, ...config };
        } catch (error) {
            console.warn('⚠️  Could not load exports.config.js, using defaults');
            return defaultConfig;
        }
    }

    return defaultConfig;
}

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath, excludePatterns) {
    return excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Recursively find TypeScript files
 */
function findTSFiles(dirs, config) {
    const files = [];

    for (const dir of dirs) {
        const fullDir = join(rootDir, dir);
        if (!existsSync(fullDir)) {
            console.log(`⚠️  Directory ${dir} does not exist, skipping...`);
            continue;
        }

        function walkDir(currentDir) {
            const items = readdirSync(currentDir);

            for (const item of items) {
                const fullPath = join(currentDir, item);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    walkDir(fullPath);
                } else if (item.endsWith('.ts') && !shouldExclude(item, config.exclude)) {
                    const relativePath = relative(rootDir, fullPath);
                    files.push(relativePath);
                    console.log(`📁 Found: ${relativePath}`);
                }
            }
        }

        walkDir(fullDir);
    }

    console.log(`📊 Total TypeScript files found: ${files.length}`);
    return files;
}

/**
 * Generate export path with custom mappings
 */
function generateExportPath(filePath, config) {
    const relativePath = filePath.replace(/^src[\/\\]/, '');
    const parsed = parse(relativePath);
    const pathWithoutExt = join(parsed.dir, parsed.name).replace(/\\/g, '/');

    console.log(`🔍 Processing: ${filePath} -> pathWithoutExt: ${pathWithoutExt}`);

    // Check custom mappings first
    if (config.pathMappings[pathWithoutExt]) {
        console.log(`✨ Using custom mapping: ${pathWithoutExt} -> ${config.pathMappings[pathWithoutExt]}`);
        return './' + config.pathMappings[pathWithoutExt];
    }

    // Handle index files in subdirectories
    if (parsed.name === 'index' && parsed.dir) {
        const exportPath = './' + parsed.dir.replace(/\\/g, '/');
        console.log(`📂 Index file mapping: ${pathWithoutExt} -> ${exportPath}`);
        return exportPath;
    }

    // Handle non-index files
    if (parsed.dir) {
        const exportPath = './' + pathWithoutExt;
        console.log(`📄 Non-index file mapping: ${pathWithoutExt} -> ${exportPath}`);
        return exportPath;
    }

    // Root level files (except main index)
    if (parsed.name !== 'index') {
        const exportPath = './' + parsed.name;
        console.log(`🏠 Root file mapping: ${pathWithoutExt} -> ${exportPath}`);
        return exportPath;
    }

    console.log(`⏭️  Skipping main index: ${pathWithoutExt}`);
    return null; // Skip main index
}

/**
 * Generate exports object
 */
async function generateExports(config) {
    const exports = {
        '.': {
            types: config.paths.typesOutput + 'index.d.ts',
            import: config.paths.jsOutput + 'index.js'
        }
    };

    if (config.autoGenerate) {
        const tsFiles = findTSFiles(config.include, config);

        for (const filePath of tsFiles) {
            const exportPath = generateExportPath(filePath, config);

            if (exportPath) {
                const relativePath = filePath.replace(/^src\//, '');
                const jsPath = relativePath.replace(/\.ts$/, '.js');
                const dtsPath = relativePath.replace(/\.ts$/, '.d.ts');

                exports[exportPath] = {
                    types: config.paths.typesOutput + dtsPath,
                    import: config.paths.jsOutput + jsPath
                };
            }
        }
    }

    // Add custom exports
    Object.assign(exports, config.customExports);

    // Always include package.json
    exports['./package.json'] = './package.json';

    return exports;
}

/**
 * Update package.json
 */
async function updatePackageJson() {
    try {
        const config = await loadConfig();
        const packagePath = join(rootDir, 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

        packageJson.exports = await generateExports(config);
        packageJson.sideEffects = false; // Enable tree-shaking

        writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

        console.log('✅ Updated package.json exports');
        console.log('📦 Generated exports:');
        Object.keys(packageJson.exports).forEach(key => {
            console.log(`   ${key}`);
        });

    } catch (error) {
        console.error('❌ Error updating package.json:', error.message);
        process.exit(1);
    }
}

// Run the script
updatePackageJson();
