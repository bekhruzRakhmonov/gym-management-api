import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/modules/member/entities/member.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentPaginationDto } from './dto/pagination.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentDetail } from './entities/payment-detail.entity';
import { Payment } from './entities/payment.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(PaymentDetail)
    private readonly paymentDetailRepo: Repository<PaymentDetail>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}
  async create(
    createPaymentDto: CreatePaymentDto,
    moderator_id: number,
  ): Promise<Payment> {
    const { member_id, products, ...rest } = createPaymentDto;
    const member = await this.memberRepo.findOne({ where: { id: member_id } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    const newPayment = this.paymentRepo.create({
      member,
      ...rest,
      moderator_id,
    });
    const paymentDetails: PaymentDetail[] = [];
    if (products) {
      for (const product of products) {
        const foundProduct = await this.productRepo.findOne({
          where: { id: product.product_id },
        });
        if (!foundProduct) {
          throw new NotFoundException(
            `Product with id '${product.product_id}' not found`,
          );
        }
        if (
          foundProduct.status === 'inactive' ||
          foundProduct.status === 'removed'
        ) {
          throw new NotFoundException(
            `Product with id '${product.product_id}' not found`,
          );
        }

        const newPaymentDetail = this.paymentDetailRepo.create({
          product: foundProduct,
          product_count: product.product_count,
          moderator_id,
        });
        const inventory = await this.inventoryRepo.findOne({
          where: {
            product: {
              id: product.product_id,
            },
          },
        });
        if (!inventory) {
          throw new NotFoundException('Product not found from inventory');
        }
        if (inventory.quantity !== 0) {
          inventory.quantity = inventory.quantity - 1;
          paymentDetails.push(newPaymentDetail);
        } else {
          inventory.status = 'inactive';
        }
        inventory.moderator_id = moderator_id;
        await inventory.save();
      }
      newPayment.payment_details = paymentDetails;
      newPayment.for_what = 'products';
      await this.paymentDetailRepo.save(paymentDetails);
      return await this.paymentRepo.save(newPayment);
    }
    newPayment.for_what = 'membership';
    return await this.paymentRepo.save(newPayment);
  }

  async findAll(query?: PaymentPaginationDto): Promise<PaginationResponse> {
    const total = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect(
        'payment.member',
        'member',
        'payment.memberId = member.id',
      )
      .where('member.status IN (:statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('(member.fullname LIKE :q OR member.phone LIKE :q)', {
        q: `%${query?.q || ''}%`,
      })
      .andWhere(
        'payment.created_at >= :startDate AND payment.created_at <= :endDate',
        {
          startDate: query?.start_date || new Date('1970-01-01'), // default start date if not provided
          endDate: query?.end_date || new Date(), // default end date if not provided
        },
      )
      .groupBy('payment.id')
      .getCount();
    const result = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect(
        'payment.member',
        'member',
        'payment.memberId = member.id',
      )
      .where('member.status IN (:statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('(member.fullname LIKE :q OR member.phone LIKE :q)', {
        q: `%${query?.q || ''}%`,
      })
      .andWhere(
        'payment.created_at >= :startDate AND payment.created_at <= :endDate',
        {
          startDate: query?.start_date || new Date('1970-01-01'), // default start date if not provided
          endDate: query?.end_date || new Date(), // default end date if not provided
        },
      )
      .orderBy('payment.id', 'DESC')
      .offset((query?.limit || 10) * ((query?.page || 1) - 1))
      .limit(query?.limit || 10)
      .groupBy('payment.id')
      .getMany();

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findAllPaymentDetailsById(
    query?: PaymentPaginationDto,
    payment_id?: number,
  ): Promise<PaginationResponse> {
    const total = await this.paymentDetailRepo.count({
      where: {
        payment: {
          id: payment_id,
        },
      },
    });
    const result = await this.paymentDetailRepo
      .createQueryBuilder('payment_detail')
      .leftJoin(
        'payment_detail.payment',
        'payment',
        'payment_detail.paymentId = payment.id',
      )
      .leftJoin(
        'payment_detail.product',
        'product',
        'payment_detail.productId = product.id',
      )
      .leftJoin(
        'product.product_type',
        'product_type',
        'product.productTypeId = product_type.id',
      )
      .select([
        'payment_detail.id as id',
        'payment_detail.moderator_id as moderator_id',
        'payment_detail.created_at as created_at',
        'payment_detail.product_count as product_count',
        'payment_detail.productId as product_id',
        'product.supplier as supplier',
        'product.price as price',
        'product.product_name as product_name',
        'product_type.name as product_type',
      ])
      .where('payment.id = :id', { id: payment_id })
      .orderBy('payment_detail.id', 'DESC')
      .offset((query?.limit || 10) * ((query?.page || 1) - 1))
      .limit(query?.limit || 10)
      .getRawMany();
    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findOne(id: number, detail = true) {
    return await this.paymentRepo.findOne({
      where: { id },
      relations: {
        member: detail,
        payment_details: detail,
      },
    });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
    moderator_id: number,
  ): Promise<UpdateResult> {
    const { products, ...rest } = updatePaymentDto;
    return await this.paymentRepo.update(id, { ...rest, moderator_id, id: id });
  }

  async remove(id: number, moderator_id: number): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    payment.moderator_id = moderator_id;
    return this.paymentRepo.remove(payment);
  }
}
