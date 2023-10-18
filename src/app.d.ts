// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('lucia').AuthRequest;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

declare namespace Lucia {
	type Auth = import('./lucia.js').Auth;
	type DatabaseUserAttributes = {};
	type DatabaseSessionAttributes = {};
}

export {};
