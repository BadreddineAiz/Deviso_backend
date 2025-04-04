class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        let queryObj = { ...this.queryString };

        const queryStr = JSON.stringify(queryObj)
            .replace(/\b(gt|gte|lt|lte|eq|ne)\b"/g, (match) => `$${match}`)
            .replace('cont', '$regex');

        queryObj = JSON.parse(queryStr);

        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach((el) => delete queryObj[el]);

        Object.keys(queryObj).forEach((key) => {
            if (queryObj[key].$regex) {
                queryObj[key] = {
                    $regex: `${queryObj[key].$regex}`,
                    $options: 'i',
                }; // Add case-insensitivity
            }
        });

        this.query.find(queryObj);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.query.sort(this.queryString.sort.replace(',', ' '));
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields;
            this.query.select(fields.replace(',', ' '));
        } else {
            this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const limit = this.queryString.limit * 1 || 100;
        const page = this.queryString.page * 1 || 1;
        const skip = (page - 1) * limit;

        this.query.skip(skip).limit(limit);
        return this;
    }
}

export default ApiFeatures;
