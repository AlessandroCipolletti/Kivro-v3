import { assertSafeProductionEnvironment } from "./startup-guards.js";
import { assertAwsProductionEnvironment } from "./aws-production-guards.js";
import { assertNetsonsProductionEnvironment } from "./netsons-production-guards.js";
import { startServer } from "./server.js";

assertSafeProductionEnvironment();
assertNetsonsProductionEnvironment();
assertAwsProductionEnvironment();
startServer();
