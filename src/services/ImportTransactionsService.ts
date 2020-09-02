import { getRepository, getCustomRepository } from 'typeorm';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const transactions: Transaction[] = [];

    const data = fs
      .readFileSync(`${uploadConfig.directory}/${filename}`)
      .toString() // convert Buffer to string
      .split('\n') // split string to lines
      .map(e => e.trim()) // remove white spaces for each line
      .map(e => e.split(',').map(err => err.trim())); // split each line to array

    let title = '';
    let type = '' as 'income' | 'outcome';
    let value = 0;
    let category = '';
    let i = 0;
    const ln = data.length - 1;

    for (i = 1; i <= ln; i++) {
      title = data[i][0] as string;
      type = data[i][1] as 'income' | 'outcome';
      value = parseFloat(data[i][2]);
      category = data[i][3] as string;

      if (title) {
        const transaction = await createTransactionService.execute({
          title,
          value,
          type,
          category,
        });
        transactions.push(transaction);
      }
    }

    return transactions;
  }
}

export default ImportTransactionsService;
