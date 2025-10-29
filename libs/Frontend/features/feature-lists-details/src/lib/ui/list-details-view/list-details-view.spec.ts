import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListDetailsView } from './list-details-view';

describe('ListDetailsView', () => {
  let component: ListDetailsView;
  let fixture: ComponentFixture<ListDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDetailsView],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDetailsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
