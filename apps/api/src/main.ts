import { assertSafeProductionEnvironment } from "./startup-guards.js";
import { assertNetsonsProductionEnvironment } from "./netsons-production-guards.js";
import { startServer } from "./server.js";

assertSafeProductionEnvironment();
assertNetsonsProductionEnvironment();
startServer();
