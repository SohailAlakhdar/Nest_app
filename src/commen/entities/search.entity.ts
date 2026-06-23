export class FindAllResponse<T = any> {
    results: {
        totalDocs: number | undefined;
        totalPages: number | undefined;
        page: number;
        size: number;
        docs: T[];
    }
}
