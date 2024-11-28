import { UserDto } from "src/usuarios/entity/userDto"

export interface Metadata {
    totalPages: number
    totalItems: number
    itemsPerPage: number
    currentPage: number
    searchTerm: string
    nextPage: number | null
};

export interface PaginatedUser {
    metadata: Metadata
    rows: UserDto[]
}