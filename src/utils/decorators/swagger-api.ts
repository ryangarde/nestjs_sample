import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { TableConfig } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

type SwaggerApiProps = {
	schema: PgTable<TableConfig>;
	action?: 'create' | 'update';
};

export const SwaggerApi = ({ schema, action }: SwaggerApiProps) => {
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
			};
		}

		if (!['$inferInsert', '$inferSelect', '_', 'getSQL'].includes(key)) {
			if (schema[key].notNull) {
				required.push(schema[key].name);
			}

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

	function customDecorator() {
		return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
			const originalValue = descriptor.value;

			descriptor.value = function (...args: any[]) {
				// "this" here will refer to the class instance
				console.log(this.constructor.name, 'asdad');

				return originalValue.apply(this, args);
			};
		};
	}

	return applyDecorators(
		customDecorator,
		ApiBody({
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
			status: action === 'create' ? 201 : 200,
		})
	);
};
