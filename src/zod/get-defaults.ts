import { z } from "zod/v4";

/**
 * Extracts default values from a Zod schema with full type safety
 * @param schema - The Zod schema to extract defaults from
 * @returns Object containing the default values with proper typing
 */
export function getZodDefaults<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
): Partial<z.infer<z.ZodObject<T>>> {
    if (!z) throw new Error("zod is required for getZodDefaults");
    const defaults = {} as Partial<z.infer<z.ZodObject<T>>>;
    try {
        // Try to parse an empty object to get defaults
        const parsed = schema.parse({});
        return parsed;
    } catch {
        // If parsing fails, try to extract defaults manually
        const shape = schema.shape;
        for (const [key, field] of Object.entries(shape)) {
            try {
                const zodField = field as z.ZodTypeAny;
                // Try to parse undefined to trigger default
                const result = zodField.safeParse(undefined);
                if (result.success) {
                    (defaults as any)[key] = result.data;
                } // Handle nested objects
                else if (zodField instanceof z.ZodObject) {
                    const nestedDefaults = getZodDefaults(zodField);
                    if (Object.keys(nestedDefaults).length > 0) {
                        (defaults as any)[key] = nestedDefaults;
                    }
                }
            } catch {
                // Skip fields that can't be processed
                continue;
            }
        }
    }
    return defaults;
}
