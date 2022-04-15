# Chowchow

[![API docs](.github/api.svg)](https://garraflavatra.github.io/chowchow/)

Efficient and customisable server-side caching made easy. Chowchow caches everything you want to cache, from CMS data to API responses.

- 🚀 Makes your app faster.
- 💼 Bring your own function to get the data.
- 🕰 Expiration time from 1 second to an aeon.
- 🪶 Extremely lightweight (1.8 kB).

## Installation

```shell
npm install @garraflavatra/chowchow
```

## Usage

[![API docs](.github/api.svg)](https://garraflavatra.github.io/chowchow/classes/CacheStore.html)

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

[![API docs](.github/api.svg)](https://garraflavatra.github.io/chowchow/classes/CacheStore.html)

If the cache is not expired yet according to the expiration time, it will return the cache. Otherwise it will fetch new data, save it to the store, and return it.

```js
const data = cache.getData();
```

### Read the cache

[![API docs](.github/api.svg)](https://garraflavatra.github.io/chowchow/classes/CacheStore.html#readCache)

This returns the cache, regardless of whether it is expired or not.

```js
const cachedData = cache.readCache();
```

### Get fresh data

[![API docs](.github/api.svg)](https://garraflavatra.github.io/chowchow/classes/CacheStore.html#getFreshData)

This fetches fresh data and returns it, regardless of whether it is expired or not. The function is the given callback parameter of the constructor. Note that this does not write the cache to the cache file.

```js
const freshData = cache.getFreshData();
```

## License

[MIT](LICENSE.md)
