import { Repository } from 'typeorm';
import type { OrderDto } from '../order/dto/order.dto';
import type { OrderContacts, OrdersRepository } from './order.repository';
import { OrderEntity } from './entities/order.entity';

export class TypeOrmOrdersRepository implements OrdersRepository {
  constructor(private readonly orders: Repository<OrderEntity>) {}

  async save(items: OrderDto[], contacts: OrderContacts): Promise<void> {
    await this.orders.save(
      items.map((item) =>
        this.orders.create({
          ...item,
          daytime: new Date(item.daytime),
          ...contacts,
        }),
      ),
    );
  }
}
