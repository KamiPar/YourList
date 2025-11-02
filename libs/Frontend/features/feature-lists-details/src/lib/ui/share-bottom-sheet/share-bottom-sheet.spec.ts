import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareBottomSheet } from './share-bottom-sheet';

describe('ShareBottomSheet', () => {
  let component: ShareBottomSheet;
  let fixture: ComponentFixture<ShareBottomSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareBottomSheet],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareBottomSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
