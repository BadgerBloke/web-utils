export interface RouteConfig {
    [key: string]: string | RouteConfig | { path: string };
}

type BuildRoutes<T extends RouteConfig> = {
    readonly [K in keyof T]: T[K] extends { path: string }
    ? T[K] & { path: string }
    : T[K] extends RouteConfig ? BuildRoutes<T[K]> & { path: string }
    : never;
};

export const createRoutes = <T extends RouteConfig>(
    basePath: string,
    routes: T,
): BuildRoutes<T> => {
    const result = {} as RouteConfig;
    for (const [key, value] of Object.entries(routes)) {
        if (typeof value === "object" && value !== null) {
            if ("path" in value) {
                const fullPath = `${basePath}/${value.path}`;
                const newValue = { ...value, path: fullPath };
                const nestedRoutes = Object.entries(value).filter(
                    ([k, v]) =>
                        !["path", "step", "prev", "next"].includes(k) &&
                        typeof v === "object" && v !== null,
                );
                if (nestedRoutes.length > 0) {
                    const nestedResult = {} as RouteConfig;
                    for (const [nestedKey, nestedValue] of nestedRoutes) {
                        if (
                            typeof nestedValue === "object" &&
                            nestedValue !== null
                        ) {
                            nestedResult[nestedKey] = createRoutes(fullPath, {
                                [nestedKey]: nestedValue,
                            })[
                                nestedKey
                            ]!;
                        }
                    }
                    result[key] = { ...newValue, ...nestedResult };
                } else {
                    result[key] = newValue;
                }
            } else {
                const nestedPath = `${basePath}/${key}`;
                result[key] = {
                    path: nestedPath,
                    ...createRoutes(nestedPath, value),
                };
            }
        } else {
            result[key] = `${basePath}/${value}`;
        }
    }
    resolveNavigationPaths(result, result);
    return Object.freeze(result) as BuildRoutes<T>;
};

const resolveNavigationPaths = (
    obj: RouteConfig,
    rootObj: RouteConfig,
): void => {
    if (!obj || typeof obj !== "object") return;
    for (const value of Object.values(obj)) {
        if (typeof value === "object" && value !== null) {
            if ("prev" in value && typeof value.prev === "string") {
                const resolvedPath = resolveNavigationPath(
                    value.prev,
                    obj,
                    rootObj,
                );
                if (resolvedPath) {
                    value.prev = resolvedPath;
                }
            }
            if ("next" in value && typeof value.next === "string") {
                const resolvedPath = resolveNavigationPath(
                    value.next,
                    obj,
                    rootObj,
                );
                if (resolvedPath) {
                    value.next = resolvedPath;
                }
            }
            resolveNavigationPaths(value, rootObj);
        }
    }
};

const resolveNavigationPath = (
    navigationPath: string,
    currentContext: RouteConfig | string | undefined,
    rootObj: RouteConfig,
): string | undefined => {
    if (!navigationPath) return;
    const segments = navigationPath.split("/");
    let current = currentContext;
    for (const segment of segments) {
        if (segment === "..") {
            current = findParentContext(current, rootObj);
            if (!current) return;
        } else if (segment === ".") {
            continue;
        } else if (segment) {
            if (current && typeof current === "object" && segment in current) {
                current = current[segment];
            } else {
                return;
            }
        }
    }
    return current && typeof current === "object" && "path" in current
        ? (current.path as string)
        : undefined;
};

const findParentContext = (
    target: string | RouteConfig | undefined,
    root: RouteConfig,
) => {
    const findParent = (obj: RouteConfig): RouteConfig | undefined => {
        if (!obj || typeof obj !== "object") return;
        for (const value of Object.values(obj)) {
            if (value === target) {
                return obj;
            }
            if (typeof value === "object" && value) {
                const found = findParent(value);
                if (found) return found;
            }
        }
        return;
    };
    return findParent(root);
};

export const findRouteByPath = (
    pathname: string,
    routes: RouteConfig,
): RouteConfig | undefined => {
    const searchRoutes = (obj: RouteConfig): RouteConfig | undefined => {
        if (obj && typeof obj === "object" && obj.path === pathname) {
            return obj;
        }
        if (obj && typeof obj === "object") {
            for (const [key, value] of Object.entries(obj)) {
                if (key !== "path" && typeof value === "object" && value) {
                    const result = searchRoutes(value);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return;
    };
    return searchRoutes(routes);
};

export const findRouteByNext = (
    nextPath: string,
    routes: RouteConfig,
): RouteConfig | undefined => {
    const searchRoutes = (obj: RouteConfig): RouteConfig | undefined => {
        if (obj && typeof obj === "object" && obj.next === nextPath) {
            return obj;
        }
        if (obj && typeof obj === "object") {
            for (const [key, value] of Object.entries(obj)) {
                if (key !== "path" && typeof value === "object" && value) {
                    const result = searchRoutes(value);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return;
    };
    return searchRoutes(routes);
};

export const findRouteByPrev = (
    prevPath: string,
    routes: RouteConfig,
): RouteConfig | undefined => {
    const searchRoutes = (obj: RouteConfig): RouteConfig | undefined => {
        if (obj && typeof obj === "object" && obj.prev === prevPath) {
            return obj;
        }
        if (obj && typeof obj === "object") {
            for (const [key, value] of Object.entries(obj)) {
                if (key !== "path" && typeof value === "object" && value) {
                    const result = searchRoutes(value);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return;
    };
    return searchRoutes(routes);
};
