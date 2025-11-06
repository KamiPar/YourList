import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListHeader } from './list-header';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ListHeader', () => {
  let component: ListHeader;
  let fixture: ComponentFixture<ListHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListHeader],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
