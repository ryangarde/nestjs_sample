type RequiredExcept<T, TRequired extends keyof T = keyof T> = Required<Pick<T, TRequired>> & Partial<Pick<T, Exclude<keyof T, TRequired>>>;
