import { HttpException } from '@nestjs/common';

type StatusType = 'SE' | 'OK' | 'NDF' | 'VE';

export class CustomException extends HttpException {
	result_status: StatusType;

	constructor(payload: any, status: HttpException['status'], options?: HttpException['options']) {
		super(payload, status, options);
		if (payload?.message) {
			this.message = payload.message;
		}
		this.result_status = payload.result_status;
		this.name = undefined;
	}
}

type ApiResponseProps = {
	data?: any;
	status?: number;
	statusType?: StatusType;
	error?: any;
	message?: string;
};

type ReturnType<T> = {
	response: T;
	message: string;
	result_status: StatusType;
	status: number;
};

// export function apiResponse(response, status: StatusType = 'SE', message?: any): any {
export function apiResponse<T = any>({ data, status = 200, statusType = 'OK', error, message }: ApiResponseProps): ReturnType<T> {
	let messageStr = message;

	if (status >= 500) {
		statusType = 'SE';
	}

	if (status === 404) {
		statusType = 'NDF';
	}

	if (error instanceof TypeError || (error instanceof Error && !(error instanceof CustomException))) {
		statusType = 'SE';
	}

	if (statusType === 'NDF') {
		messageStr = 'No data found';
	} else if (statusType === 'OK') {
		messageStr = message ?? 'Success';
	} else if (statusType === 'SE') {
		messageStr = 'Please contact system admin.';
	}

	if (Array.isArray(data) && data.length === 0) {
		statusType = 'NDF';
		messageStr = 'No data found';
	}

	if (error instanceof TypeError || (error instanceof Error && !(error instanceof CustomException))) {
		status = 500;
	} else if (error) {
		status = error?.status ?? 500;
		messageStr = error?.message;
	}

	if (error?.statusCode == 413) {
		messageStr = 'File too large';
	}

	if (data === 1) {
		data = null;
	}

	if (error || status >= 400) {
		const exp = new CustomException(
			{
				result_status: error?.result_status || statusType,
				status: error?.status || status,
				message: messageStr,
			},
			status
			// { cause: error?.message || messageStr }
		);

		throw exp as any;
	} else {
		return {
			response: data,
			message: messageStr,
			result_status: statusType,
			status,
		};
	}
}
