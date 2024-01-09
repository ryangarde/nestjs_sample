import { db } from '@/db';
import { User } from '@/db/schema';
import { getFileUrl, getFullName, pascalToTitleCase, slugifyWithDateTime } from '@/utils/common/string';
import { apiResponse } from '@/utils/helpers/api-response';
import { Injectable } from '@nestjs/common';
import { TableConfig, sql, eq } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { Request } from 'express';

type IndexProps = {
	query?: any;
	items?: keyof typeof db.query;
};

type CreateProps = {
	// query?: any;
	// items?: PgTable<TableConfig>;
	// user?: User;
	// body?: any;
	// file?: Express.Multer.File;
	// files?: Express.Multer.File[];
	req: Request;
	schema?: PgTable<TableConfig>;
};

type DBType = typeof db;
type DBQueryType = DBType['query'];
type FindFirstType<K extends keyof DBQueryType = keyof DBQueryType> = Parameters<DBType['query'][K]['findFirst']>[0];

@Injectable()
export class BaseService<T extends PgTable<TableConfig>> {
	model: keyof typeof db.query = null;
	dbSchema: T = null;

	constructor(
		model?: keyof typeof db.query | T
		//  dbList?: PgTable<TableConfig>
	) {
		if (typeof model === 'string') {
			this.model = model;
		} else {
			this.dbSchema = model;
		}
	}

	async index({ query, items }: IndexProps) {
		let model = db.query[items || (this.model as any)];
		// db.query.posts.findMany({
		// 	where: (items, { isNotNull }) => isNotNull(items.deleted_datetime),
		// })

		const page = +query.page;
		const limit = query.limit;
		const search = query.search ? JSON.parse(query.search) : null;
		const include = query.include ? `[${query.include.join(',')}]` : null;

		if (page) {
			const count = +(await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${this.model}`)))[0].count;
			const pagination = {
				total_data: count,
				page_limit: limit || 10,
				page_number_current: page,
				total_pages: Math.ceil(count / (limit || 10)),
			};

			const data = await model.findMany({
				offset: (page - 1) * page,
				limit: (page - 1) * page + (limit || 10),
				where: (items, { isNull }) => isNull(items.deleted_datetime),
			});

			return {
				data,
				pagination,
			};
		} else {
			const items = await model.findMany({
				where: (items, { isNull }) => isNull(items.deleted_datetime),
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

		item = (
			await db
				.insert(schema || this.dbSchema)
				.values(payload)
				.returning()
		)?.[0];

		return item;
	}

	async show<K extends keyof DBQueryType = keyof DBQueryType>(id: number, options?: FindFirstType<K>) {
		let model = db.query[this.model as any];

		let item;

		// if (include) {
		// 	model = model.withGraphFetched(include);
		// }
		const { where, ...optionsProp } = options || {};

		item = await model.findFirst({
			where: (items, { eq, and, ...props }) => and(eq(items.id, id), (where as any)?.(items, { eq, and, ...props })),
			...optionsProp,
		});

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}

	async update({ id, req, schema }: CreateProps & { id: number }) {
		const { query, user, body, file, files } = req || {};

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
				.update(schema || this.dbSchema)
				.set(payload)
				.where(eq((this.dbSchema as any).id, id))
				.returning()
		)?.[0];

		// item = await db.update(categories).set(payload).where(eq(categories.id, id))

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}

	async delete(id: number, user?: User) {
		let fullName = getFullName(user);

		let payload = {
			is_active: false,
			updated_by: fullName,
			deleted_datetime: new Date(),
		};

		const item = (
			await db
				.update(this.dbSchema)
				.set(payload)
				.where(eq((this.dbSchema as any).id, id))
				.returning()
		)?.[0];

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}

	async forceDelete(id: number) {
		const item = (
			await db
				.delete(this.dbSchema)
				.where(eq((this.dbSchema as any).id, id))
				.returning()
		)?.[0];

		if (!item) {
			const modelName = pascalToTitleCase(this.constructor.name.replace('Controller', ''));
			return apiResponse({ status: 404, message: `${modelName} not found` });
		}

		return item;
	}
}
