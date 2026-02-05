import { RoleEnum } from "src/commen/enums/user.enum";

export const endPoint = {
    create: [RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.User],
    get: [RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.User],
    update: [RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.User],
    restore: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    freeze: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    delete: [RoleEnum.SuperAdmin],
}