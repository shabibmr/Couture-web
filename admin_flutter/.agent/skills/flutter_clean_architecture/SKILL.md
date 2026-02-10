---
name: Flutter Clean Architecture Setup
description: Set up Clean Architecture structure for Flutter projects with Domain, Data, and Presentation layers
---

# Flutter Clean Architecture Setup

This skill provides guidelines for setting up a Flutter project following Clean Architecture principles with three distinct layers: Domain, Data, and Presentation.

## Project Structure

```
lib/
├── core/
│   ├── constants/
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   └── network_info.dart
│   ├── usecases/
│   │   └── usecase.dart
│   └── utils/
├── features/
│   └── {feature_name}/
│       ├── data/
│       │   ├── datasources/
│       │   │   ├── {feature}_local_data_source.dart
│       │   │   └── {feature}_remote_data_source.dart
│       │   ├── models/
│       │   │   └── {model}_model.dart
│       │   └── repositories/
│       │       └── {feature}_repository_impl.dart
│       ├── domain/
│       │   ├── entities/
│       │   │   └── {entity}.dart
│       │   ├── repositories/
│       │   │   └── {feature}_repository.dart
│       │   └── usecases/
│       │       ├── get_{feature}.dart
│       │       ├── create_{feature}.dart
│       │       └── update_{feature}.dart
│       └── presentation/
│           ├── bloc/
│           │   ├── {feature}_bloc.dart
│           │   ├── {feature}_event.dart
│           │   └── {feature}_state.dart
│           ├── pages/
│           │   └── {feature}_page.dart
│           └── widgets/
│               └── {feature}_widget.dart
├── injection_container.dart
└── main.dart
```

## Layer Responsibilities

### 1. Domain Layer (Pure Dart)
**No Flutter dependencies allowed**

#### Entities
```dart
// lib/features/product/domain/entities/product.dart
import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String title;
  final double price;
  final String description;
  final List<String> images;
  final bool isActive;

  const Product({
    required this.id,
    required this.title,
    required this.price,
    required this.description,
    required this.images,
    required this.isActive,
  });

  @override
  List<Object?> get props => [id, title, price, description, images, isActive];
}
```

#### Repository Interfaces
```dart
// lib/features/product/domain/repositories/product_repository.dart
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/product.dart';

abstract class ProductRepository {
  Future<Either<Failure, List<Product>>> getProducts({int page = 1, int limit = 20});
  Future<Either<Failure, Product>> getProductById(String id);
  Future<Either<Failure, Product>> createProduct(Product product);
  Future<Either<Failure, Product>> updateProduct(Product product);
  Future<Either<Failure, void>> deleteProduct(String id);
}
```

#### Use Cases
```dart
// lib/features/product/domain/usecases/get_products.dart
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

class GetProducts implements UseCase<List<Product>, ProductParams> {
  final ProductRepository repository;

  GetProducts(this.repository);

  @override
  Future<Either<Failure, List<Product>>> call(ProductParams params) async {
    return await repository.getProducts(
      page: params.page,
      limit: params.limit,
    );
  }
}

class ProductParams {
  final int page;
  final int limit;

  ProductParams({this.page = 1, this.limit = 20});
}
```

### 2. Data Layer

#### Models (DTOs)
```dart
// lib/features/product/data/models/product_model.dart
import '../../domain/entities/product.dart';

class ProductModel extends Product {
  const ProductModel({
    required super.id,
    required super.title,
    required super.price,
    required super.description,
    required super.images,
    required super.isActive,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['_id'] ?? json['id'],
      title: json['title'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'price': price,
      'description': description,
      'images': images,
      'isActive': isActive,
    };
  }

  Product toEntity() {
    return Product(
      id: id,
      title: title,
      price: price,
      description: description,
      images: images,
      isActive: isActive,
    );
  }
}
```

#### Data Sources
```dart
// lib/features/product/data/datasources/product_remote_data_source.dart
import 'package:dio/dio.dart';
import '../../../../core/error/exceptions.dart';
import '../models/product_model.dart';

abstract class ProductRemoteDataSource {
  Future<List<ProductModel>> getProducts({int page = 1, int limit = 20});
  Future<ProductModel> getProductById(String id);
  Future<ProductModel> createProduct(ProductModel product);
  Future<ProductModel> updateProduct(String id, ProductModel product);
  Future<void> deleteProduct(String id);
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final Dio dio;

  ProductRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<ProductModel>> getProducts({int page = 1, int limit = 20}) async {
    try {
      final response = await dio.get(
        '/products',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['products'] ?? response.data;
        return data.map((json) => ProductModel.fromJson(json)).toList();
      } else {
        throw ServerException();
      }
    } catch (e) {
      throw ServerException();
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await dio.get('/products/id/$id');
      
      if (response.statusCode == 200) {
        return ProductModel.fromJson(response.data);
      } else {
        throw ServerException();
      }
    } catch (e) {
      throw ServerException();
    }
  }

  @override
  Future<ProductModel> createProduct(ProductModel product) async {
    try {
      final response = await dio.post(
        '/products',
        data: product.toJson(),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return ProductModel.fromJson(response.data);
      } else {
        throw ServerException();
      }
    } catch (e) {
      throw ServerException();
    }
  }

  @override
  Future<ProductModel> updateProduct(String id, ProductModel product) async {
    try {
      final response = await dio.put(
        '/products/$id',
        data: product.toJson(),
      );

      if (response.statusCode == 200) {
        return ProductModel.fromJson(response.data);
      } else {
        throw ServerException();
      }
    } catch (e) {
      throw ServerException();
    }
  }

  @override
  Future<void> deleteProduct(String id) async {
    try {
      final response = await dio.delete('/products/$id');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException();
      }
    } catch (e) {
      throw ServerException();
    }
  }
}
```

#### Repository Implementation
```dart
// lib/features/product/data/repositories/product_repository_impl.dart
import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_data_source.dart';
import '../models/product_model.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;

  ProductRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final products = await remoteDataSource.getProducts(
        page: page,
        limit: limit,
      );
      return Right(products);
    } on ServerException {
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, Product>> getProductById(String id) async {
    try {
      final product = await remoteDataSource.getProductById(id);
      return Right(product);
    } on ServerException {
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, Product>> createProduct(Product product) async {
    try {
      final productModel = ProductModel(
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        images: product.images,
        isActive: product.isActive,
      );
      final result = await remoteDataSource.createProduct(productModel);
      return Right(result);
    } on ServerException {
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, Product>> updateProduct(Product product) async {
    try {
      final productModel = ProductModel(
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        images: product.images,
        isActive: product.isActive,
      );
      final result = await remoteDataSource.updateProduct(product.id, productModel);
      return Right(result);
    } on ServerException {
      return Left(ServerFailure());
    }
  }

  @override
  Future<Either<Failure, void>> deleteProduct(String id) async {
    try {
      await remoteDataSource.deleteProduct(id);
      return const Right(null);
    } on ServerException {
      return Left(ServerFailure());
    }
  }
}
```

### 3. Presentation Layer

#### BLoC
```dart
// lib/features/product/presentation/bloc/product_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/product.dart';
import '../../domain/usecases/get_products.dart';

// Events
abstract class ProductEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadProducts extends ProductEvent {
  final int page;
  final int limit;

  LoadProducts({this.page = 1, this.limit = 20});

  @override
  List<Object?> get props => [page, limit];
}

// States
abstract class ProductState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ProductInitial extends ProductState {}

class ProductLoading extends ProductState {}

class ProductLoaded extends ProductState {
  final List<Product> products;

  ProductLoaded({required this.products});

  @override
  List<Object?> get props => [products];
}

class ProductError extends ProductState {
  final String message;

  ProductError({required this.message});

  @override
  List<Object?> get props => [message];
}

// BLoC
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final GetProducts getProducts;

  ProductBloc({required this.getProducts}) : super(ProductInitial()) {
    on<LoadProducts>(_onLoadProducts);
  }

  Future<void> _onLoadProducts(
    LoadProducts event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());

    final result = await getProducts(
      ProductParams(page: event.page, limit: event.limit),
    );

    result.fold(
      (failure) => emit(ProductError(message: 'Failed to load products')),
      (products) => emit(ProductLoaded(products: products)),
    );
  }
}
```

## Core Files

### UseCase Base Class
```dart
// lib/core/usecases/usecase.dart
import 'package:dartz/dartz.dart';
import '../error/failures.dart';

abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

class NoParams {}
```

### Failures and Exceptions
```dart
// lib/core/error/failures.dart
import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  @override
  List<Object?> get props => [];
}

class ServerFailure extends Failure {}

class CacheFailure extends Failure {}

class NetworkFailure extends Failure {}

class AuthFailure extends Failure {}
```

```dart
// lib/core/error/exceptions.dart
class ServerException implements Exception {}

class CacheException implements Exception {}

class NetworkException implements Exception {}

class AuthException implements Exception {}
```

## Best Practices

1. **Keep Domain Layer Pure**: No Flutter or third-party dependencies except Dart packages like `equatable` and `dartz`
2. **Use Either for Error Handling**: Return `Either<Failure, SuccessType>` from repositories
3. **Single Responsibility**: Each UseCase should do one thing
4. **Dependency Injection**: Use `get_it` to inject dependencies
5. **Immutable Entities**: Use `const` constructors and final fields
6. **Model-Entity Separation**: Models handle JSON, Entities are pure business objects

## Dependencies Required

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  dartz: ^0.10.1
  dio: ^5.4.0
  get_it: ^7.6.4
  injectable: ^2.3.2

dev_dependencies:
  injectable_generator: ^2.4.1
  build_runner: ^2.4.7
```
