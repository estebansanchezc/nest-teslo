import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}
  async runSeed() {
    await this.insertNewProducts();
    return 'seed execute';
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productService.create(product));
    });

    const result = await Promise.all(insertPromises);

    return result.length > 0;
  }
}
