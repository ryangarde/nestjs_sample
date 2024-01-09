import { User } from '@/db/schema';
import { Request } from 'express';

export function joinStrings(strings: Array<string | undefined>, seperator: string = ', ') {
	return strings.filter((v) => !!v).join(seperator);
}

export function getFullName(user?: User) {
	if (!user) return '';
	return joinStrings([user.first_name, user.middle_name, user.last_name, user.suffix], ' ');
}

interface GetFullAddressProps {
	StreetVillage?: string;
	Barangay?: string;
	TownCity?: string;
	Province?: string;
	Region?: string;
	Country?: string;
	Zipcode?: string;
}

export function getFullAddress(user?: GetFullAddressProps) {
	if (!user) return '';
	return [user?.StreetVillage, user?.Barangay, user?.TownCity, user?.Province, user?.Region, user?.Country, user?.Zipcode]
		.filter((v) => !!v)
		.join(', ');
}

export function slugify(str?: string) {
	if (!str) return '';
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
	var to = 'aaaaeeeeiiiioooouuuunc------';
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

	return str;
}

export function pascalToTitleCase(str?: string) {
	return str?.replace(/([A-Z])/g, ' $1').trim();
}

export function slugifyWithDateTime(str?: string) {
	const date = new Date();
	const day = ('0' + (date.getMonth() + 1)).slice(-2);
	const month = ('0' + date.getDate()).slice(-2);
	const year = (new Date().getFullYear() + '').slice(-2);
	const hours = ('0' + date.getHours()).slice(-2);
	const minutes = ('0' + date.getHours()).slice(-2);
	const seconds = ('0' + date.getSeconds()).slice(-2);

	const transformedDate = day + month + year + hours + minutes + seconds;

	return slugify(str) + '-' + transformedDate;
}

export function getServerUrl(req: Request) {
	return process.env.APP_HOST || req.protocol + '://' + req.get('host');
}

export function getFileUrl(req: Request, file: Express.Multer.File) {
	return getServerUrl(req) + file?.destination?.replace('public', '') + file?.filename;
}
