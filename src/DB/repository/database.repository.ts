import { CreateOptions, DeleteResult, FlattenMaps, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, SortOrder, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";
export type Lean<T> = FlattenMaps<T>;
export abstract class DatabaseRepository<TDocument> {
    constructor(protected readonly model: Model<TDocument>) {}

    // FIND
    async find({
        filter = {},
        select,
        options = {},
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
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
        options,
        page = 1,
        size = 5,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?: QueryOptions<TDocument> & {
            populate?: PopulateOptions[];
            sort?: Record<string, SortOrder>;
            lean?: boolean;
        };
        page?: number;
        size?: number;
    }): Promise<{
        docs: TDocument[] | Lean<TDocument>[];
        totalDocs: number;
        totalPages: number;
        page: number;
        size: number;
    }> {
        const skip = (page - 1) * size;
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate)
            dec.populate(options.populate as PopulateOptions[]);
        if (options?.lean) dec.lean(options.lean);
        if (options?.sort) dec.sort(options.sort);
        dec.skip(skip).limit(size);

        const [docs, totalDocs] = await Promise.all([
            dec.exec(),
            this.model.countDocuments(filter),
        ]);

        return {
            docs,
            totalDocs,
            totalPages: Math.ceil(totalDocs / size),
            page,
            size,
        };
    }
    // FINDONE
    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | null;
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
        data: Partial<TDocument>[];
        options?: CreateOptions;
    }): Promise<TDocument[]> {
        return await this.model.create(data || [], options) ;
    }

    // InsertMany
    async insertMany({
        data,
    }: {
        data: Partial<TDocument>[];
    }): Promise<TDocument[]> {
        return (await this.model.insertMany(
            data
        )) as TDocument[];
    }
    // UPDATEONE
    async updateOne({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TDocument>;
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
        filter: RootFilterQuery<TDocument>;
        update: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null> {
        return await this.model.findOneAndUpdate(
            filter,
            { ...update, $inc: { __v: 1 } },
            options
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
        filter: RootFilterQuery<TDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }
    // DELETE_MANY
    async deleteMany({
        filter,
    }: {
        filter: RootFilterQuery<TDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }
}