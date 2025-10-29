import { TestBed } from '@angular/core/testing';
import {
  ItemControllerRestService,
  ShoppingListControllerRestService,
} from '@your-list/shared/data-access/data-access-api';
import { of, throwError } from 'rxjs';
import { ListDetailsState } from './list-details-state';

describe('ListDetailsState', () => {
  let state: ListDetailsState;
  let itemService: jest.Mocked<ItemControllerRestService>;
  let listService: jest.Mocked<ShoppingListControllerRestService>;

  beforeEach(() => {
    const itemServiceMock = {
      getAllItemsForList: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    const listServiceMock = {
      getList: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ListDetailsState,
        {
          provide: ItemControllerRestService,
          useValue: itemServiceMock,
        },
        {
          provide: ShoppingListControllerRestService,
          useValue: listServiceMock,
        },
      ],
    });

    state = TestBed.inject(ListDetailsState);
    itemService = TestBed.inject(
      ItemControllerRestService
    ) as jest.Mocked<ItemControllerRestService>;
    listService = TestBed.inject(
      ShoppingListControllerRestService
    ) as jest.Mocked<ShoppingListControllerRestService>;
  });

  it('should be created', () => {
    expect(state).toBeTruthy();
  });

  describe('fetchData', () => {
    it('should load list and items on success', () => {
      const mockList = { id: 1, name: 'Test List' };
      const mockItems = [{ id: 1, name: 'Item 1', isBought: false }];
      listService.getList.mockReturnValue(of(mockList));
      itemService.getAllItemsForList.mockReturnValue(of(mockItems));

      state.fetchData(1);

      expect(state.isLoading()).toBe(false);
      expect(state.error()).toBe(null);
      expect(state.viewModel().listInfo?.name).toBe('Test List');
      expect(state.viewModel().itemsToBuy[0].name).toBe('Item 1');
    });

    it('should set error state on failure', () => {
      listService.getList.mockReturnValue(throwError(() => new Error('Error')));
      itemService.getAllItemsForList.mockReturnValue(of([]));

      state.fetchData(1);

      expect(state.isLoading()).toBe(false);
      expect(state.error()).toBe('Failed to load list details.');
    });
  });

  describe('addItem', () => {
    it('should optimistically add an item and then update with real data', () => {
      state.fetchData(1); // Set listId
      const newItem = { name: 'New Item' };
      const createdItem = { id: 2, name: 'New Item', isBought: false };
      itemService.createItem.mockReturnValue(of(createdItem));

      state.addItem(newItem);

      // Check optimistic update
      expect(state.viewModel().itemsToBuy.length).toBe(1);
      expect(state.viewModel().itemsToBuy[0].name).toBe('New Item');

      // After API call
      expect(state.viewModel().itemsToBuy[0].id).toBe(2);
    });

    it('should rollback optimistic add on error', () => {
      state.fetchData(1);
      const newItem = { name: 'New Item' };
      itemService.createItem.mockReturnValue(throwError(() => new Error('Error')));

      state.addItem(newItem);

      expect(state.viewModel().itemsToBuy.length).toBe(0);
      expect(state.error()).toBe('Failed to add item.');
    });
  });
});
