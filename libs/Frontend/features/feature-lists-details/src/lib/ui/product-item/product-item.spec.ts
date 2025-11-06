import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductItem } from './product-item';

describe('ProductItem', () => {
  let component: ProductItem;
  let fixture: ComponentFixture<ProductItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductItem);
    component = fixture.componentInstance;
    component.item = { id: 1, name: 'Test Item', isBought: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
