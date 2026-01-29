import { CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PipelineStage, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, SortOrder, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";
/*
aggregate
bulkWrite
count
countDocuments
createCollection
deleteOne
deleteMany
estimatedDocumentCount
find
findOne
findOneAndDelete
findOneAndReplace
findOneAndUpdate
init
insertMany
replaceOne
save
update
updateOne
updateMany
validate
*/
//
export type Lean<T> = FlattenMaps<T>;
export abstract class DatabaseRepository<TRowDocument, TDocument = HydratedDocument<TRowDocument>> {
    constructor(protected readonly model: Model<TDocument>) { }
    // FIND
    async find({
        filter = {},
        select,
        options = {},
    }: {
        filter?: RootFilterQuery<TRowDocument>;
        select?: ProjectionType<TRowDocument> | undefined;
        options?:
        | (QueryOptions<TDocument> & {
            populate?: PopulateOptions[];
            skip?: number;
            limit?: number;
            sort?: Record<string, SortOrder>;
            lean?: boolean;
            cursor?: any;
        })
        | null;
    }): Promise<TDocument[] | [] | Lean<TDocument>[]> {
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            dec.lean(options.lean);
        }
        if (options?.skip) {
            dec.skip(options.skip);
        }
        if (options?.limit) {
            dec.limit(options.limit);
        }
        if (options?.sort) {
            dec.sort(options.sort);
        }
        return dec.exec();
    }
    // PAGINATE
    async paginate({
        filter,
        select,
        options = {},
        page = 'all',
        size = 5,
    }: {
        filter: RootFilterQuery<TRowDocument>;
        select?: ProjectionType<TRowDocument> | undefined;
        options?: (QueryOptions<TDocument> & {
            populate?: PopulateOptions[];
            skip?: number;
            limit?: number;
            sort?: Record<string, SortOrder>;
            lean?: boolean;
        });
        page?: number | 'all';
        size?: number;
    }): Promise<{
        totalDocs: number | undefined;
        totalPages: number | undefined;
        page: number;
        size: number;
        docs: TDocument[] | Lean<TDocument>[];
    }> {
        let totalPages: number | undefined = undefined
        let totalDocs: number | undefined = undefined
        if (page !== "all") {
            console.log({ page, size });
            page = Math.floor(!page || page < 1 ? 1 : page);
            options.limit = Math.floor(size < 1 || !size ? 5 : size);
            options.skip = (page - 1) * options.limit;
            totalDocs = await this.model.countDocuments(filter)
            totalPages = Math.ceil(totalDocs / options.limit)
        }
        let docs = await this.find({ filter, select, options })
        return {
            totalDocs,
            totalPages,
            page: page === "all" ? 1 : page,
            size,
            docs,
        };
    }
    // FIND_ONE
    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TRowDocument>;
        select?: ProjectionType<TRowDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | null | Lean<TDocument>> {
        const dec = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            dec.lean();
        }

        return dec.exec();
    }
    // CREATE
    async create({
        data,
        options,
    }: {
        data: Partial<TRowDocument>[];
        options?: CreateOptions;
    }): Promise<TDocument[]> {
        return await this.model.create(data || [], options);
    }
    // Insert_Many
    async insertMany({
        data,
    }: {
        data: Partial<TRowDocument>[];
    }): Promise<TDocument[]> {
        return (await this.model.insertMany(
            data
        )) as TDocument[];
    }
    // UPDATE_ONE
    async updateOne({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TRowDocument>;
        update: UpdateQuery<TDocument>;
        // options?: QueryOptions<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<UpdateWriteOpResult> {
        // console.log({ ...update });
        // console.log({ update });
        if (Array.isArray(update)) {
            return await this.model.updateOne(filter || {}, update, options);
        }
        return await this.model.updateOne(
            filter || {},
            { ...update, $inc: { __v: 1 } },
            options
        );
    }
    // FIND_ONE_AND_UPDATE
    async findOneAndUpdate({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TRowDocument>;
        update: UpdateQuery<TDocument> | PipelineStage[];
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null> {
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: ['$__v', 1] },
                }
            })
            return await this.model.findOneAndUpdate(filter || {}, update, {
                new: true,
                runValidators: true,
                options,
            },);
        }
        return await this.model.findOneAndUpdate(
            filter,
            {
                ...update,
                $inc: {
                    __v: 1,
                }
            },
            {
                new: true,
                runValidators: true,
                ...options,
            },
        );
    }
    // FIND_ONE_AND_DELETE
    async findOneAndDelete({
        filter,
    }: {
        filter: RootFilterQuery<TRowDocument>;
    }): Promise<TDocument | Lean<TDocument> | null> {
        return await this.model.findByIdAndDelete(
            filter || {},
        );
    }
    // FIDN_BY_ID_AND_UPDATE
    async findByIdAndUpdate({
        id,
        update,
        options = { new: true },
    }: {
        id: Types.ObjectId;
        update: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { ...update, $inc: { __v: 1 } },
            options
        );
    }
    // DELETE_ONE
    async deleteOne({
        filter,
    }: {
        filter: RootFilterQuery<TRowDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }
    // DELETE_MANY
    async deleteMany({
        filter,
    }: {
        filter: RootFilterQuery<TRowDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }
}