const APIFeatures = require('@utilities/apiFeatures');
const RuntimeError = require('@utilities/runtimeError');
const { catchAsync, filterObject, checkIfSlugOrId } = require('@utilities/runtime');

module.exports = class HandlerFactory{
    constructor({ model, fields = [] }){
        this.model = model;
        this.fields = fields;
    };

    deleteOne = () => catchAsync(async (req, res, next) => {
        const databaseRecord = await this.model.findOneAndDelete(checkIfSlugOrId(req.params.id));
        if(!databaseRecord)
            return next(new RuntimeError('Core::DeleteOne::RecordNotFound', 404));
        res.status(204).json({
            status: 'success',
            data: databaseRecord
        });
    });

    updateOne = () => catchAsync(async (req, res, next) => {
        const queryFilter = filterObject(req.body, ...this.fields)
        const databaseRecord = await this.model.findOneAndUpdate(checkIfSlugOrId(req.params.id),
            queryFilter, { new: true, runValidators: true });
        if(!databaseRecord)
            return next(new RuntimeError('Core::UpdateOne::RecordNotFound', 404));
        res.status(200).json({
            status: 'success',
            data: databaseRecord
        });
    });

    createOne = () => catchAsync(async (req, res) => {
        const queryFilter = filterObject(req.body, ...this.fields);
        const databaseRecord = await this.model.create(queryFilter);
        res.status(201).json({
            status: 'success',
            data: databaseRecord
        });
    });

    getPopulateFromRequest = (requestQuery) => {
        if(!requestQuery?.populate)
            return null;
        const isObject = requestQuery.populate.startsWith('{') && requestQuery.populate.endsWith('}');
        const populate = (isObject) ? JSON.parse(requestQuery.populate) : requestQuery.populate.split(',').join(' ');
        return populate;
    };

    getAll = () => catchAsync(async (req, res) => {
        const populate = this.getPopulateFromRequest(req.query);
        const operations = (await new APIFeatures({
            requestQueryString: req.query,
            model: this.model,
            populate
        }).paginate());
        operations.filter().sort().limitFields().search();
        const { records, skippedResults, totalResults, page, limit, totalPages } = await operations.perform();
        res.status(200).json({
            status: 'success',
            page: {
                current: page,
                total: totalPages
            },
            results: {
                skipped: skippedResults,
                total: totalResults,
                paginated: limit
            },
            data: records
        });
    });

    getOne = () => catchAsync(async (req, res, next) => {
        const populate = this.getPopulateFromRequest(req.query);
        let databaseRecord = this.model.findOne(checkIfSlugOrId(req.params.id));
        if(populate)
            databaseRecord = databaseRecord.populate(populate);
        databaseRecord = await databaseRecord;
        if(!databaseRecord)
            return next(new RuntimeError('Core::GetOne::RecordNotFound', 404));
        res.status(200).json({
            status: 'success',
            data: databaseRecord
        });
    });
};