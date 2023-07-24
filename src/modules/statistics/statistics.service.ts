import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Visit } from 'src/modules/visit/entities/visit.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { StatisticsPaginationDto } from './dto/pagination.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}
  async findAll(query?: StatisticsPaginationDto) {
    const date: string = query?.date || '2023-01-01';
    const activeMembers = await this.memberRepo
      .createQueryBuilder('member')
      .where('member.status = :status', { status: 'active' })
      .getCount();

    const inactiveMembers = await this.memberRepo
      .createQueryBuilder('member')
      .where('status = :status', { status: 'inactive' })
      .orWhere('status = :status', { status: 'removed' })
      .getCount();

    const todaysVisits = await this.visitRepo
      .createQueryBuilder('visit')
      .where('visit.created_at >= CURRENT_DATE')
      .getCount();

    const outOufStockProducts = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .where('quantity =  :quantity', { quantity: 0 })
      .getCount();

    const payments = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('total', 'amount')
      .addSelect('created_at', 'date')
      .where('created_at >= :after', {
        after: moment(date).startOf('year').format('YYYY-MM-DD'),
      })
      .andWhere('created_at < :before', {
        before: moment(date).endOf('year').format('YYYY-MM-DD'),
      })
      .groupBy('MONTH(date)')
      .getRawMany();

    const totalIncome = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(total)', 'total')
      .addSelect('created_at', 'date')
      .where('created_at >= :after', {
        after: moment(date).startOf('year').format('YYYY-MM-DD'),
      })
      .andWhere('created_at < :before', {
        before: moment(date).endOf('year').format('YYYY-MM-DD'),
      })
      .groupBy('MONTH(date)')
      .getRawMany();
    let statistics: Payment[];
    const currentDate = new Date();

    switch (query?.sortDateBy) {
      case 'year':
        const currentYear = new Date().getFullYear();

        statistics = await this.paymentRepo
          .createQueryBuilder('payment')
          .select("DATE_FORMAT(payment.created_at, '%Y-%m')", 'year')
          .addSelect('SUM(payment.total)', 'total')
          .where('YEAR(payment.created_at) = :currentYear', { currentYear })
          .groupBy('year')
          .getRawMany();
        break;
      case 'month':
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        );
        statistics = await this.paymentRepo
          .createQueryBuilder('payment')
          .select("DATE_FORMAT(payment.created_at, '%Y-%m-%d')", 'month')
          .addSelect('payment.total', 'total')
          .where(
            'payment.created_at BETWEEN :firstDayOfMonth AND :lastDayOfMonth',
            {
              firstDayOfMonth,
              lastDayOfMonth,
            },
          )
          .groupBy('month')
          .getRawMany();
        break;
      case 'week':
        const firstDayOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1),
        );
        const lastDayOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() + 6),
        );

        statistics = await this.paymentRepo
          .createQueryBuilder('payment')
          .select("DATE_FORMAT(payment.created_at, '%Y-%m-%d')", 'week')
          .addSelect('payment.total', 'total')
          .where(
            'payment.created_at BETWEEN :firstDayOfWeek AND :lastDayOfWeek',
            {
              firstDayOfWeek,
              lastDayOfWeek,
            },
          )
          .groupBy('week')
          .getRawMany();
        break;

      default:
        break;
    }

    return {
      inactiveMembers,
      activeMembers,
      todaysVisits,
      outOufStockProducts,
      payments: [[...payments], ...totalIncome],
      statistics,
    };
  }
}
