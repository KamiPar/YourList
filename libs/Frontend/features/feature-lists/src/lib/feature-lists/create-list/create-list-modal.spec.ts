import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateListModal } from './create-list-modal';
import { MatDialogRef } from '@angular/material/dialog';
import { ShoppingListControllerRestService, ShoppingListResponse } from '@your-list/shared/data-access/data-access-api';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('CreateListModal', () => {
  let component: CreateListModal;
  let fixture: ComponentFixture<CreateListModal>;
  let dialogRefMock: jest.Mocked<MatDialogRef<CreateListModal>>;
  let shoppingListServiceMock: jest.Mocked<ShoppingListControllerRestService>;

  beforeEach(async () => {
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<CreateListModal>>;

    shoppingListServiceMock = {
      createList: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<ShoppingListControllerRestService>;

    await TestBed.configureTestingModule({
      imports: [CreateListModal],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: ShoppingListControllerRestService, useValue: shoppingListServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty name field', () => {
      expect(component.form.get('name')?.value).toBe('');
    });

    it('should have required validator on name field', () => {
      const nameControl = component.form.get('name');
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should have maxLength validator on name field', () => {
      const nameControl = component.form.get('name');
      nameControl?.setValue('a'.repeat(256));
      expect(nameControl?.hasError('maxlength')).toBe(true);
    });

    it('should initialize nameErrors$ observable', () => {
      expect(component.nameErrors$).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when name is empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should be valid when name is provided', () => {
      component.form.get('name')?.setValue('My Shopping List');
      expect(component.form.valid).toBe(true);
    });

    it('should be invalid when name exceeds max length', () => {
      component.form.get('name')?.setValue('a'.repeat(256));
      expect(component.form.valid).toBe(false);
    });

    it('should show errors when field is touched and invalid', (done) => {
      const nameControl = component.form.get('name');
      nameControl?.markAsTouched();
      nameControl?.markAsDirty();

      component.nameErrors$.subscribe((errors) => {
        expect(errors.show).toBe(true);
        expect(errors.required).toBe(true);
        done();
      });
    });

    it('should not show errors when field is untouched', (done) => {
      component.nameErrors$.subscribe((errors) => {
        expect(errors.show).toBe(false);
        done();
      });
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', () => {
      component.onSubmit();
      expect(shoppingListServiceMock.createList).not.toHaveBeenCalled();
    });

    it('should call createList service when form is valid', () => {
      const mockResponse: ShoppingListResponse = {
        id: 1,
        name: 'Test List',
        isOwner: true,
      };
      (shoppingListServiceMock.createList as any).mockReturnValue(of(mockResponse));

      component.form.get('name')?.setValue('Test List');
      component.onSubmit();

      expect(shoppingListServiceMock.createList).toHaveBeenCalledWith({ name: 'Test List' });
    });

    it('should close dialog with new list on successful creation', () => {
      const mockResponse: ShoppingListResponse = {
        id: 1,
        name: 'Test List',
        isOwner: true,
      };
      (shoppingListServiceMock.createList as any).mockReturnValue(of(mockResponse));

      component.form.get('name')?.setValue('Test List');
      component.onSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle error on list creation failure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      });
      (shoppingListServiceMock.createList as any).mockReturnValue(throwError(() => errorResponse));

      component.form.get('name')?.setValue('Test List');
      component.onSubmit();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating list:', errorResponse);
      expect(dialogRefMock.close).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('onCancel', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });
  });
});
