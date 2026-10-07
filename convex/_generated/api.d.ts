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
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as categoriesAdmin from "../categoriesAdmin.js";
import type * as contactAdmin from "../contactAdmin.js";
import type * as contactMessages from "../contactMessages.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as emails_admin from "../emails/admin.js";
import type * as emails_config from "../emails/config.js";
import type * as emails_index from "../emails/index.js";
import type * as emails_mutations from "../emails/mutations.js";
import type * as emails_queries from "../emails/queries.js";
import type * as emails_send from "../emails/send.js";
import type * as emails_templates_authCode from "../emails/templates/authCode.js";
import type * as emails_templates_layout from "../emails/templates/layout.js";
import type * as emails_templates_newContactMessage from "../emails/templates/newContactMessage.js";
import type * as emails_templates_newOrderAdmin from "../emails/templates/newOrderAdmin.js";
import type * as emails_templates_orderConfirmation from "../emails/templates/orderConfirmation.js";
import type * as emails_templates_orderStatusUpdate from "../emails/templates/orderStatusUpdate.js";
import type * as emails_transport from "../emails/transport.js";
import type * as emails_triggers from "../emails/triggers.js";
import type * as files from "../files.js";
import type * as fulfillment from "../fulfillment.js";
import type * as http from "../http.js";
import type * as inventoryAdmin from "../inventoryAdmin.js";
import type * as lib_availability from "../lib/availability.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_orderStatus from "../lib/orderStatus.js";
import type * as lib_pageDrafts from "../lib/pageDrafts.js";
import type * as lib_reservedSlugs from "../lib/reservedSlugs.js";
import type * as lib_searchText from "../lib/searchText.js";
import type * as lib_validators from "../lib/validators.js";
import type * as orders from "../orders.js";
import type * as pages from "../pages.js";
import type * as pagesAdmin from "../pagesAdmin.js";
import type * as pagesSeed from "../pagesSeed.js";
import type * as products from "../products.js";
import type * as productsAdmin from "../productsAdmin.js";
import type * as seed from "../seed.js";
import type * as siteSettings from "../siteSettings.js";
import type * as users from "../users.js";
import type * as usersAdmin from "../usersAdmin.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  adminOrders: typeof adminOrders;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  categories: typeof categories;
  categoriesAdmin: typeof categoriesAdmin;
  contactAdmin: typeof contactAdmin;
  contactMessages: typeof contactMessages;
  crons: typeof crons;
  emails: typeof emails;
  "emails/admin": typeof emails_admin;
  "emails/config": typeof emails_config;
  "emails/index": typeof emails_index;
  "emails/mutations": typeof emails_mutations;
  "emails/queries": typeof emails_queries;
  "emails/send": typeof emails_send;
  "emails/templates/authCode": typeof emails_templates_authCode;
  "emails/templates/layout": typeof emails_templates_layout;
  "emails/templates/newContactMessage": typeof emails_templates_newContactMessage;
  "emails/templates/newOrderAdmin": typeof emails_templates_newOrderAdmin;
  "emails/templates/orderConfirmation": typeof emails_templates_orderConfirmation;
  "emails/templates/orderStatusUpdate": typeof emails_templates_orderStatusUpdate;
  "emails/transport": typeof emails_transport;
  "emails/triggers": typeof emails_triggers;
  files: typeof files;
  fulfillment: typeof fulfillment;
  http: typeof http;
  inventoryAdmin: typeof inventoryAdmin;
  "lib/availability": typeof lib_availability;
  "lib/constants": typeof lib_constants;
  "lib/orderStatus": typeof lib_orderStatus;
  "lib/pageDrafts": typeof lib_pageDrafts;
  "lib/reservedSlugs": typeof lib_reservedSlugs;
  "lib/searchText": typeof lib_searchText;
  "lib/validators": typeof lib_validators;
  orders: typeof orders;
  pages: typeof pages;
  pagesAdmin: typeof pagesAdmin;
  pagesSeed: typeof pagesSeed;
  products: typeof products;
  productsAdmin: typeof productsAdmin;
  seed: typeof seed;
  siteSettings: typeof siteSettings;
  users: typeof users;
  usersAdmin: typeof usersAdmin;
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
