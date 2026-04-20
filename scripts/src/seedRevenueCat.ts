import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "Prayer Point";

const APP_STORE_APP_NAME = "Prayer Point iOS";
const APP_STORE_BUNDLE_ID = "com.prayerpoint.app";
const PLAY_STORE_APP_NAME = "Prayer Point Android";
const PLAY_STORE_PACKAGE_NAME = "com.prayerpoint.app";

const ENTITLEMENT_IDENTIFIER = "premium";
const ENTITLEMENT_DISPLAY_NAME = "Prayer Point Premium";

const OFFERING_IDENTIFIER = "premium_v2";
const OFFERING_DISPLAY_NAME = "Premium Offering v2";

type Duration = "P1W" | "P1M" | "P2M" | "P3M" | "P6M" | "P1Y";

interface TierDefinition {
  productIdentifier: string;
  playStoreProductIdentifier: string;
  displayName: string;
  userFacingTitle: string;
  duration: Duration;
  packageIdentifier: string;
  packageDisplayName: string;
  prices: { amount_micros: number; currency: string }[];
}

const TIERS: TierDefinition[] = [
  {
    productIdentifier: "prayerpoint_monthly_usd",
    playStoreProductIdentifier: "prayerpoint_monthly_usd:monthly",
    displayName: "Prayer Point Monthly (USD)",
    userFacingTitle: "Monthly",
    duration: "P1M",
    packageIdentifier: "$rc_monthly",
    packageDisplayName: "Monthly Subscription",
    prices: [{ amount_micros: 27_000_000, currency: "USD" }],
  },
  {
    productIdentifier: "prayerpoint_annual_usd",
    playStoreProductIdentifier: "prayerpoint_annual_usd:annual",
    displayName: "Prayer Point Annual (USD)",
    userFacingTitle: "Annual",
    duration: "P1Y",
    packageIdentifier: "$rc_annual",
    packageDisplayName: "Annual Subscription",
    prices: [{ amount_micros: 70_000_000, currency: "USD" }],
  },
];

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  // Project
  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });
  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({
      client,
      body: { name: PROJECT_NAME },
    });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  // Apps
  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsError || !apps || apps.items.length === 0) {
    throw new Error("No apps found");
  }

  let testStoreApp: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!testStoreApp) throw new Error("No test store app found");
  console.log("Test Store app found:", testStoreApp.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: APP_STORE_APP_NAME,
        type: "app_store",
        app_store: { bundle_id: APP_STORE_BUNDLE_ID },
      },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app found:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: PLAY_STORE_APP_NAME,
        type: "play_store",
        play_store: { package_name: PLAY_STORE_PACKAGE_NAME },
      },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app found:", playStoreApp.id);
  }

  // Existing products
  const { data: existingProducts, error: listProductsError } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });
  if (listProductsError) throw new Error("Failed to list products");

  const ensureProductForApp = async (
    targetApp: App,
    label: string,
    productIdentifier: string,
    isTestStore: boolean,
    tier: TierDefinition,
  ): Promise<Product> => {
    const existing = existingProducts.items?.find(
      (p) => p.store_identifier === productIdentifier && p.app_id === targetApp.id,
    );
    if (existing) {
      console.log(label + " product already exists:", existing.id);
      return existing;
    }
    const body: CreateProductData["body"] = {
      store_identifier: productIdentifier,
      app_id: targetApp.id,
      type: "subscription",
      display_name: tier.displayName,
    };
    if (isTestStore) {
      body.subscription = { duration: tier.duration };
      body.title = tier.userFacingTitle;
    }
    const { data: created, error } = await createProduct({
      client,
      path: { project_id: project.id },
      body,
    });
    if (error) {
      console.error("Error detail:", JSON.stringify(error, null, 2));
      throw new Error("Failed to create " + label + " product");
    }
    console.log("Created " + label + " product:", created.id);
    return created;
  };

  // Build all products and collect them per tier
  const tierProducts: { tier: TierDefinition; testStore: Product; appStore: Product; playStore: Product }[] = [];

  for (const tier of TIERS) {
    const testStoreProduct = await ensureProductForApp(
      testStoreApp,
      `Test Store [${tier.userFacingTitle}]`,
      tier.productIdentifier,
      true,
      tier,
    );
    const appStoreProduct = await ensureProductForApp(
      appStoreApp,
      `App Store [${tier.userFacingTitle}]`,
      tier.productIdentifier,
      false,
      tier,
    );
    const playStoreProduct = await ensureProductForApp(
      playStoreApp,
      `Play Store [${tier.userFacingTitle}]`,
      tier.playStoreProductIdentifier,
      false,
      tier,
    );

    // Test store prices
    console.log(`Adding test store prices for ${tier.userFacingTitle}:`, JSON.stringify(tier.prices));
    const { error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testStoreProduct.id },
      body: { prices: tier.prices },
    });
    if (priceError) {
      if (
        priceError &&
        typeof priceError === "object" &&
        "type" in priceError &&
        (priceError as any)["type"] === "resource_already_exists"
      ) {
        console.log("Test store prices already exist for " + tier.userFacingTitle);
      } else {
        throw new Error("Failed to add test store prices for " + tier.userFacingTitle);
      }
    } else {
      console.log("Added test store prices for " + tier.userFacingTitle);
    }

    tierProducts.push({ tier, testStore: testStoreProduct, appStore: appStoreProduct, playStore: playStoreProduct });
  }

  // Entitlement
  let entitlement: Entitlement;
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntitlementsError) throw new Error("Failed to list entitlements");

  const existingEntitlement = existingEntitlements.items?.find(
    (e) => e.lookup_key === ENTITLEMENT_IDENTIFIER,
  );
  if (existingEntitlement) {
    console.log("Entitlement already exists:", existingEntitlement.id);
    entitlement = existingEntitlement;
  } else {
    const { data: newEntitlement, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: {
        lookup_key: ENTITLEMENT_IDENTIFIER,
        display_name: ENTITLEMENT_DISPLAY_NAME,
      },
    });
    if (error) throw new Error("Failed to create entitlement");
    console.log("Created entitlement:", newEntitlement.id);
    entitlement = newEntitlement;
  }

  const allProductIds = tierProducts.flatMap((tp) => [tp.testStore.id, tp.appStore.id, tp.playStore.id]);
  const { error: attachEntitlementError } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: entitlement.id },
    body: { product_ids: allProductIds },
  });
  if (attachEntitlementError) {
    if ((attachEntitlementError as any).type === "unprocessable_entity_error") {
      console.log("Some products already attached to entitlement");
    } else {
      throw new Error("Failed to attach products to entitlement");
    }
  } else {
    console.log("Attached all products to entitlement");
  }

  // Offering
  let offering: Offering;
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOfferingsError) throw new Error("Failed to list offerings");

  const existingOffering = existingOfferings.items?.find((o) => o.lookup_key === OFFERING_IDENTIFIER);
  if (existingOffering) {
    console.log("Offering already exists:", existingOffering.id);
    offering = existingOffering;
  } else {
    const { data: newOffering, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: {
        lookup_key: OFFERING_IDENTIFIER,
        display_name: OFFERING_DISPLAY_NAME,
      },
    });
    if (error) throw new Error("Failed to create offering");
    console.log("Created offering:", newOffering.id);
    offering = newOffering;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Set offering as current");
  }

  // Packages (one per tier)
  const { data: existingPackages, error: listPackagesError } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 20 },
  });
  if (listPackagesError) throw new Error("Failed to list packages");

  for (const tp of tierProducts) {
    let pkg: Package;
    const existingPackage = existingPackages.items?.find((p) => p.lookup_key === tp.tier.packageIdentifier);
    if (existingPackage) {
      console.log(`Package ${tp.tier.packageIdentifier} exists:`, existingPackage.id);
      pkg = existingPackage;
    } else {
      const { data: newPackage, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: {
          lookup_key: tp.tier.packageIdentifier,
          display_name: tp.tier.packageDisplayName,
        },
      });
      if (error) throw new Error("Failed to create package " + tp.tier.packageIdentifier);
      console.log("Created package:", newPackage.id);
      pkg = newPackage;
    }

    const { error: attachPackageError } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: [
          { product_id: tp.testStore.id, eligibility_criteria: "all" },
          { product_id: tp.appStore.id, eligibility_criteria: "all" },
          { product_id: tp.playStore.id, eligibility_criteria: "all" },
        ],
      },
    });
    if (attachPackageError) {
      if (
        (attachPackageError as any).type === "unprocessable_entity_error" &&
        (attachPackageError as any).message?.includes("Cannot attach product")
      ) {
        console.log("Skipping attach: package " + tp.tier.packageIdentifier + " already has incompatible product");
      } else {
        throw new Error("Failed to attach products to package " + tp.tier.packageIdentifier);
      }
    } else {
      console.log("Attached products to package " + tp.tier.packageIdentifier);
    }
  }

  // API keys
  const { data: testStoreApiKeys, error: testStoreApiKeysError } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: testStoreApp.id },
  });
  if (testStoreApiKeysError) throw new Error("Failed to list test store API keys");

  const { data: appStoreApiKeys, error: appStoreApiKeysError } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: appStoreApp.id },
  });
  if (appStoreApiKeysError) throw new Error("Failed to list app store API keys");

  const { data: playStoreApiKeys, error: playStoreApiKeysError } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: playStoreApp.id },
  });
  if (playStoreApiKeysError) throw new Error("Failed to list play store API keys");

  console.log("\n====================");
  console.log("RevenueCat setup complete!");
  console.log("REVENUECAT_PROJECT_ID:", project.id);
  console.log("REVENUECAT_TEST_STORE_APP_ID:", testStoreApp.id);
  console.log("REVENUECAT_APPLE_APP_STORE_APP_ID:", appStoreApp.id);
  console.log("REVENUECAT_GOOGLE_PLAY_STORE_APP_ID:", playStoreApp.id);
  console.log("Entitlement Identifier:", ENTITLEMENT_IDENTIFIER);
  console.log("EXPO_PUBLIC_REVENUECAT_TEST_API_KEY:", testStoreApiKeys?.items.map((i) => i.key).join(", ") ?? "N/A");
  console.log("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:", appStoreApiKeys?.items.map((i) => i.key).join(", ") ?? "N/A");
  console.log("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:", playStoreApiKeys?.items.map((i) => i.key).join(", ") ?? "N/A");
  console.log("====================\n");
}

seedRevenueCat().catch((err) => {
  console.error(err);
  process.exit(1);
});
