export class CreateOrderDto {
  film!: string;
  session!: string;
  daytime?: string;
  row!: number;
  seat!: number;
  price?: number;
}

export class OrderDto {
  film!: string;
  session!: string;
  daytime!: string;
  row!: number;
  seat!: number;
  price!: number;
  id!: string;
}

export class OrdersResponseDto {
  total!: number;
  items!: OrderDto[];
}

export class OrderRequestDto {
  email?: string;
  phone?: string;
  tickets!: CreateOrderDto[];
}
