import fs from 'fs';
import fsp from 'fs/promises';
import { join } from 'path';

/**
 * Any record with any key and any value.
 * @internal
 */
export type AnyObject = Record<string | number | symbol, unknown>;

/**
 * Promise or not.
 * @internal
 */
export type MaybePromise<T> = Promise<T> | T;

/**
 * Cached data response.
 *
 * This will be returned by most methods of {@link CacheStore}.
 *
 * Keep in mind that it does not have to be **cached** data, since it can also
 * contain newly fetched data. In that case, {@link fromCache} will be `false`.
 */
export type CachedData = {
	/** True if the fresh data or cache is successfully fetched. */
	success: boolean;

	/** True if the data comes from cache, false if the data is newly fetched. */
	fromCache?: boolean;

	/**
	 * Contains the date on which the cache is saved, if the cache is new.
	 *
	 * Make sure you always create a new Date object with this value as the
	 * parameter. It doesn't necessarily have to be a Date object, it can also
	 * be a string that is recognised by
	 * [`Date.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
	 */
	savedOn?: Date | string;

	/** Contains the data if it has successfully been fetched. */
	data?: AnyObject;
};

/** Callback function that fetches the data if the cache is expired. */
export type Callback = () => MaybePromise<CachedData>;

/** Chowchow's cache store. This is the main class for managing cached data. */
export class CacheStore {
	/** Machine-readable name of the store. */
	readonly name: string;

	/** Name of the JSON file the cached data lives in. */
	readonly fileName: string;

	/** Directory name the file lives in. */
	readonly fileDir: string;

	/** Maximum age of the cache in minutes. */
	maxAge: number;

	/** Callback function that fetches the data to be cached. */
	getFreshData: Callback;

	constructor(
		/** Machine-readable name of the store. */
		name: string,

		/** Callback that fetches the data to be cached */
		getFreshData: Callback,

		/** Maximum age of the cache in minutes. */
		maxAge = 15,

		/** Directory name the file lives in. */
		fileDir = '.cache',

		/** Name of the JSON file the cached data lives in. */
		fileName = name
	) {
		this.name = name;
		this.fileDir = fileDir;
		this.fileName = fileName;
		this.getFreshData = getFreshData;
		this.maxAge = maxAge;
	}

	/** Full store file path. */
	get filePath() {
		return join(process.cwd(), `${this.fileDir}/${this.name}.json`)
	}

	/**
	 * Read the cache, regardless of the expiration date.
	 * @returns Cached data
	 */
	async readCache(): Promise<CachedData> {
		if (fs.existsSync(this.filePath)) {
			const raw = await fsp.readFile(this.filePath);
			const parsed = JSON.parse(raw.toString());
			return { ...parsed, success: true, fromCache: true };
		} else {
			return { success: false, fromCache: false };
		}
	}

	/** Actual expiration date, i.e. now + expiration time. */
	get expirationDate(): Date {
		const expDate = new Date();
		expDate.setTime(expDate.getTime() + (this.maxAge * 60_000));
		return expDate;
	}

	/** Create the store directory. */
	ensureCacheFileExists() {
		try { fs.mkdirSync(this.fileDir, { recursive: true }); }
		catch (err) { if (err.code !== 'EEXIST') throw err; }
	}

	/**
	 * Get the data.
	 *
	 * If the cache is not expired yet according to the expiration time, it will
	 * return the cache. Otherwise it will fetch new data, save it to the store,
	 * and return it.
	 *
	 * @returns Data.
	 */
	async getData(): Promise<CachedData> {
		const now = new Date();
		const cache = await this.readCache();

		// 1. Check whether pre-existing cache is still valid and, if so, return
		//    it..
		if (
			cache.success
			&& cache.savedOn
			&& new Date(cache.savedOn).getTime()
			<  this.expirationDate.getTime()
		) return { ...cache, fromCache: true, success: true };

		// -> Cache is not valid or does not yet exist.
		// 2. Get fresh data and validate it.
		const freshData = await this.getFreshData();

		if (!freshData.success) return {
			...cache,
			fromCache: true,
			success: false
		};

		// -> Newly fetched data is valid.
		// 3. Write and return fresh data.
		const newCache: CachedData = {
			success: true,
			fromCache: false,
			savedOn: now,
			data: freshData.data
		};

		this.ensureCacheFileExists();
		fsp.writeFile(this.filePath, JSON.stringify(newCache));
		return newCache;
	}
}
