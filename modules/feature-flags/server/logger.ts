import { logger } from "@/modules/shared/server/logger";

export const flagLogger = logger.child({ module: "featureFlags"})