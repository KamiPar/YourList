import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListDetailsView } from './list-details-view';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ListDetailsState } from '../../state/list-details-state';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ListDetailsView', () => {
  let component: ListDetailsView;
  let fixture: ComponentFixture<ListDetailsView>;

  beforeEach(async () => {
    const listDetailsStateMock = {
      viewModel: signal({
        listInfo: null,
        itemsToBuy: [],
        boughtItems: [],
      }),
      isLoading: signal(false),
      error: signal(null),
      fetchData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ListDetailsView, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
          },
        },
        {
          provide: ListDetailsState,
          useValue: listDetailsStateMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDetailsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
