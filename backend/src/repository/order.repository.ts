import type { OrderDto, OrderRequestDto } from '../order/dto/order.dto';

export type OrderContacts = Pick<OrderRequestDto, 'email' | 'phone'>;

export interface OrdersRepository {
  save(items: OrderDto[], contacts: OrderContacts): Promise<void>;
}
