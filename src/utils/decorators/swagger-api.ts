import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiResponse, ApiParam, ApiParamOptions, ApiBodyOptions } from '@nestjs/swagger';
import { TableConfig } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

type SwaggerApiProps = {
	schema: PgTable<TableConfig>;
	action?: 'create' | 'update' | 'list';
	params?: ApiParamOptions;
	body?: ApiBodyOptions;
};

export const SwaggerApi = ({ schema, action, params, body }: SwaggerApiProps) => {
	const properties = {};
	const actionProperties = {};
	const required = [];

	function getCondition(key: string) {
		let condition = true;

		if (!!action) {
			condition =
				condition && !['id', 'created_by', 'updated_by', 'deleted_datetime', 'created_datetime', 'updated_datetime'].includes(key);
		}

		if (action === 'create') {
			condition = condition && key !== 'is_active';
		}

		return condition;
	}

	Object.keys(schema).forEach((key) => {
		if (!['$inferInsert', '$inferSelect', '_', 'getSQL'].includes(key) && getCondition(key)) {
			actionProperties[schema[key].name] = {
				type: (() => {
					if (schema[key].dataType === 'date') {
						return 'string';
					} else {
						return schema[key].dataType;
					}
				})(),
				example: schema[key].name === 'id' ? 1 : undefined,
			};
		}

		if (!['$inferInsert', '$inferSelect', '_', 'getSQL'].includes(key)) {
			if (schema[key].notNull) {
				required.push(schema[key].name);
			}

			properties[schema[key].name] = {
				type: () => {
					if (schema[key].dataType === 'date') {
						return 'string';
					} else {
						return schema[key].dataType;
					}
				},
				example: schema[key].name === 'id' ? 1 : undefined,
			};
		}
	});

	const decorators = [
		['create', 'update'].includes(action) &&
			ApiBody({
				...body,
				schema: {
					type: 'object',
					properties: actionProperties,
				},
			}),
		ApiResponse({
			schema: {
				type: 'object',
				required,
				properties: {
					response:
						action === 'list'
							? {
									type: 'array',
									items: {
										type: 'object',
										properties,
									},
								}
							: {
									type: 'object',
									properties,
								},
					message: {
						type: 'string',
					},
					result_status: {
						type: 'string',
						example: 'OK',
					},
					status: {
						type: 'number',
						example: action === 'create' ? 201 : 200,
					},
				},
			},
			status: action === 'create' ? 201 : 200,
		}),
		!!params && ApiParam(params),
	].filter((v) => !!v);

	return applyDecorators(...decorators);
};
