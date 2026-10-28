function buildListQuery(req, searchableFields = []) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";
  const filter = {};

  if (req.query.q && searchableFields.length) {
    filter.$or = searchableFields.map((field) => ({
      [field]: { $regex: req.query.q, $options: "i" }
    }));
  }

  for (const [key, value] of Object.entries(req.query)) {
    if (["page", "limit", "sort", "q"].includes(key) || value === "") continue;
    if (value === "true") filter[key] = true;
    else if (value === "false") filter[key] = false;
    else filter[key] = value;
  }

  return { page, limit, skip, sort, filter };
}

module.exports = buildListQuery;
