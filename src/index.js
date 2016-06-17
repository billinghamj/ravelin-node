import jsonClient from 'json-client';

const millisPerSecond = 1000;
const eventNameRegex = /^[a-z0-9_-]*$/i;

type Options = {
	baseUrl: ?string;
	secretKey: string;
};

export default class Ravelin {
	_options: Options;
	_client: (method: string, path: string, params: {}|null, body: any|null) => Promise;

	constructor(options: Options) {
		this._options = {
			baseUrl: 'https://api.ravelin.com/v2/',
			...options,
		};

		this._client = jsonClient(this._options.baseUrl, {
			headers: { authorization: `token ${this._options.secretKey}` },
		});
	}

	async sendEvent(name: string, params: {}): Promise<void> {
		await this._internalSend(null, name, {
			timestamp: new Date(),
			...params,
		});
	}

	async sendEventAndScore(name: string, params: {}): Promise<{}> {
		return await this._internalSend(null, name, {
			timestamp: new Date(),
			...params,
		}, {
			score: true,
		});
	}

	async sendBackfillEvent(name: string, params: {}): Promise<void> {
		await this._internalSend('backfill', name, params);
	}

	async _internalSend(type: string|null, name: string, bodyParams: {}, urlParams: ?{}): Promise {
		validateEventName(name);

		const path = type ? `${type}/${name}` : name;
		const params = urlParams || null;
		const body = transformBody(bodyParams);

		const result = await this._client('post', path, params, body);

		return (result && result.data) || null;
	}
}

function validateEventName(name: string): void {
	if (!name.length)
		throw error('missing_event_name');

	if (!eventNameRegex.test(name))
		throw error('invalid_event_name', { allowedRegex: eventNameRegex });
}

function error(code: string, meta: ?{}): Error {
	const e = new Error(code);

	e.code = code;
	e.meta = meta || null;

	return e;
}

// fails if input contains a recursive reference
function transformBody(value: any): any {
	if (value instanceof Date)
		return Math.floor(value.getTime() / millisPerSecond);

	// currently doesn't support array-like objects
	// maybe change to `typeof value.map === 'function'`?
	if (Array.isArray(value))
		return Array.prototype.map.call(value, transformBody);

	if (typeof value === 'object') {
		const newBody = {};

		for (const [key, value] of Object.entries(value))
			newBody[key] = transformBody(value);

		return newBody;
	}

	return value;
}
