import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingListItem } from './shopping-list-item';
import { ShoppingListSummaryVm } from '../list-view/list-view.component';
import { By } from '@angular/platform-browser';

describe('ShoppingListItem', () => {
  let component: ShoppingListItem;
  let fixture: ComponentFixture<ShoppingListItem>;

  const mockList: ShoppingListSummaryVm = {
    id: 1,
    name: 'Test Shopping List',
    isOwner: true,
    lastModified: '2024-01-15',
    itemCountLabel: '5 produktów (2 kupione)',
    showDeleteButton: true,
    isShared: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('list', mockList);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Signal', () => {
    it('should receive list input', () => {
      expect(component.list()).toEqual(mockList);
    });

    it('should update when list input changes', () => {
      const updatedList: ShoppingListSummaryVm = {
        ...mockList,
        name: 'Updated List',
      };
      fixture.componentRef.setInput('list', updatedList);
      fixture.detectChanges();

      expect(component.list().name).toBe('Updated List');
    });
  });

  describe('onNavigate', () => {
    it('should emit navigate event with list id', () => {
      const navigateSpy = jest.fn();
      component.navigate.subscribe(navigateSpy);

      component.onNavigate();

      expect(navigateSpy).toHaveBeenCalledWith(1);
    });

    it('should emit navigate event when component is clicked', () => {
      const navigateSpy = jest.fn();
      component.navigate.subscribe(navigateSpy);

      const divElement = fixture.debugElement.query(By.css('div[class*="cursor-pointer"]'));
      divElement.nativeElement.click();

      expect(navigateSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('onDelete', () => {
    it('should emit delete event with list id', () => {
      const deleteSpy = jest.fn();
      component.delete.subscribe(deleteSpy);

      const mockEvent = new Event('click');
      component.onDelete(mockEvent);

      expect(deleteSpy).toHaveBeenCalledWith(1);
    });

    it('should stop event propagation', () => {
      const mockEvent = new Event('click');
      const stopPropagationSpy = jest.spyOn(mockEvent, 'stopPropagation');

      component.onDelete(mockEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should not trigger navigate when delete is clicked', () => {
      const navigateSpy = jest.fn();
      const deleteSpy = jest.fn();
      component.navigate.subscribe(navigateSpy);
      component.delete.subscribe(deleteSpy);

      const mockEvent = new Event('click');
      jest.spyOn(mockEvent, 'stopPropagation');

      component.onDelete(mockEvent);

      expect(deleteSpy).toHaveBeenCalledWith(1);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Event Emitters', () => {
    it('should have navigate output defined', () => {
      expect(component.navigate).toBeDefined();
    });

    it('should have delete output defined', () => {
      expect(component.delete).toBeDefined();
    });
  });

  describe('List Properties Display', () => {
    it('should display list with owner properties', () => {
      const ownerList: ShoppingListSummaryVm = {
        id: 2,
        name: 'Owner List',
        isOwner: true,
        lastModified: '2024-01-20',
        itemCountLabel: '10 produktów (5 kupione)',
        showDeleteButton: true,
        isShared: false,
      };

      fixture.componentRef.setInput('list', ownerList);
      fixture.detectChanges();

      expect(component.list().isOwner).toBe(true);
      expect(component.list().showDeleteButton).toBe(true);
    });

    it('should display list with shared properties', () => {
      const sharedList: ShoppingListSummaryVm = {
        id: 3,
        name: 'Shared List',
        isOwner: false,
        lastModified: '2024-01-25',
        itemCountLabel: '3 produktów (1 kupione)',
        showDeleteButton: false,
        isShared: true,
      };

      fixture.componentRef.setInput('list', sharedList);
      fixture.detectChanges();

      expect(component.list().isOwner).toBe(false);
      expect(component.list().showDeleteButton).toBe(false);
      expect(component.list().isShared).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle list with undefined id', () => {
      const listWithoutId: ShoppingListSummaryVm = {
        id: undefined,
        name: 'No ID List',
        isOwner: true,
        lastModified: '2024-01-30',
        itemCountLabel: '0 produktów (0 kupione)',
        showDeleteButton: true,
        isShared: false,
      };

      fixture.componentRef.setInput('list', listWithoutId);
      fixture.detectChanges();

      const navigateSpy = jest.fn();
      component.navigate.subscribe(navigateSpy);
      component.onNavigate();

      expect(navigateSpy).toHaveBeenCalledWith(undefined);
    });

    it('should handle empty item count label', () => {
      const listWithEmptyLabel: ShoppingListSummaryVm = {
        id: 4,
        name: 'Empty Label List',
        isOwner: true,
        lastModified: '',
        itemCountLabel: '',
        showDeleteButton: true,
        isShared: false,
      };

      fixture.componentRef.setInput('list', listWithEmptyLabel);
      fixture.detectChanges();

      expect(component.list().itemCountLabel).toBe('');
    });
  });
});
