import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCatalog } from './recipe-catalog';

describe('RecipeCatalog', () => {
  let component: RecipeCatalog;
  let fixture: ComponentFixture<RecipeCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCatalog],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
