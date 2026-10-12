import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  // Practicing Day 16 async/await and promises
  async getTasks(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('This is an async response from your new NestJS service!');
      }, 1000);
    });
  }
}