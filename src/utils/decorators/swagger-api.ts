import { ExecutionContext, applyDecorators, createParamDecorator } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { TableConfig } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

type SwaggerApiProps = {
	schema: PgTable<TableConfig>;
	action?: 'create' | 'update';
};

export const SwaggerApi = ({ schema, action }: SwaggerApiProps) => {
	const properties = {};
	const actionProperties = {};

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
			};
		}

		if (!['$inferInsert', '$inferSelect', '_', 'getSQL'].includes(key)) {
			properties[schema[key].name] = {
				type: (() => {
					if (schema[key].dataType === 'date') {
						return 'string';
					} else {
						return schema[key].dataType;
					}
				})(),
			};
		}
	});

	return applyDecorators(
		ApiBody({
			schema: {
				type: 'object',
				properties: actionProperties,
			},
		}),
		(action === 'create' ? ApiCreatedResponse : ApiOkResponse)({
			schema: {
				type: 'object',
				properties: {
					response: {
						type: 'object',
						properties,
					},
					message: {
						type: 'string',
						example: 'Successfully created',
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
		})
	);
};
