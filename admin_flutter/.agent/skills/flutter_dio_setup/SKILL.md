---
name: Flutter Dio API Client Setup
description: Configure Dio HTTP client with interceptors for authentication, logging, and error handling
---

# Flutter Dio API Client Setup

This skill provides a complete setup for Dio HTTP client with authentication interceptors, error handling, and logging.

## API Client Implementation

### Core API Client
```dart
// lib/core/network/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';
import 'auth_interceptor.dart';
import 'logging_interceptor.dart';

class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  ApiClient({required FlutterSecureStorage secureStorage})
      : _secureStorage = secureStorage {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      AuthInterceptor(secureStorage: _secureStorage),
      LoggingInterceptor(),
    ]);
  }

  Dio get dio => _dio;

  // Helper methods
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.get(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.put(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.delete(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.patch(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}
```

### Authentication Interceptor
```dart
// lib/core/network/auth_interceptor.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/storage_constants.dart';

class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _secureStorage;

  AuthInterceptor({required FlutterSecureStorage secureStorage})
      : _secureStorage = secureStorage;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Get token from secure storage
    final token = await _secureStorage.read(key: StorageConstants.authToken);

    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired or invalid - clear storage and redirect to login
      await _secureStorage.delete(key: StorageConstants.authToken);
      // You can emit an event here to trigger logout/navigation
    }

    return handler.next(err);
  }
}
```

### Logging Interceptor
```dart
// lib/core/network/logging_interceptor.dart
import 'package:dio/dio.dart';
import 'package:logger/logger.dart';

class LoggingInterceptor extends Interceptor {
  final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 5,
      lineLength: 75,
      colors: true,
      printEmojis: true,
    ),
  );

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _logger.i(
      'REQUEST[${options.method}] => PATH: ${options.baseUrl}${options.path}\n'
      'Headers: ${options.headers}\n'
      'QueryParameters: ${options.queryParameters}\n'
      'Data: ${options.data}',
    );
    return super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _logger.i(
      'RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.baseUrl}${response.requestOptions.path}\n'
      'Data: ${response.data}',
    );
    return super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    _logger.e(
      'ERROR[${err.response?.statusCode}] => PATH: ${err.requestOptions.baseUrl}${err.requestOptions.path}\n'
      'Message: ${err.message}\n'
      'Data: ${err.response?.data}',
    );
    return super.onError(err, handler);
  }
}
```

### API Constants
```dart
// lib/core/constants/api_constants.dart
class ApiConstants {
  // Base URL - Configure based on environment
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  // Endpoints
  static const String login = '/auth/admin/login';
  static const String dashboard = '/dashboard/stats';
  
  // Products
  static const String products = '/products';
  static String productById(String id) => '/products/id/$id';
  static const String categories = '/products/categories';
  static const String sizes = '/products/sizes';
  
  // Orders
  static const String orders = '/orders';
  static String orderById(String id) => '/orders/$id';
  static String updateOrderStatus(String id) => '/orders/$id/status';
  
  // Coupons
  static const String coupons = '/coupons';
  static String couponById(String id) => '/coupons/$id';
  
  // Customers
  static const String customers = '/customers';
  static String customerById(String id) => '/customers/$id';
  
  // Settings
  static const String settings = '/settings';
  
  // Banners
  static const String banners = '/banners';
  static String bannerById(String id) => '/banners/$id';
  
  // Payments & Stock
  static const String payments = '/payments';
  static const String stock = '/stock';
  
  // Upload
  static const String upload = '/upload';
}
```

### Storage Constants
```dart
// lib/core/constants/storage_constants.dart
class StorageConstants {
  static const String authToken = 'auth_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String isLoggedIn = 'is_logged_in';
}
```

## Error Handling

### Dio Error Handler
```dart
// lib/core/network/dio_error_handler.dart
import 'package:dio/dio.dart';
import '../error/exceptions.dart';

class DioErrorHandler {
  static Exception handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException(message: 'Connection timeout');
        
      case DioExceptionType.badResponse:
        return _handleStatusCode(error.response?.statusCode);
        
      case DioExceptionType.cancel:
        return ServerException(message: 'Request cancelled');
        
      case DioExceptionType.connectionError:
        return NetworkException(message: 'No internet connection');
        
      case DioExceptionType.unknown:
      default:
        return ServerException(message: 'Unexpected error occurred');
    }
  }

  static Exception _handleStatusCode(int? statusCode) {
    switch (statusCode) {
      case 400:
        return ServerException(message: 'Bad request');
      case 401:
        return AuthException(message: 'Unauthorized');
      case 403:
        return AuthException(message: 'Forbidden');
      case 404:
        return ServerException(message: 'Not found');
      case 500:
      case 502:
      case 503:
        return ServerException(message: 'Server error');
      default:
        return ServerException(message: 'Something went wrong');
    }
  }
}
```

### Enhanced Exceptions
```dart
// lib/core/error/exceptions.dart
class ServerException implements Exception {
  final String message;
  ServerException({this.message = 'Server error occurred'});
}

class CacheException implements Exception {
  final String message;
  CacheException({this.message = 'Cache error occurred'});
}

class NetworkException implements Exception {
  final String message;
  NetworkException({this.message = 'Network error occurred'});
}

class AuthException implements Exception {
  final String message;
  AuthException({this.message = 'Authentication error occurred'});
}
```

## Dependency Injection Setup

```dart
// In injection_container.dart
import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'core/network/api_client.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External
  sl.registerLazySingleton(() => const FlutterSecureStorage());

  // Core
  sl.registerLazySingleton(() => ApiClient(secureStorage: sl()));

  // Features - Register your data sources here
  // Example:
  // sl.registerLazySingleton<ProductRemoteDataSource>(
  //   () => ProductRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  // );
}
```

## Usage Example

```dart
// In a data source
class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  final Dio dio;

  ProductRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<ProductModel>> getProducts() async {
    try {
      final response = await dio.get(ApiConstants.products);
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['products'] ?? response.data;
        return data.map((json) => ProductModel.fromJson(json)).toList();
      } else {
        throw ServerException();
      }
    } on DioException catch (e) {
      throw DioErrorHandler.handleError(e);
    }
  }
}
```

## Environment Configuration

### Option 1: Using --dart-define
```bash
flutter run --dart-define=API_BASE_URL=https://api.production.com/api
```

### Option 2: Using .env file (with flutter_dotenv)
```yaml
# pubspec.yaml
dependencies:
  flutter_dotenv: ^5.1.0

assets:
  - .env
```

```dart
// .env
API_BASE_URL=https://api.development.com/api
```

```dart
// main.dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}

// api_constants.dart
static String get baseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
```

## Dependencies Required

```yaml
dependencies:
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  logger: ^2.0.2
  flutter_dotenv: ^5.1.0  # Optional
```

## Best Practices

1. **Always use interceptors** for auth tokens
2. **Set appropriate timeouts** to prevent hanging requests
3. **Log requests in debug mode only** using kDebugMode
4. **Handle all error types** properly
5. **Use secure storage** for sensitive data like tokens
6. **Centralize API endpoints** in constants
7. **Implement retry logic** for failed requests if needed
