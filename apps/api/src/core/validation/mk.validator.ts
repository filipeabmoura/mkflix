export interface MkValidator<T> {
  validate(value: unknown): T;
}
