import { assertSafeProductionEnvironment } from "./startup-guards.js";
import { startServer } from "./server.js";

assertSafeProductionEnvironment();
startServer();
