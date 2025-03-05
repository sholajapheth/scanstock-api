import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './product.service';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Barcode already exists',
  })
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(req.user.id, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of all products.',
  })
  findAll(@Request() req) {
    return this.productsService.findAll(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns product statistics (counts, totals, etc.).',
  })
  getProductStats(@Request() req) {
    return this.productsService.getProductStats(req.user.id);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({
    status: 200,
    description: 'Returns products with quantity below reorder point.',
  })
  getLowStockProducts(@Request() req) {
    return this.productsService.getLowStockProducts(req.user.id);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Get products that are out of stock' })
  @ApiResponse({
    status: 200,
    description: 'Returns products with zero quantity.',
  })
  getOutOfStockProducts(@Request() req) {
    return this.productsService.getOutOfStockProducts(req.user.id);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get favorite products' })
  @ApiResponse({
    status: 200,
    description: 'Returns products marked as favorite.',
  })
  getFavoriteProducts(@Request() req) {
    return this.productsService.getFavoriteProducts(req.user.id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns products in the specified category.',
  })
  getProductsByCategory(
    @Request() req,
    @Param('categoryId') categoryId: string,
  ) {
    return this.productsService.getProductsByCategory(req.user.id, +categoryId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', description: 'Search query (name, barcode, or SKU)' })
  @ApiResponse({
    status: 200,
    description: 'Returns products matching the search query.',
  })
  searchProducts(@Request() req, @Query('q') query: string) {
    return this.productsService.searchProducts(req.user.id, query);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Find product by barcode' })
  @ApiParam({ name: 'barcode', description: 'Product barcode' })
  @ApiResponse({
    status: 200,
    description: 'Returns the product with the specified barcode.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findByBarcode(@Request() req, @Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(req.user.id, barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Returns the product data.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.productsService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.id, +id, updateProductDto);
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status of a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The product favorite status has been toggled.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.productsService.toggleFavorite(req.user.id, +id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.productsService.remove(req.user.id, +id);
  }

  @Patch(':id/stock/increase')
  @ApiOperation({ summary: 'Increase stock quantity of a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({
    name: 'quantity',
    description: 'Quantity to add (default: 1)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'The product stock has been increased.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  increaseStock(
    @Request() req,
    @Param('id') id: string,
    @Query('quantity') quantity: number = 1,
  ) {
    return this.productsService.increaseStock(req.user.id, +id, quantity);
  }

  @Patch(':id/stock/decrease')
  @ApiOperation({ summary: 'Decrease stock quantity of a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({
    name: 'quantity',
    description: 'Quantity to reduce (default: 1)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'The product stock has been decreased.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 409, description: 'Not enough stock available.' })
  decreaseStock(
    @Request() req,
    @Param('id') id: string,
    @Query('quantity') quantity: number = 1,
  ) {
    return this.productsService.decreaseStock(req.user.id, +id, quantity);
  }
}
