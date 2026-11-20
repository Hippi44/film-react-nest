import mongoose = require('mongoose');
import type { OrderDto } from '../order/dto/order.dto';
import type { OrderContacts, OrdersRepository } from './order.repository';

type OrderRecord = OrderDto & OrderContacts;

export class MongoOrdersRepository implements OrdersRepository {
  private readonly orders: mongoose.Model<OrderRecord>;

  constructor(connection: mongoose.Connection) {
    const orderSchema = new mongoose.Schema<OrderRecord>(
      {
        id: { type: String, required: true, unique: true, index: true },
        film: { type: String, required: true },
        session: { type: String, required: true },
        daytime: { type: String, required: true },
        row: { type: Number, required: true },
        seat: { type: Number, required: true },
        price: { type: Number, required: true },
        email: String,
        phone: String,
      },
      { versionKey: false, id: false },
    );

    this.orders =
      (connection.models.Order as mongoose.Model<OrderRecord> | undefined) ??
      connection.model<OrderRecord>('Order', orderSchema, 'orders');
  }

  async save(items: OrderDto[], contacts: OrderContacts): Promise<void> {
    await this.orders.insertMany(
      items.map((item) => ({
        ...item,
        ...contacts,
      })),
      { ordered: true },
    );
  }
}
