import api from "../api/axios";
import {
  cacheScanEvent,
  cacheScanEvents,
  getCachedScanEvents,
  getDeviceId,
  getQueuedScans,
  queueScan,
  removeQueuedScan,
  type ScanEvent,
} from "./storage";

export const extractLookupValue = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/\/verify\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : trimmed;
};

const eventId = () => `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const verifyAndAuditScan = async (value: string) => {
  const payload = {
    value: extractLookupValue(value),
    clientEventId: eventId(),
    deviceId: await getDeviceId(),
    networkStatus: "ONLINE" as const,
    scannedAt: new Date().toISOString(),
  };
  const response = await api.post("/scans/verify", payload);
  const scanEvent: ScanEvent = {...response.data.scanEvent, product: response.data.product};
  await cacheScanEvent(scanEvent);
  return {product: response.data.product, scanEvent};
};

export const saveOfflineScan = async (value: string, product: any) => {
  const clientEventId = eventId();
  const scannedAt = new Date().toISOString();
  const deviceId = await getDeviceId();
  await queueScan({value: extractLookupValue(value), clientEventId, deviceId, networkStatus: "OFFLINE_SYNC", scannedAt});
  await cacheScanEvent({
    id: clientEventId,
    clientEventId,
    result: "VERIFIED",
    isSuspicious: false,
    networkStatus: "OFFLINE_SYNC",
    scannedAt,
    product,
  });
};

export const syncQueuedScans = async () => {
  const queued = await getQueuedScans();
  for (const scan of queued) {
    try {
      const response = await api.post("/scans/verify", scan);
      await cacheScanEvent({...response.data.scanEvent, product: response.data.product});
      await removeQueuedScan(scan.clientEventId);
    } catch (error: any) {
      if (error.response) await removeQueuedScan(scan.clientEventId);
      else break;
    }
  }
};

export const loadScanHistory = async () => {
  const cached = await getCachedScanEvents();
  try {
    await syncQueuedScans();
    const response = await api.get("/scans?limit=100");
    const events = response.data.scanEvents as ScanEvent[];
    await cacheScanEvents(events);
    return {events, suspiciousCount: response.data.suspiciousCount as number, isOffline: false};
  } catch {
    return {events: cached, suspiciousCount: cached.filter(event => event.isSuspicious).length, isOffline: true};
  }
};
