import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('products')
  async getCatalog(@Query('search') search: string, @Query('page') page: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.storeService.getCombinedCatalog(search, pageNum);
  }

  @Get('products/:id')
  async getProductDetails(@Param('id') id: string) {
    return this.storeService.getProductDetails(id);
  }

  @Get('local')
  async getLocalProducts(@Query('search') search: string) {
    return this.storeService.getLocalProducts(search);
  }

  @Post('local')
  async createLocalProduct(@Body() data: any) {
    return this.storeService.createLocalProduct(data);
  }

  @Put('local/:id')
  async updateLocalProduct(@Param('id') id: string, @Body() data: any) {
    return this.storeService.updateLocalProduct(id, data);
  }

  @Delete('local/:id')
  async deleteLocalProduct(@Param('id') id: string) {
    return this.storeService.deleteLocalProduct(id);
  }

  @Get('ai-search')
  async getAiSearch(@Query('search') search: string) {
    return this.storeService.getAiSearch(search);
  }

  @Post('order')
  async createOrder(@Body() data: any) {
    return this.storeService.createOrder(data);
  }

  @Get('orders')
  async getOrders() {
    return this.storeService.getOrders();
  }

  @Put('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.storeService.updateOrderStatus(id, status);
  }

  @Post('invoice/:id')
  async invoiceOrder(@Param('id') id: string) {
    return this.storeService.invoiceOrder(id);
  }
}
