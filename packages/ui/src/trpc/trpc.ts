import {createTRPCProxyClient, createTRPCReact, httpBatchLink, loggerLink} from '@trpc/react-query'
import {inferRouterInputs, inferRouterOutputs} from '@trpc/server'

import type {AppRouter} from '../../../../packages/umbreld/source/modules/server/trpc/index'

export type {Category} from '../../../../packages/umbreld/source/modules/apps/schema'

export {categories} from '../../../../packages/umbreld/source/modules/apps/data'

export const trpcUrl = `http://${location.hostname}:3001/trpc`

// TODO: Getting jwt from `localStorage` like this means auth flow require a page refresh
const jwt = localStorage.getItem('jwt')
export const links = [
	loggerLink({
		enabled: () => true,
	}),
	httpBatchLink({
		url: trpcUrl,
		headers: async () => ({
			Authorization: `Bearer ${jwt}`,
		}),
	}),
]

// React client
export const trpcReact = createTRPCReact<AppRouter>()

// Vanilla client
export const trpcClient = createTRPCProxyClient<AppRouter>({links})

// Types ----------------------------

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type RegistryApp = NonNullable<RouterOutput['appStore']['registry'][number]>['apps'][number]
export type InstalledApp = {
	appId: string
	state: 'installed' | 'offline' | 'installing' | 'uninstalling'
	installProgress: number
	showNotifications: boolean
	autoUpdate: boolean
	credentials: {
		showCredentialsBeforeOpen: boolean
		defaultUsername: string
		defaultPassword: string
	}
}

export const defaultInstalledApp: InstalledApp = {
	appId: 'TEST',
	state: 'installed',
	installProgress: 0,
	showNotifications: true,
	autoUpdate: true,
	credentials: {
		showCredentialsBeforeOpen: true,
		defaultUsername: '',
		defaultPassword: '',
	},
}