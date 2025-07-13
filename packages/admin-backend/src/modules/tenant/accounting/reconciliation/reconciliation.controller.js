const asyncHandler = require("../../../../middleware/asyncHandler");
const reconciliationService = require("../../../../services/reconciliation.service");

// exports.uploadStatement = asyncHandler(async (req, res, next) => {
//     if (!req.file) return res.status(400).json({ success: false, error: 'No statement file uploaded.' });

//     const statement = await reconciliationService.processStatementUpload(
//         req.models,
//         { fileBuffer: req.file.buffer, accountId: req.body.accountId, statementDate: req.body.statementDate },
//         req.user._id
//     );
//     res.status(201).json({ success: true, data: statement });
// });

exports.uploadStatement = asyncHandler(async (req, res, next) => {
  // --- THE DEFINITIVE FIX: Read the URL from the request body ---
  const { fileUrl, accountId, statementDate } = req.body;
  if (!fileUrl || !accountId || !statementDate) {
    return res
      .status(400)
      .json({ success: false, error: "fileUrl, accountId, and statementDate are required." });
  }

  const statement = await reconciliationService.processStatementUpload(
    req.models,
    { fileUrl, accountId, statementDate },
    req.user._id
  );
  res.status(201).json({ success: true, data: statement });
});

exports.getSuggestions = asyncHandler(async (req, res, next) => {
  const suggestions = await reconciliationService.suggestMatches(req.models, {
    statementId: req.params.statementId,
  });
  res.status(200).json({ success: true, data: suggestions });
});

exports.confirmMatch = asyncHandler(async (req, res, next) => {
  const reconciliation = await reconciliationService.confirmMatch(
    req.models,
    req.body,
    req.user._id
  );
  res.status(201).json({ success: true, data: reconciliation });
});
