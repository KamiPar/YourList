import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareBottomSheet } from './share-bottom-sheet';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

describe('ShareBottomSheet', () => {
  let component: ShareBottomSheet;
  let fixture: ComponentFixture<ShareBottomSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareBottomSheet],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareBottomSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
