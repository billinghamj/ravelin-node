# ravelin-node

This is a client for the [Ravelin API](https://developer.ravelin.com). Ravelin
is a fraud detection tool. See https://ravelin.com for more information.

```js
import Ravelin from 'ravelin';

const client = new Ravelin({
	apiKey: 'sk_live_XXXXXXXX',
});

const result = await client.sendEventAndScore('order', {
	customerId: '0ec0253d-d80c-4987-985e-29f374a3b2fd',
	order: {
		orderId: 'c04edd43-534f-44a1-a31d-a647f27d15f1',
		currency: 'GBP',
		price: 1000,
		items: [
			{ sku: 'cuvva-motor-1hour', quantity: 1 },
		],
	},
});

console.log(result.action); // => ALLOW/REVIEW/PREVENT
```

## Installation

```bash
$ npm install --save ravelin
```

## API

All methods return promises. Traditional Node callbacks are not supported.

This API is intended to be pretty hands-off and avoid defining any specific
events, or the structure of the parameters for events. By being reasonably
flexible, the hope is that most future API changes will "just work" without
requiring any modifications to the library.

### `new Ravelin(options)`

First, set up a client by creating an instance of `Ravelin`.

Options:

- `apiKey` - the secret API key provided by the [Ravelin Dashboard](https://dashboard.ravelin.com/#/settings)

This is the only option at the moment. If there is another option you want, open
an issue explaining the use-case.

```js
const client = new Ravelin({
	apiKey: 'sk_live_XXXXXXXX',
});
```

### `sendEvent(name, params)`

Events are sent with a name and various parameters. These are exactly as-defined
in the [Ravelin docs](https://developer.ravelin.com/#events). For example, the
`POST /v2/paymentmethod` event would be `sendEvent('paymentmethod', {...})`.

The `timestamp` parameter, if not defined, will be set to the current time.

Any `Date` objects provided in the parameters will be converted into unix
timestamps before being sent to Ravelin. If you want a particular date to avoid
this behavior, you should convert it to a string or number before passing it.

The returned promise will resolve with `undefined`. (i.e. nothing is returned,
but you can still check for errors)

```js
await client.sendEvent('customer', {
	customer: {
		customerId: '0ec0253d-d80c-4987-985e-29f374a3b2fd',
		givenName: 'Gilbert J',
		familyName: 'Loomis',
		location: {
			latitude: 39.75,
			longitude: -84.19,
		},
	},
});
```

### `sendEventAndScore(name, params)`

Exactly the same as `sendEvent`, but the promise resolves with the score object,
as defined in the [Ravelin docs](https://developer.ravelin.com/#response).

```js
const result = await client.sendEventAndScore('order', {
	customerId: '0ec0253d-d80c-4987-985e-29f374a3b2fd',
	order: {
		orderId: 'c04edd43-534f-44a1-a31d-a647f27d15f1',
		currency: 'GBP',
		price: 1000,
		items: [
			{ sku: 'cuvva-motor-1hour', quantity: 1 },
		],
	},
});

console.log(result.action); // => ALLOW/REVIEW/PREVENT
```

### `sendBackfillEvent(name, params)`

Exactly the same as `sendEvent`, but not subject to rate limiting. The
`timestamp` parameter is required and will not be set for you automatically.

See the [Ravelin docs](https://developer.ravelin.com/#backfill) for important
notes about the implications of backfilling data while also sending live events.

```js
await client.sendBackfillEvent('order', {
	timestamp: new Date('1897-04-01T10:12:14.572-08:00'),
	customerId: '0ec0253d-d80c-4987-985e-29f374a3b2fd',
	order: {
		orderId: '5570a366-cc57-4ea7-abfd-1e41211db62f',
		currency: 'USD',
		price: 100000,
		items: [
			{ sku: 'first-insurance-policy', quantity: 1 },
		],
	},
});
```

## Notes

- event parameters must never contain a recursive reference

## Support

Please open an issue on this repository.

## Authors

- James Billingham <james@jamesbillingham.com>

## License

MIT licensed - see [LICENSE](LICENSE) file
