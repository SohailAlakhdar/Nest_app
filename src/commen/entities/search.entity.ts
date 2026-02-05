export class FindAllResponse<T = any> {
    result: {
        totalDocs: number | undefined;
        totalPages: number | undefined;
        page: number;
        size: number;
        docs: T[];
    }
}
