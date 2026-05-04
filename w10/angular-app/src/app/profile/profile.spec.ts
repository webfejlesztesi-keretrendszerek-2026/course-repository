import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Profile } from './profile';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { ToastService } from '../services/toast.service';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
      const mockAuthService = {
        currentUser: () => ({ uid: 'test-user', email: 'test@example.com' }),
        updateAppUser: () => {},
        logout: () => Promise.resolve(),
        deleteAccount: () => Promise.resolve(),
      } as any;

      const mockProfileService = {
        replaceProfile: () => {},
        theme: () => 'light',
        setTheme: () => {},
        toastVisible: () => false,
      } as any;

      const mockToast = { success: () => {}, error: () => {} } as any;

      await TestBed.configureTestingModule({
        imports: [Profile, RouterTestingModule],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: ProfileService, useValue: mockProfileService },
          { provide: ToastService, useValue: mockToast },
        ],
      }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
