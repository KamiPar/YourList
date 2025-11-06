import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListViewComponent } from './list-view.component';
import { ShoppingListControllerRestService, PageShoppingListSummaryResponse, ShoppingListSummaryResponse } from '@your-list/shared/data-access/data-access-api';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let shoppingListServiceMock: jest.Mocked<ShoppingListControllerRestService>;
  let routerMock: jest.Mocked<Router>;
  let dialogMock: jest.Mocked<MatDialog>;

  const mockLists: ShoppingListSummaryResponse[] = [
    { id: 1, name: 'List 1', isOwner: true, itemCount: 5, boughtItemCount: 2, updatedAt: new Date() },
    { id: 2, name: 'List 2', isOwner: false, itemCount: 3, boughtItemCount: 1, updatedAt: new Date() },
  ];

  beforeEach(async () => {
    shoppingListServiceMock = {
      getAllListsForUser: jest.fn(),
    } as unknown as jest.Mocked<ShoppingListControllerRestService>;

    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    dialogMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [ListViewComponent],
      providers: [
        { provide: ShoppingListControllerRestService, useValue: shoppingListServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    })
    .overrideComponent(ListViewComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }, // Easier to test without OnPush
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load lists on initialization and update state to loaded', () => {
      const response: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges(); // triggers ngOnInit

      expect(shoppingListServiceMock.getAllListsForUser).toHaveBeenCalledWith({ page: 0, size: 20 });
      expect(component.isLoading()).toBe(false);
      expect(component.isLoaded()).toBe(true);
      expect(component.isEmpty()).toBe(false);
      expect(component.listsVm().length).toBe(2);
      expect(component.listsVm()[0].name).toBe('List 1');
    });

    it('should handle empty list response', () => {
      const response: PageShoppingListSummaryResponse = { content: [] };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(component.isLoaded()).toBe(true);
      expect(component.isEmpty()).toBe(true);
      expect(component.listsVm().length).toBe(0);
    });

    it('should handle error on loading lists and update state to error', () => {
      const error = new Error('Failed to fetch');
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(component.isLoaded()).toBe(false);
      expect(component.isEmpty()).toBe(false);
    });
  });

  describe('openCreateListModal', () => {
    it('should open dialog and add new list to state when dialog is closed with a result', () => {
      const newList: ShoppingListSummaryResponse = { id: 3, name: 'New List', isOwner: true, itemCount: 0, boughtItemCount: 0 };
      const dialogRefMock = {
        afterClosed: () => of(newList),
      } as MatDialogRef<unknown>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      component.openCreateListModal();

      expect(dialogMock.open).toHaveBeenCalled();
      expect(component.listsVm().length).toBe(1);
      expect(component.listsVm()[0].id).toBe(3);
    });

    it('should not add a list if dialog is closed without a result', () => {
        const dialogRefMock = {
            afterClosed: () => of(null),
        } as MatDialogRef<unknown>;
        dialogMock.open.mockReturnValue(dialogRefMock);

        component.openCreateListModal();

        expect(dialogMock.open).toHaveBeenCalled();
        expect(component.listsVm().length).toBe(0);
    });
  });

  describe('openJoinListModal', () => {
    it('should open dialog and add joined list to state when dialog is closed with a result', () => {
        const joinedList: ShoppingListSummaryResponse = { id: 4, name: 'Joined List', isOwner: false, itemCount: 10, boughtItemCount: 5 };
        const dialogRefMock = {
            afterClosed: () => of(joinedList),
        } as MatDialogRef<unknown>;
        dialogMock.open.mockReturnValue(dialogRefMock);

        component.openJoinListModal();

        expect(dialogMock.open).toHaveBeenCalled();
        expect(component.listsVm().length).toBe(1);
        expect(component.listsVm()[0].id).toBe(4);
    });
  });

  describe('onNavigate', () => {
    it('should navigate to the list details page', () => {
      const listId = 123;
      component.onNavigate(listId);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', listId]);
    });
  });

  describe('Computed Signals', () => {
    it('should correctly reflect the loading state', () => {
      const response: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      expect(component.isLoading()).toBe(true);
      fixture.detectChanges(); // ngOnInit
      expect(component.isLoading()).toBe(false);
    });

    it('should correctly compute isLoaded state', () => {
      const response: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      expect(component.isLoaded()).toBe(false);
      fixture.detectChanges();
      expect(component.isLoaded()).toBe(true);
    });

    it('should correctly compute isEmpty state when lists are empty', () => {
      const response: PageShoppingListSummaryResponse = { content: [] };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();
      expect(component.isEmpty()).toBe(true);
    });

    it('should correctly compute isEmpty state when lists are not empty', () => {
      const response: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();
      expect(component.isEmpty()).toBe(false);
    });
  });

  describe('mapToVm', () => {
    it('should correctly map ShoppingListSummaryResponse to ShoppingListSummaryVm', () => {
      const response: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();

      const vm = component.listsVm()[0];
      expect(vm.id).toBe(1);
      expect(vm.name).toBe('List 1');
      expect(vm.isOwner).toBe(true);
      expect(vm.itemCountLabel).toBe('5 produktów (2 kupione)');
      expect(vm.showDeleteButton).toBe(true);
      expect(vm.isShared).toBe(false);
    });

    it('should set isShared to true for non-owner lists', () => {
      const response: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();

      const vm = component.listsVm()[1];
      expect(vm.isOwner).toBe(false);
      expect(vm.isShared).toBe(true);
      expect(vm.showDeleteButton).toBe(false);
    });

    it('should format lastModified date correctly', () => {
      const testDate = new Date('2024-01-15');
      const listWithDate: ShoppingListSummaryResponse = {
        ...mockLists[0],
        updatedAt: testDate,
      };
      const response: PageShoppingListSummaryResponse = { content: [listWithDate] };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();

      const vm = component.listsVm()[0];
      expect(vm.lastModified).toBe(testDate.toLocaleDateString());
    });

    it('should handle missing updatedAt date', () => {
      const listWithoutDate: ShoppingListSummaryResponse = {
        id: 1,
        name: 'List without date',
        isOwner: true,
        itemCount: 0,
        boughtItemCount: 0,
      };
      const response: PageShoppingListSummaryResponse = { content: [listWithoutDate] };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();

      const vm = component.listsVm()[0];
      expect(vm.lastModified).toBe('');
    });
  });

  describe('State Management', () => {
    it('should add new list to the beginning of the list array', () => {
      const initialResponse: PageShoppingListSummaryResponse = { content: mockLists };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(initialResponse));
      fixture.detectChanges();

      const newList: ShoppingListSummaryResponse = {
        id: 3,
        name: 'New List',
        isOwner: true,
        itemCount: 0,
        boughtItemCount: 0,
      };
      const dialogRefMock = {
        afterClosed: () => of(newList),
      } as MatDialogRef<unknown>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      component.openCreateListModal();

      expect(component.listsVm().length).toBe(3);
      expect(component.listsVm()[0].id).toBe(3);
      expect(component.listsVm()[0].name).toBe('New List');
    });

    it('should maintain state after error', () => {
      const error = new Error('Network error');
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(component.isLoaded()).toBe(false);
      expect(component.listsVm().length).toBe(0);
    });
  });

  describe('Dialog Integration', () => {
    it('should open CreateListModal with correct configuration', () => {
      const dialogRefMock = {
        afterClosed: () => of(null),
      } as MatDialogRef<unknown>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      component.openCreateListModal();
      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should open JoinListModal with correct configuration', () => {
      const dialogRefMock = {
        afterClosed: () => of(null),
      } as MatDialogRef<unknown>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      component.openJoinListModal();
      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should handle multiple list additions', () => {
      const list1: ShoppingListSummaryResponse = { id: 1, name: 'List 1', isOwner: true, itemCount: 0, boughtItemCount: 0 };
      const list2: ShoppingListSummaryResponse = { id: 2, name: 'List 2', isOwner: true, itemCount: 0, boughtItemCount: 0 };

      const dialogRefMock1 = { afterClosed: () => of(list1) } as MatDialogRef<unknown>;
      const dialogRefMock2 = { afterClosed: () => of(list2) } as MatDialogRef<unknown>;

      dialogMock.open.mockReturnValueOnce(dialogRefMock1);
      component.openCreateListModal();

      dialogMock.open.mockReturnValueOnce(dialogRefMock2);
      component.openJoinListModal();

      expect(component.listsVm().length).toBe(2);
      expect(component.listsVm()[0].id).toBe(2);
      expect(component.listsVm()[1].id).toBe(1);
    });
  });

  describe('Navigation', () => {
    it('should navigate with correct route parameters', () => {
      const listId = 456;
      component.onNavigate(listId);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', listId]);
      expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined content in response', () => {
      const response: PageShoppingListSummaryResponse = { content: undefined };
      (shoppingListServiceMock.getAllListsForUser as jest.Mock).mockReturnValue(of(response));

      fixture.detectChanges();

      expect(component.listsVm().length).toBe(0);
      expect(component.isEmpty()).toBe(true);
    });

    it('should handle null response from dialog', () => {
      const dialogRefMock = {
        afterClosed: () => of(null),
      } as MatDialogRef<unknown>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      const initialLength = component.listsVm().length;
      component.openCreateListModal();

      expect(component.listsVm().length).toBe(initialLength);
    });

    it('should handle undefined response from dialog', () => {
      const dialogRefMock = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<unknown>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      const initialLength = component.listsVm().length;
      component.openJoinListModal();

      expect(component.listsVm().length).toBe(initialLength);
    });
  });
});
