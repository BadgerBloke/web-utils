// exports.config.js - Define your exports structure
export default {
    // Auto-generate from file structure
    autoGenerate: true,

    // Manual overrides/additions
    customExports: {
        // Add any custom exports here if needed
    },

    // Directories to scan
    include: ['src'],

    // Patterns to exclude
    exclude: ['.test.', '.spec.'],

    // Export path mapping rules
    pathMappings: {
        // Map src/factories/route-factory.ts to ./route-factory
        'factories/route-factory': 'route-factory',

        // Map src/zod/get-defaults.ts to ./zod/get-defaults  
        'zod/get-defaults': 'zod/get-defaults',

        // Map src/zod/index.ts to ./zod
        'zod/index': 'zod',

        // Map src/factories/index.ts to ./factories
        'factories/index': 'factories'
    },

    // Output paths
    paths: {
        jsOutput: './lib/',
        typesOutput: './lib/types/'
    }
};
