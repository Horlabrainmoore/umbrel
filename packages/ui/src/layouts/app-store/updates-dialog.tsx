import {Fragment, useState} from 'react'

import {AppIcon} from '@/components/app-icon'
import {UmbrelHeadTitle} from '@/components/umbrel-head-title'
import {useAvailableApps} from '@/hooks/use-available-apps'
import {useQueryParams} from '@/hooks/use-query-params'
import {Button} from '@/shadcn-components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogPortal, DialogTitle} from '@/shadcn-components/ui/dialog'
import {Separator} from '@/shadcn-components/ui/separator'
import {cn} from '@/shadcn-lib/utils'
import {RegistryApp} from '@/trpc/trpc'

export function UpdatesDialog() {
	const {params, removeParam} = useQueryParams()
	const isOpen = params.get('dialog') === 'updates'

	const title = 'Updates'

	const {isLoading, apps} = useAvailableApps()

	// NOTE: a parent should have the apps loaded before we get here, but don't wanna assume
	if (isLoading) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && removeParam('dialog')}>
			<DialogPortal>
				<DialogContent className='p-0'>
					<div className='umbrel-dialog-fade-scroller flex flex-col gap-y-2.5 overflow-y-auto px-5 py-6'>
						<DialogHeader>
							<UmbrelHeadTitle>{title}</UmbrelHeadTitle>
							<DialogTitle className='flex flex-row items-center justify-between'>
								5 updates available{' '}
								<Button size='dialog' variant='primary'>
									Update all
								</Button>
							</DialogTitle>
						</DialogHeader>
						{apps.slice(0, 7).map((app, i) => (
							<Fragment key={app.id}>
								{i === 0 ? <Separator className='my-2.5' /> : <Separator className='my-1' />}
								<AppItem app={app} />
							</Fragment>
						))}
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	)
}

function AppItem({app}: {app: RegistryApp}) {
	const [showAll, setShowAll] = useState(false)
	return (
		<div>
			<div className='flex items-center gap-2.5'>
				<AppIcon src={app.icon} size={36} className='rounded-8' />
				<div className='flex flex-col'>
					<h3 className='text-13 font-semibold'>{app.name}</h3>
					<p className='text-13 opacity-40'>{app.version}</p>
				</div>
				<div className='flex-1' />
				<Button size='sm'>Update</Button>
			</div>
			{app.releaseNotes && (
				<div className='flex items-end'>
					<div className={cn('relative mt-2.5 text-13 opacity-50 transition-all', !showAll && 'line-clamp-2')}>
						{app.releaseNotes}
					</div>
					<button
						className='bottom-0 right-0 text-13 text-brand underline underline-offset-2'
						onClick={() => setShowAll((s) => !s)}
					>
						{showAll ? 'less' : 'more'}
					</button>
				</div>
			)}
		</div>
	)
}
