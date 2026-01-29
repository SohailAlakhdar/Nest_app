
/**
 * use wit successResponse
 * that will return to frontend
 */

import { ICategory } from "src/commen/interfaces/category.interface";

export class CategoryResponse {
    category: ICategory
}
export class FindAllResponse {
    categorys: {
        totalDocs: number | undefined;
        totalPages: number | undefined;
        page: number;
        size: number;
        docs: ICategory[];
    }
}
