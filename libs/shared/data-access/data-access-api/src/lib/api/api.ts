export * from './authentication-controller-rest.service';
import { AuthenticationControllerRestService } from './authentication-controller-rest.service';
export * from './item-controller-rest.service';
import { ItemControllerRestService } from './item-controller-rest.service';
export * from './shopping-list-controller-rest.service';
import { ShoppingListControllerRestService } from './shopping-list-controller-rest.service';
export * from './user-controller-rest.service';
import { UserControllerRestService } from './user-controller-rest.service';
export const APIS = [AuthenticationControllerRestService, ItemControllerRestService, ShoppingListControllerRestService, UserControllerRestService];
