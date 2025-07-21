class AssetService {
  /**
   * Finds an asset by serial number, or creates a new one if it doesn't exist.
   * This is the core of the service intake workflow.
   */
  async findOrCreateAsset(models, { assetData, customerId, branchId }, session) {
    const { Asset } = models;
    let asset = await Asset.findOne({ serialNumber: assetData.serialNumber }).session(session);

    if (asset) {
      // Optionally update owner if it was previously an internal asset
      asset.owner = { kind: "Customer", item: customerId };
      await asset.save({ session });
    } else {
      asset = (
        await Asset.create(
          [
            {
              ...assetData,
              owner: { kind: "Customer", item: customerId },
            },
          ],
          { session }
        )
      )[0];
    }
    return asset;
  }
}
module.exports = new AssetService();
