import AsyncStorage from "@react-native-async-storage/async-storage";
import {cacheVerifiedProduct, getCachedProduct} from "../src/services/storage";

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
