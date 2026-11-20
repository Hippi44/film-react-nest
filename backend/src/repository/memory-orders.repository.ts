import { Injectable } from '@nestjs/common';
import type { OrderDto } from '../order/dto/order.dto';
import type { OrderContacts, OrdersRepository } from './order.repository';

@Injectable()
export class MemoryOrdersRepository implements OrdersRepository {
  private readonly orders: Array<OrderDto & OrderContacts> = [];

  async save(items: OrderDto[], contacts: OrderContacts): Promise<void> {
    this.orders.push(
      ...items.map((item) => ({
        ...item,
        ...contacts,
      })),
    );
  }
}
