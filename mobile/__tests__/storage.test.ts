import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cacheNotifications,
  cacheVerifiedProduct,
  getCachedNotifications,
  getCachedProduct,
  markAllCachedNotificationsRead,
  markCachedNotificationRead,
} from "../src/services/storage";

jest.mock("@react-native-async-storage/async-storage", () => {
  const values = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => values.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        values.set(key, value);
      }),
      removeItem: jest.fn(async (key: string) => {
        values.delete(key);
      }),
      clear: jest.fn(async () => {
        values.clear();
      }),
    },
  };
});

describe("offline notification cache", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  const notifications = [
    {id: "n1", type: "PRODUCT_CREATED", severity: "SUCCESS", title: "Created", message: "Created product", readAt: null, createdAt: "2026-09-09T10:00:00.000Z"},
    {id: "n2", type: "JOURNEY_UPDATED", severity: "INFO", title: "Updated", message: "Updated journey", readAt: null, createdAt: "2026-09-09T09:00:00.000Z"},
  ];

  it("stores and marks one notification as read", async () => {
    await cacheNotifications(notifications);
    const updated = await markCachedNotificationRead("n1");
    expect(updated[0].readAt).toBeTruthy();
    expect(updated[1].readAt).toBeNull();
  });

  it("marks all cached notifications as read", async () => {
    await cacheNotifications(notifications);
    await markAllCachedNotificationsRead();
    expect((await getCachedNotifications()).every(item => item.readAt)).toBe(true);
  });
});

describe("offline product cache", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("retrieves a verified product by QR, product code, and batch", async () => {
    const product = {
      id: "product-1",
      qrCode: "qr-123",
      productCode: "CORN-01",
      barcode: "8901234500017",
      batchNumber: "FD-20260831-0001",
      productName: "Corn Flour",
    };

    await cacheVerifiedProduct("qr-123", product);

    expect((await getCachedProduct("QR-123"))?.product).toEqual(product);
    expect((await getCachedProduct("corn-01"))?.product).toEqual(product);
    expect((await getCachedProduct("8901234500017"))?.product).toEqual(product);
    expect((await getCachedProduct("fd-20260831-0001"))?.product).toEqual(product);
  });

  it("returns null when a product has never been cached", async () => {
    expect(await getCachedProduct("missing-product")).toBeNull();
  });
});
