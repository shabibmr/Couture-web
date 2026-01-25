import { Model, Optional, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from 'sequelize';

/**
 * Helper type to extract model attributes
 */
export type ModelAttributes<T> = {
    [K in keyof T]: T[K];
};

/**
 * Helper type for creation attributes (omits auto-generated fields)
 */
export type CreationAttributes<T> = Optional<
    ModelAttributes<T>,
    'id' | 'created_at' | 'updated_at'
>;

/**
 * Base interface for typed Sequelize models
 */
export interface TypedModel<TAttributes, TCreationAttributes = TAttributes>
    extends Model<TAttributes, TCreationAttributes> {
    // Sequelize automatically adds these, but TypeScript needs explicit declarations
    readonly id: string;
    readonly created_at?: Date;
    readonly updated_at?: Date;
}

/**
 * Extended Find Options with better typing
 */
export interface TypedFindOptions<T> extends Omit<FindOptions<T>, 'attributes'> {
    attributes?: (keyof T)[] | { exclude?: (keyof T)[]; include?: (keyof T)[] };
}

/**
 * Extended Create Options
 */
export interface TypedCreateOptions<T> extends CreateOptions<T> {
    // Add any custom options here
}

/**
 * Extended Update Options
 */
export interface TypedUpdateOptions<T> extends UpdateOptions<T> {
    // Add any custom options here
}

/**
 * Extended Destroy Options
 */
export interface TypedDestroyOptions extends DestroyOptions {
    // Add any custom options here
}

/**
 * Association helper types
 */
export type HasOne<T> = T | null;
export type HasMany<T> = T[];
export type BelongsTo<T> = T | null;
export type BelongsToMany<T> = T[];

/**
 * Type guard for checking if model has associations loaded
 */
export function hasAssociation<T extends Model, K extends keyof T>(
    model: T,
    key: K
): model is T & Required<Pick<T, K>> {
    return model[key] !== undefined && model[key] !== null;
}
