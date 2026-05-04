import { TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { authGuard } from './auth.guard'
import { Router, UrlTree } from '@angular/router'
import { AuthService } from '../services/auth.service'

describe('Auth guard integration', () => {
  beforeEach(() => {
    // ensure clean TestBed
    TestBed.resetTestingModule()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('allows access for logged-in user (loading=false, isLoggedIn=true)', async () => {
    // Arrange
    const loading = signal(false)
    const isLoggedIn = signal(true)
    const authMock: Partial<AuthService> = {
      loading,
      isLoggedIn,
    }

    const urlTreeSpy = vi.fn(() => ({ redirect: '/login' } as unknown as UrlTree))
    const routerMock: Partial<Router> = {
      createUrlTree: urlTreeSpy,
    }

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents()

    // Act
    const routeMock = {} as any
    const stateMock = {} as any
    const result = await TestBed.runInInjectionContext(() => authGuard(routeMock, stateMock))

    // Assert
    expect(result).toBe(true)
    expect(urlTreeSpy).not.toHaveBeenCalled()
  })

  it("redirects to '/login' for not-logged-in user (loading=false, isLoggedIn=false)", async () => {
    // Arrange
    const loading = signal(false)
    const isLoggedIn = signal(false)
    const authMock: Partial<AuthService> = {
      loading,
      isLoggedIn,
    }

    const urlTree = { redirect: '/login' } as unknown as UrlTree
    const urlTreeSpy = vi.fn(() => urlTree)
    const routerMock: Partial<Router> = {
      createUrlTree: urlTreeSpy,
    }

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents()

    // Act
    const routeMock = {} as any
    const stateMock = {} as any
    const result = await TestBed.runInInjectionContext(() => authGuard(routeMock, stateMock))

    // Assert
    expect(result).toBe(urlTree)
    expect(urlTreeSpy).toHaveBeenCalledWith(['/login'])
  })

  it('waits while loading and then allows when auth ready and logged in', async () => {
    // Arrange: start with loading=true
    vi.useFakeTimers()

    const loading = signal(true)
    const isLoggedIn = signal(false)
    const authMock: Partial<AuthService> = {
      loading,
      isLoggedIn,
    }

    const urlTreeSpy = vi.fn(() => ({ redirect: '/login' } as unknown as UrlTree))
    const routerMock: Partial<Router> = {
      createUrlTree: urlTreeSpy,
    }

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents()

    // Act: call the guard (it will poll)
    const routeMock = {} as any
    const stateMock = {} as any
    const guardPromise = TestBed.runInInjectionContext(() => authGuard(routeMock, stateMock))

    // still loading -> not yet resolved; flip loading to false and set logged-in
    loading.set(false)
    isLoggedIn.set(true)

    // advance timers so the polling check runs
    vi.advanceTimersByTime(50)

    const result = await guardPromise

    // Assert
    expect(result).toBe(true)
    expect(urlTreeSpy).not.toHaveBeenCalled()
  })
})
