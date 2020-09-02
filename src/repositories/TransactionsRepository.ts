import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionRepository = getRepository(Transaction);

    const income = await transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.value), 0)', 'TOTAL')
      .andWhere("transaction.type = 'income'")
      .getRawOne();

    const outcome = await transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.value), 0)', 'TOTAL')
      .andWhere("transaction.type = 'outcome'")
      .getRawOne();

    const totalIncome = income.TOTAL as number;
    const totalOutcome = outcome.TOTAL as number | 0;
    const total = totalIncome - totalOutcome;

    return { income: totalIncome, outcome: totalOutcome, total };
  }
}

export default TransactionsRepository;
