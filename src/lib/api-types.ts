/** Shared shapes of the Revenew REST API. */

/**
 * A decimal (money, quantities): a string like "6.00" from Pydantic
 * responses, a number from endpoints that build their JSON by hand. Wrap it
 * in `Number()` before comparing or adding.
 */
export type Decimal = number | string;

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
  };
}
