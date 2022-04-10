# Chowchow

[![API docs](https://img.shields.io/badge/api-docs-blue)](https://projects.romeinvanburen.nl/chowchow/)

Efficient and customisable server-side caching made easy. Chowchow caches everything you want to cache, from CMS data to API responses.

- 🚀 Makes your app faster.
- 💼 Bring your own function to get the data.
- 🕰 Expiration time from 2 seconds to 2 eons.
- 🪶 Extremely lightweight (1.8 kB).

## Installation

```shell
npm install chowchow
```

## Usage

```js
import CacheStore from 'chowchow';

const cache = new CacheStore(
	/* Store name */ 'cache',
	/* Callback that fetches data */ async () => {
		const res = await fetch('http://localhost:5000/myapi');
		if (!res.ok) return { success: false };

		const entries = await res.json();
		const filtered = entries.filter(e => e.status === 'online');
		if (!filtered.length) return { success: false };

		return { success: true, data: onlineEntries };
	},
	/* Maximum age in minutes */ 15,
	/* Cache file directory */ '.cache',
	/* File name */ 'cache'
);
```

### Get the data

If the cache is not expired yet according to the expiration time, it will return the cache. Otherwise it will fetch new data, save it to the store, and return it.

```js
const data = cache.getData();
```

### Read the cache

This returns the cache, regardless of whether it is expired or not.

```js
const cachedData = cache.readCache();
```

### Get fresh data

This fetches fresh data and returns it, regardless of whether it is expired or not. The function is the given callback parameter of the constructor.

```js
const freshData = cache.getFreshData();
```

## License

[MIT](LICENSE.md)
