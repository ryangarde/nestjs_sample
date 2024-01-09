import { Controller, Delete, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { PgTable, TableConfig } from 'drizzle-orm/pg-core';

import { db } from '@/db';
import CurrentUser from '@/utils/decorators/user.decorator';
import { apiResponse } from '@/utils/helpers/api-response';
import { SwaggerApi } from '@/utils/decorators/swagger-api';

import { BaseService } from './base.service';

type DBType = typeof db;
type DBQueryType = DBType['query'];
type FindFirstType<K extends keyof DBQueryType = keyof DBQueryType> = Parameters<DBType['query'][K]['findFirst']>[0];

@Controller()
export class BaseController {
	constructor(
		private dbName?: keyof typeof db.query,
		private schema?: PgTable<TableConfig>
	) {}

	@Get()
	async index(@Query() query?, @CurrentUser() user?): Promise<any> {
		try {
			const baseService = new BaseService(this.dbName);

			const items = await baseService.index({ query });
			return apiResponse({ data: items });
		} catch (err) {
			console.error(err);
			return apiResponse({ error: err });
		}
	}

	// @SwaggerApi({ schema: (this as any).schema, action: 'create' })
	@Post()
	async create(@Request() req): Promise<any> {
		try {
			const baseService = new BaseService(this.schema);

			const item = await baseService.create({ req });
			return apiResponse({ data: item, message: 'Successfully created', status: 201 });
		} catch (err) {
			console.log(err);
			return apiResponse({ error: err });
		}
	}

	@Get(':id')
	async show<K extends keyof DBQueryType = keyof DBQueryType>(@Param('id') id, options?: FindFirstType<K>): Promise<any> {
		try {
			const baseService = new BaseService(this.dbName);

			const item = await baseService.show(id, options);

			return apiResponse({ data: item });
		} catch (err) {
			console.error(err);
			return apiResponse({ error: err });
		}
	}

	@Patch(':id')
	async update(@Param('id') id, @Request() req): Promise<any> {
		try {
			const baseService = new BaseService(this.schema);
			const item = await baseService.update({ id, req });

			return apiResponse({ data: item, message: 'Successfully updated' });
		} catch (err) {
			console.log(err);
			return apiResponse({ error: err });
		}
	}

	@Delete(':id')
	async delete(@Param('id') id, @CurrentUser() user): Promise<any> {
		try {
			const baseService = new BaseService(this.dbName);
			const item = await baseService.delete(id, user);

			return apiResponse({ data: item, message: 'Successfully deleted' });
		} catch (err) {
			console.error(err);
			if (err.code === 'P2025') {
				return apiResponse({ status: 404, message: 'Item not found' });
			}

			return apiResponse({ error: err });
		}
	}

	@Delete(':id/force')
	async forceDelete(@Param('id') id): Promise<any> {
		try {
			const baseService = new BaseService(this.dbName);
			const item = await baseService.forceDelete(id);

			return apiResponse({ data: item, message: 'Successfully deleted' });
		} catch (err) {
			console.error(err);
			if (err.code === 'P2025') {
				return apiResponse({ status: 404, message: 'Item not found' });
			}

			return apiResponse({ error: err });
		}
	}
}
