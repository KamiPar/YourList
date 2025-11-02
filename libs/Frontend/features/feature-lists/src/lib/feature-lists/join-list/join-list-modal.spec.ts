import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinListModal } from './join-list-modal';

describe('JoinListModal', () => {
  let component: JoinListModal;
  let fixture: ComponentFixture<JoinListModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinListModal],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
