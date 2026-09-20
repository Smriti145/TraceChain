# Food & Spices rollout

The active catalog supports only Food & Beverage and Spices & Seasonings.
Creation and partial updates enforce these values. Product lists, details, QR/barcode
lookups and new journey checkpoints exclude other categories. Historical scan and
notification feeds remain audit records and may still mention old products.

No existing data is deleted or reclassified. Legacy GENERAL records need a reviewed
classification before they appear in the active catalog. Do not classify a non-food
product as food merely to make it visible.

The government-reference folder is research material, not an active seed or runtime
catalog. Its non-food records are not imported by this change.

## Deployment

1. Review and commit, run CI, and merge the pull request.
2. Deploy on Render. The configured start command runs prisma migrate deploy;
   the new migration changes the category default only.
3. Seeding is optional, not part of deployment. The seed now creates five fictional
   food/spice products. Review before running: it also updates demo accounts and
   replaces seeded trace/audit/notification data. It is not a production migration.
4. Rebuild and install the release APK. Existing APKs do not update with Render.
5. Test food/spice creation, stakeholder checkpoints and customer scans; confirm
   Electronics is rejected on create/update and old non-food QRs no longer verify.

Demo origins and journeys are simulated; no government certification is claimed.
