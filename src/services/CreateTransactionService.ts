import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  category: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    let categoryId = '';

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();

      if (balance.total < value) {
        throw new AppError('Sem saldo', 400);
      }
    }

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      const categoryCreated = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryCreated);

      categoryId = categoryCreated.id;
    } else {
      categoryId = checkCategoryExists.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
