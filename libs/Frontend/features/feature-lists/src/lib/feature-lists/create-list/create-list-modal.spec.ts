import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateListModal } from './create-list-modal';

describe('CreateListModal', () => {
  let component: CreateListModal;
  let fixture: ComponentFixture<CreateListModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateListModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
