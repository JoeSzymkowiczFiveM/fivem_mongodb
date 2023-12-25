const { ObjectId } = require("mongodb");

const exportDocument = (document) => {
    if (document?._id && typeof document?._id !== "string") {
        document._id = document._id.toString();
    }
    return document;
};

const exportDocuments = (documents) => {
    if (!Array.isArray(documents)) return;
    return documents.map((document => exportDocument(document)));
};

const safeObjectArgument = (object) => {
    if (!object) return {};
    if (Array.isArray(object)) {
        if (object.length === 0) return {};
        return object;
    }
    if (typeof object !== "object") return {};
    if (object._id) object._id = new ObjectId(object._id);
    return object;
};

const bulkWriteResultsParser = (results) => {
    if (results.insertedCount) {
        results.insertedIds = Object.values(results.insertedIds).map((id) => id.toString());
    }
    if (results.upsertedCount) {
        results.upsertedIds = Object.values(results.upsertedIds).map((id) => id.toString());
    }
    return results;
};

module.exports = {
    exportDocument,
    exportDocuments,
    safeObjectArgument,
    bulkWriteResultsParser,
}