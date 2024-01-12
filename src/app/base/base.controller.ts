import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
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
	private dbName: keyof typeof db.query;
	private schema: PgTable<TableConfig>;

	constructor(options: { dbName?: keyof typeof db.query; schema?: PgTable<TableConfig> }) {
		this.dbName = options.dbName;
		this.schema = options.schema;
	}

	@Get()
	async index(@Request() req?, ...args: any[]): Promise<any> {
		try {
			const baseService = new BaseService();

			const items = await baseService.index({ req, dbName: this.dbName, schema: this.schema });
			return apiResponse({ data: items });
		} catch (err) {
			console.error(err);
			return apiResponse({ error: err });
		}
	}

	// @SwaggerApi({ schema: (this as any).schema, action: 'create' })
	@Post()
	async create(@Request() req, ...args: any[]): Promise<any> {
		try {
			const baseService = new BaseService();

			const item = await baseService.create({ req, schema: this.schema });
			return apiResponse({ data: item, message: 'Successfully created', status: 201 });
		} catch (err) {
			console.log(err);
			return apiResponse({ error: err });
		}
	}

	@Get(':id')
	async show<K extends keyof DBQueryType = keyof DBQueryType>(@Request() req, query?: FindFirstType<K>, ...args: any[]): Promise<any> {
		try {
			const baseService = new BaseService();

			const item = await baseService.show({ req, dbName: this.dbName, query });

			return apiResponse({ data: item });
		} catch (err) {
			console.error(err);
			return apiResponse({ error: err });
		}
	}

	@Patch(':id')
	async update(@Request() req, ...args: any[]): Promise<any> {
		try {
			const baseService = new BaseService();
			const item = await baseService.update({ req, schema: this.schema });

			return apiResponse({ data: item, message: 'Successfully updated' });
		} catch (err) {
			console.log(err);
			return apiResponse({ error: err });
		}
	}

	@Delete(':id')
	async delete(@Request() req, ...args: any[]): Promise<any> {
		try {
			const baseService = new BaseService();
			const item = await baseService.delete({ req, schema: this.schema });

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
	async forceDelete(@Param('id') id, ...args: any[]): Promise<any> {
		try {
			const baseService = new BaseService();
			const item = await baseService.forceDelete({ id, schema: this.schema });

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
