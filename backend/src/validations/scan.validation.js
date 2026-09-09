const {z} = require("zod");

const coordinate = (min, max) => z.number().finite().min(min).max(max).optional();

const scanSchema = z.object({
    value: z.string().trim().min(1).max(2048),
    clientEventId: z.string().trim().min(8).max(128).optional(),
    latitude: coordinate(-90, 90),
    longitude: coordinate(-180, 180),
    deviceId: z.string().trim().min(3).max(128).optional(),
    networkStatus: z.enum(["ONLINE", "OFFLINE_SYNC"]).default("ONLINE"),
    scannedAt: z.coerce.date().refine(
        value => value.getTime() <= Date.now() + 5 * 60 * 1000,
        "Scan time cannot be more than five minutes in the future",
    ).default(() => new Date()),
}).strict();

module.exports = {scanSchema};
