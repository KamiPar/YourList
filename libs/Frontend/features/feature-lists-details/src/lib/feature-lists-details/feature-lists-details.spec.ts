import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureListsDetails } from './feature-lists-details';

describe('FeatureListsDetails', () => {
  let component: FeatureListsDetails;
  let fixture: ComponentFixture<FeatureListsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureListsDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureListsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
