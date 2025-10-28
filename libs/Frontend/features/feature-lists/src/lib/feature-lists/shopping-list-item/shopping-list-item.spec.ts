import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingListItem } from './shopping-list-item';

describe('ShoppingListItem', () => {
  let component: ShoppingListItem;
  let fixture: ComponentFixture<ShoppingListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
