import { RoleEnum } from "src/commen/enums/user.enum";


export const endPoint = {
    create: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    findAll: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    update: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    restore: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    freeze: [RoleEnum.Admin, RoleEnum.SuperAdmin],
    delete: [RoleEnum.SuperAdmin],
    findAllArchives: [RoleEnum.Admin, RoleEnum.SuperAdmin],
}