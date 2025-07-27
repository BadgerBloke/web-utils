import { describe, it } from "node:test";
import assert from "node:assert";
import {
    createRoutes,
    findRouteByNext,
    findRouteByPath,
    findRouteByPrev,
} from "../../src/factories/route-factory.ts";

describe("route-factory", () => {
    it("should create routes", () => {
        const expectedRoutes = {
            start: {
                path: "/client/start",
                next: "/client/onboarding/basic-details",
            },
            onboarding: {
                path: "/client/onboarding",
                basicDetails: {
                    path: "/client/onboarding/basic-details",
                    step: 1,
                    prev: "/client/start",
                    next: "/client/onboarding/business-details",
                },
                businessDetails: {
                    path: "/client/onboarding/business-details",
                    step: 2,
                    prev: "/client/onboarding/basic-details",
                    next: "/client/review",
                },
            },
            review: {
                path: "/client/review",
                step: 3,
                prev: "/client/onboarding/business-details",
            },
        };
        const routeConfig = {
            start: {
                path: "start",
                next: "./onboarding/basicDetails",
            },
            onboarding: {
                path: "onboarding",
                basicDetails: {
                    path: "basic-details",
                    step: 1,
                    prev: "../start",
                    next: "./businessDetails",
                },
                businessDetails: {
                    path: "business-details",
                    step: 2,
                    prev: "./basicDetails",
                    next: "../review",
                },
            },
            review: {
                path: "review",
                step: 3,
                prev: "./onboarding/businessDetails",
            },
        };
        const routes = createRoutes("/client", routeConfig);
        assert.deepEqual(routes, expectedRoutes);

        const nextRouteObj = findRouteByNext(
            "/client/onboarding/business-details",
            routes,
        );
        assert.deepEqual(
            nextRouteObj,
            expectedRoutes.onboarding.basicDetails,
        );

        const prevRouteObj = findRouteByPrev(
            "/client/onboarding/business-details",
            routes,
        );
        assert.deepEqual(
            prevRouteObj,
            expectedRoutes.review,
        );

        const pathRouteObj = findRouteByPath(
            "/client/onboarding/business-details",
            routes,
        );
        assert.deepEqual(
            pathRouteObj,
            expectedRoutes.onboarding.businessDetails,
        );
    });
});
