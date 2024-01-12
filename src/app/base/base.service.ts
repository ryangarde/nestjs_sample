import { db } from '@/db';
import { User, posts } from '@/db/schema';
import { getFileUrl, getFullName, pascalToTitleCase, slugifyWithDateTime } from '@/utils/common/string';
import { apiResponse } from '@/utils/helpers/api-response';
import { Injectable } from '@nestjs/common';
import { TableConfig, sql, eq, and, like, or, isNull } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { Request } from 'express';

type DBType = typeof db;
type DBQueryType = DBType['query'];
type FindFirstType<K extends keyof DBQueryType = keyof DBQueryType> = Parameters<DBType['query'][K]['findFirst']>[0];
type FindManyType<K extends keyof DBQueryType = keyof DBQueryType> = Parameters<DBType['query'][K]['findMany']>[0];

type IndexProps<K extends keyof DBQueryType = keyof DBQueryType> = {
	req: Request;
	// dbName: keyof typeof db.query;
	dbName: keyof DBQueryType;
	schema: PgTable<TableConfig>;
	query?: FindManyType<K>;
};

type CreateProps = {
	// query?: any;
	// items?: PgTable<TableConfig>;
	// user?: User;
	// body?: any;
	// file?: Express.Multer.File;
	// files?: Express.Multer.File[];
	req: Request;
	schema: PgTable<TableConfig>;
};

type PaginationProps = {
	page_data_count?: number;
	page_limit: number;
	page_number_current: number;
	page_total?: number;
	total_data: number;
	total_pages: number;
};

export type PaginatedData<I = any> = {
	// data: I[];
	data: I[];
	pagination?: PaginationProps;
};

@Injectable()
export class BaseService {
	// dbName: keyof typeof db.query = null;
	// dbSchema: T = null;

	// constructor(
	// 	model?: keyof typeof db.query | T
	// 	//  dbList?: PgTable<TableConfig>
	// ) {
	// 	if (typeof model === 'string') {
	// 		this.dbName = model;
	// 	} else {
	// 		this.dbSchema = model;
	// 	}
	// }

	async index<I = any, K extends keyof DBQueryType = keyof DBQueryType>({
		req,
		dbName,
		query,
		schema,
	}: IndexProps<K>): Promise<I[] | PaginatedData<I>> {
		let model = db.query[dbName as any];

		const where = query?.where;

		const page = +req.query.page;
		const limit = +req.query.limit;
		const search = req.query.search ? req.query.search : null;
		const active = req.query.active === 'true' ? true : false;
		// const include = req.query.include ? `[${req.query.include.join(',')}]` : null;

		const searchColumns = [];

		Object.keys(schema).forEach((key) => {
			if (
				![
					'$inferInsert',
					'$inferSelect',
					'_',
					'getSQL',
					'id',
					// 'deleted_datetime',
					// 'created_datetime',
					// 'updated_datetime',
					'is_active',
				].includes(key) &&
				!key.includes('datetime')
			) {
				searchColumns.push(like(schema[key], '%' + search + '%'));
			}
		});

		if (page) {
			const data = await model.findMany({
				offset: (page - 1) * (limit || 10),
				limit: limit || 10,
				extras: {
					total_count: sql`COUNT(*) OVER()`.as('total_count'),
				},
				...query,
				where: (items, queryOptions) =>
					and(
						!!search ? or(...searchColumns) : undefined,
						(schema as any).deleted_datetime ? isNull((schema as any).deleted_datetime) : undefined,
						(schema as any).is_active && active ? eq((schema as any).is_active, true) : undefined,
						where instanceof Function ? where(items, queryOptions) : where
					),
				// where: (items, { isNull }) => isNull(items.deleted_datetime),
			});

			return {
				data,
				pagination: {
					total_data: data.length > 0 ? +data[0].total_count : 0,
					page_limit: limit || 10,
					page_number_current: page,
					total_pages: Math.ceil(data.length > 0 ? +data[0].total_count / (limit || 10) : 0),
				},
			};
		} else {
			const items = await model.findMany({
				...query,
				where: (items, queryOptions) =>
					and(
						!!search ? or(...searchColumns) : undefined,
						(schema as any).deleted_datetime ? isNull((schema as any).deleted_datetime) : undefined,
						(schema as any).is_active && active ? eq((schema as any).is_active, true) : undefined,
						where instanceof Function ? where(items, queryOptions) : where
					),
				// where: (items, { isNull }) => isNull(items.deleted_datetime),
			});
			return items;
		}
	}

	async create({ req, schema }: CreateProps) {
		const { query, user, body, file, files } = req || {};

		let item = undefined;
		const slugColumn = query?.slug as { column: string; target: string };
		let payload: any = {};

		let fullName = getFullName(user as User);

		if (Array.isArray(body)) {
			payload = body.map((item) => ({
				created_datetime: new Date(),
				updated_datetime: new Date(),
				created_by: fullName,
				updated_by: fullName,
				...item,
			}));
		} else {
			payload = {
				created_datetime: new Date(),
				updated_datetime: new Date(),
				created_by: fullName,
				updated_by: fullName,
				...body,
			};
		}

		if (slugColumn) {
			if (typeof slugColumn == 'string') {
				payload.slug = slugifyWithDateTime(body[slugColumn]);
			} else {
				payload[slugColumn.column] = slugifyWithDateTime(body[slugColumn.target]);
			}
		}

		Object.keys(payload).forEach((property) => {
			if (payload[property] === 'true') {
				payload[property] = 1;
			} else if (payload[property] === 'false') {
				payload[property] = 0;
			}
		});

		if (files) {
			Object.keys(files).forEach((fieldName) => {
				files[fieldName].forEach((file) => {
					payload[file.fieldname] = getFileUrl(req, file);
				});
			});
		} else if (file) {
			payload[file.fieldname] = getFileUrl(req, file);
		}

		item = (await db.insert(schema).values(payload).returning())?.[0];

		return item;
	}

	async show<K extends keyof DBQueryType = keyof DBQueryType>({
		req,
		dbName,
		query,
	}: {
		req: Request;
		dbName: keyof typeof db.query;
		query?: FindFirstType<K>;
	}) {
		let model = db.query[dbName as any];
		const id = req.params.id;

		let item;

		// if (include) {
		// 	model = model.withGraphFetched(include);
		// }
		const { where, ...options } = query || {};

		item = await model.findFirst({
			where: (items, queryOptions) => and(eq(items.id, id), where instanceof Function ? where(items, queryOptions) : where),
			...options,
		});

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}

	async update({ req, schema }: CreateProps & { schema: PgTable<TableConfig> }) {
		const { query, user, body, file, files } = req || {};
		const id = req.params.id;

		let item = undefined;
		const slugColumn = query?.slug as { column: string; target: string };
		let payload: any = {};

		let fullName = getFullName(user as User);

		if (Array.isArray(body)) {
			payload = body.map((item) => ({
				updated_datetime: new Date(),
				updated_by: fullName,
				...item,
			}));
		} else {
			payload = {
				updated_datetime: new Date(),
				updated_by: fullName,
				...body,
			};
		}

		if (slugColumn) {
			if (typeof slugColumn == 'string') {
				payload.slug = slugifyWithDateTime(body[slugColumn]);
			} else {
				payload[slugColumn.column] = slugifyWithDateTime(body[slugColumn.target]);
			}
		}

		Object.keys(payload).forEach((property) => {
			if (payload[property] === 'true') {
				payload[property] = 1;
			} else if (payload[property] === 'false') {
				payload[property] = 0;
			}
		});

		if (files) {
			Object.keys(files).forEach((fieldName) => {
				files[fieldName].forEach((file) => {
					payload[file.fieldname] = getFileUrl(req, file);
				});
			});
		} else if (file) {
			payload[file.fieldname] = getFileUrl(req, file);
		}

		item = (
			await db
				.update(schema)
				.set(payload)
				.where(eq((schema as any).id, id))
				.returning()
		)?.[0];

		// item = await db.update(categories).set(payload).where(eq(categories.id, id))

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}

	async delete({ schema, req }: { req: Request; schema: PgTable<TableConfig> }) {
		let fullName = getFullName(req.user as User);
		const id = req.params.id;

		let payload = {
			is_active: false,
			updated_by: fullName,
			deleted_datetime: new Date(),
		};

		const item = (
			await db
				.update(schema)
				.set(payload)
				.where(eq((schema as any).id, id))
				.returning()
		)?.[0];

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}

	async forceDelete({ id, schema }: { id: number; schema: PgTable<TableConfig> }) {
		const item = (
			await db
				.delete(schema)
				.where(eq((schema as any).id, id))
				.returning()
		)?.[0];

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}
}
