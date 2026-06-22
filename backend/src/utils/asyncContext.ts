import { AsyncLocalStorage } from 'async_hooks'

export interface AsyncContext {
  userId?: string
  ip?: string
  requestId?: string
}

export const asyncContext = new AsyncLocalStorage<AsyncContext>()

export function getAsyncContext(): AsyncContext {
  return asyncContext.getStore() || {}
}

export function setAsyncContext(context: AsyncContext): void {
  asyncContext.run(context, () => {})
}
