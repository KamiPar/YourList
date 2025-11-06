import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinListModal } from './join-list-modal';
import { MatDialogRef } from '@angular/material/dialog';
import { ShoppingListControllerRestService, ShoppingListResponse } from '@your-list/shared/data-access/data-access-api';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('JoinListModal', () => {
  let component: JoinListModal;
  let fixture: ComponentFixture<JoinListModal>;
  let dialogRefMock: jest.Mocked<MatDialogRef<JoinListModal>>;
  let shoppingListServiceMock: jest.Mocked<ShoppingListControllerRestService>;

  beforeEach(async () => {
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<JoinListModal>>;

    shoppingListServiceMock = {
      joinSharedList: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<ShoppingListControllerRestService>;

    await TestBed.configureTestingModule({
      imports: [JoinListModal],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: ShoppingListControllerRestService, useValue: shoppingListServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinListModal);
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
    it('should initialize form with empty shareToken field', () => {
      expect(component.joinListForm.get('shareToken')?.value).toBe('');
    });

    it('should have required validator on shareToken field', () => {
      const shareTokenControl = component.joinListForm.get('shareToken');
      expect(shareTokenControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when shareToken is empty', () => {
      expect(component.joinListForm.valid).toBe(false);
    });

    it('should be valid when shareToken is provided', () => {
      component.joinListForm.get('shareToken')?.setValue('valid-token-123');
      expect(component.joinListForm.valid).toBe(true);
    });
  });

  describe('joinList', () => {
    it('should not call service when form is invalid', () => {
      component.joinList();
      expect(shoppingListServiceMock.joinSharedList).not.toHaveBeenCalled();
    });

    it('should call joinSharedList service when form is valid', () => {
      const mockResponse: ShoppingListResponse = {
        id: 1,
        name: 'Shared List',
        isOwner: false,
      };
      (shoppingListServiceMock.joinSharedList as any).mockReturnValue(of(mockResponse));

      component.joinListForm.get('shareToken')?.setValue('valid-token-123');
      component.joinList();

      expect(shoppingListServiceMock.joinSharedList).toHaveBeenCalledWith({ shareToken: 'valid-token-123' });
    });

    it('should close dialog with joined list on successful join', () => {
      const mockResponse: ShoppingListResponse = {
        id: 1,
        name: 'Shared List',
        isOwner: false,
      };
      (shoppingListServiceMock.joinSharedList as any).mockReturnValue(of(mockResponse));

      component.joinListForm.get('shareToken')?.setValue('valid-token-123');
      component.joinList();

      expect(dialogRefMock.close).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle error and set form error on join failure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = new HttpErrorResponse({
        error: 'Invalid token',
        status: 400,
        statusText: 'Bad Request',
      });
      (shoppingListServiceMock.joinSharedList as any).mockReturnValue(throwError(() => errorResponse));

      component.joinListForm.get('shareToken')?.setValue('invalid-token');
      component.joinList();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error joining list:', errorResponse);
      expect(component.joinListForm.get('shareToken')?.hasError('invalidToken')).toBe(true);
      expect(dialogRefMock.close).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not call service when shareToken is null', () => {
      component.joinListForm.get('shareToken')?.setValue(null);
      component.joinList();
      expect(shoppingListServiceMock.joinSharedList).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });
  });

  describe('Error Handling', () => {
    it('should set invalidToken error on shareToken control when join fails', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'Token not found',
        status: 404,
        statusText: 'Not Found',
      });
      (shoppingListServiceMock.joinSharedList as any).mockReturnValue(throwError(() => errorResponse));

      component.joinListForm.get('shareToken')?.setValue('non-existent-token');
      component.joinList();

      const shareTokenControl = component.joinListForm.get('shareToken');
      expect(shareTokenControl?.hasError('invalidToken')).toBe(true);
    });
  });
});
