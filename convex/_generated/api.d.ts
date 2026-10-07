/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as adminOrders from "../adminOrders.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as categoriesAdmin from "../categoriesAdmin.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as fulfillment from "../fulfillment.js";
import type * as http from "../http.js";
import type * as lib_availability from "../lib/availability.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_orderStatus from "../lib/orderStatus.js";
import type * as lib_searchText from "../lib/searchText.js";
import type * as lib_validators from "../lib/validators.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as productsAdmin from "../productsAdmin.js";
import type * as seed from "../seed.js";
import type * as siteSettings from "../siteSettings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  adminOrders: typeof adminOrders;
  auth: typeof auth;
  categories: typeof categories;
  categoriesAdmin: typeof categoriesAdmin;
  crons: typeof crons;
  files: typeof files;
  fulfillment: typeof fulfillment;
  http: typeof http;
  "lib/availability": typeof lib_availability;
  "lib/constants": typeof lib_constants;
  "lib/orderStatus": typeof lib_orderStatus;
  "lib/searchText": typeof lib_searchText;
  "lib/validators": typeof lib_validators;
  orders: typeof orders;
  products: typeof products;
  productsAdmin: typeof productsAdmin;
  seed: typeof seed;
  siteSettings: typeof siteSettings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
