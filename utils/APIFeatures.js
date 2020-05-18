class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Tour.find()
    this.queryString = queryString; // req.query
  }

  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ["sort", "limit", "page", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(lte|gt|lt|gte)\b/g, (m) => `$${m}`);
    queryObj = JSON.parse(queryObj);

    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort.split(",").join(" "));
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const pagesToSkip = (page - 1) * limit;
    this.query = this.query.skip(pagesToSkip).limit(limit);

    return this;
  }

  count() {
    this.query.count();
    return this;
  }
}

module.exports = APIFeatures;
