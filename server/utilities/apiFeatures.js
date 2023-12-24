class APIFeatures{
    constructor({ requestQueryString, model, populate = null }){
        this.model = model;
        this.requestQueryString = requestQueryString;
        this.populate = populate;

        this.buffer = {
            find: [],
            sort: {},
            select: '',
            skip: 0,
            limit: 0,
            totalResults: 0,
            skippedResults: 0,
            page: 1,
            totalPages: 1
        };
    };

    async perform(){
        const { find, sort, select, skip, limit, totalResults, skippedResults, page, totalPages } = this.buffer;
        const query = this.model.find(...find).skip(skip).limit(limit).sort(sort).select(select);
        if(this.populate !== null){
            query.populate(this.populate);
        }
        const records = await query;
        return { records, totalResults, skippedResults, page, limit, totalPages };
    };

    search(){
        if(this.requestQueryString.search){
            this.buffer.find.push(this.model.searchBuilder(this.requestQueryString.search));
        }
        return this;
    };

    filter(){
        const query = { ...this.requestQueryString };
        ['page', 'sort', 'limit', 'fields', 'populate'].forEach((element) => delete query[element]);
        const filter = JSON.parse(JSON.stringify(query).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`));
        this.buffer.find.push(filter);
        return this;
    };

    sort(){
        this.buffer.sort = (this.requestQueryString.sort)
            ? this.requestQueryString.sort.split(',').join(' ')
            : '-createdAt';
        return this;
    };

    limitFields(){
        if(this.requestQueryString.fields){
            this.buffer.select = this.requestQueryString.fields.split(',').join(' ');
        }
        return this;
    }

    async paginate(){
        if(this.requestQueryString.limit * 1 === -1)
            return this;
        const page = this.requestQueryString.page * 1 || 1;
        const limit = this.requestQueryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.buffer.skip = skip;
        this.buffer.limit = limit;
        const recordsCount = await this.model.countDocuments();
        this.buffer.totalResults = recordsCount;
        this.buffer.page = page;
        this.buffer.skippedResults = skip;
        this.buffer.totalPages = Math.ceil(recordsCount / limit);
        if(this.requestQueryString.page){
            if(skip >= recordsCount && recordsCount.length >= 1)
                throw new RuntimeError('Salumatix::Core::PageOutOfRange', 404);
        }
        return this;
    };
};

module.exports = APIFeatures;