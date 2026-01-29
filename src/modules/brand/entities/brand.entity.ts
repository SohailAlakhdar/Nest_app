import { IBrand } from "src/commen/interfaces/brand.interface";

/**
 * use wit successResponse
 * that will return to frontend
 */

export class BrandResponse {
    brand: IBrand
}
export class FindAllResponse {
    brands: {
        totalDocs: number | undefined;
        totalPages: number | undefined;
        page: number;
        size: number;
        docs: IBrand[];
    }
}
