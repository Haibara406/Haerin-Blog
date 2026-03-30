---
title: MinioUtils
date: '2025-10-27 21:38'
updated: '2026-03-29 22:32'
excerpt: 提供基于MinIO的通用文件上传工具类，支持多种上传方式、批量操作和预签名URL生成。
tags:
  - Java
  - MinIO
category: Backend
---

# MinioUtils - 通用 MinIO 文件上传工具类

## 目录

- [概述](#概述)
- [特性](#特性)
- [依赖配置](#依赖配置)
  - [Maven 依赖](#maven-依赖)
  - [配置文件](#配置文件-applicationyml)
  - [Spring Boot 配置类](#spring-boot-配置类)
- [核心类定义](#核心类定义)
  - [文件上传配置类](#1-文件上传配置类)
  - [文件上传异常类](#2-文件上传异常类)
  - [文件信息实体类](#3-文件信息实体类)
- [MinioUtils 工具类](#优化后的-minioutils-工具类)
- [使用示例](#使用示例)
  - [基本上传](#1-基本上传)
  - [文件管理](#2-文件管理)
  - [异常处理](#3-异常处理)
- [高级特性](#高级特性)

## 概述

基于 MinIO 的通用文件上传工具类，提供完整的文件管理功能。优化后具有更好的通用性、性能和可维护性。

## 特性

- ✅ 多种上传方式（随机文件名、自定义文件名、动态目录）
- ✅ 完整文件管理（上传、下载、删除、存在检查、列表查询）
- ✅ 灵活的文件类型和大小验证
- ✅ 批量文件操作支持
- ✅ 预签名 URL 生成
- ✅ 异常处理优化
- ✅ 配置外部化
- ✅ 高性能文件存在检查

## 依赖配置

### Maven 依赖

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.7</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 配置文件 (application.yml)

```yaml
# MinIO 配置
minio:
  endpoint: https://your-minio-endpoint.com
  accessKey: your-access-key
  secretKey: your-secret-key
  bucketName: your-bucket-name

# 文件上传配置
file:
  upload:
    # 默认配置
    default-max-size: 10MB
    allowed-formats: 
      - jpg
      - jpeg
      - png
      - gif
      - webp
      - pdf
      - doc
      - docx
    # 特定类型配置
    rules:
      avatar:
        directory: "user/avatar/"
        max-size: 5MB
        allowed-formats: [jpg, jpeg, png, webp]
      article-cover:
        directory: "article/cover/"
        max-size: 8MB
        allowed-formats: [jpg, jpeg, png, webp]
      document:
        directory: "documents/"
        max-size: 50MB
        allowed-formats: [pdf, doc, docx, txt]

spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
```

### Spring Boot 配置类

```java
@Configuration
@EnableConfigurationProperties(FileUploadConfig.class)
public class MinioConfiguration {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.accessKey}")
    private String accessKey;

    @Value("${minio.secretKey}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
```

## 核心类定义

### 1. 文件上传配置类

```java
package com.example.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Component
@ConfigurationProperties(prefix = "file.upload")
public class FileUploadConfig {
    
    private String defaultMaxSize = "10MB";
    private List<String> allowedFormats = List.of("jpg", "jpeg", "png", "gif");
    private Map<String, UploadRule> rules = new HashMap<>();
    
    @Data
    public static class UploadRule {
        private String directory;
        private String maxSize;
        private List<String> allowedFormats;
    }
    
    public UploadRule getRule(String type) {
        return rules.getOrDefault(type, createDefaultRule());
    }
    
    private UploadRule createDefaultRule() {
        UploadRule rule = new UploadRule();
        rule.setMaxSize(defaultMaxSize);
        rule.setAllowedFormats(allowedFormats);
        rule.setDirectory("default/");
        return rule;
    }
}
```

### 2. 文件上传异常类

```java
package com.example.exception;

/**
 * 文件上传相关异常
 * @author haibara
 */
public class FileUploadException extends RuntimeException {
    
    private final String errorCode;
    
    public FileUploadException(String message) {
        super(message);
        this.errorCode = "FILE_UPLOAD_ERROR";
    }
    
    public FileUploadException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public FileUploadException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "FILE_UPLOAD_ERROR";
    }
    
    public FileUploadException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    // 预定义异常类型
    public static FileUploadException fileEmpty() {
        return new FileUploadException("上传文件为空", "FILE_EMPTY");
    }
    
    public static FileUploadException fileTooLarge(String maxSize) {
        return new FileUploadException("文件大小超过限制: " + maxSize, "FILE_TOO_LARGE");
    }
    
    public static FileUploadException unsupportedFormat(List<String> supportedFormats) {
        return new FileUploadException("不支持的文件格式，支持的格式: " + supportedFormats, "UNSUPPORTED_FORMAT");
    }
    
    public static FileUploadException uploadFailed(String reason) {
        return new FileUploadException("文件上传失败: " + reason, "UPLOAD_FAILED");
    }
    
    public static FileUploadException fileNotFound(String fileName) {
        return new FileUploadException("文件不存在: " + fileName, "FILE_NOT_FOUND");
    }
}
```

### 3. 文件信息实体类

```java
package com.example.entity;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

/**
 * 文件信息实体类
 * @author haibara
 */
@Data
@Builder
public class FileInfo {
    private String fileName;
    private String originalName;
    private String contentType;
    private long size;
    private String url;
    private String objectName;
    private LocalDateTime uploadTime;
    private String directory;
    
    public String getSizeInMB() {
        return String.format("%.2f MB", size / (1024.0 * 1024.0));
    }
    
    public String getSizeInKB() {
        return String.format("%.2f KB", size / 1024.0);
    }
}
```

## MinioUtils 工具类

```java
package com.example.utils;

import com.example.config.FileUploadConfig;
import com.example.entity.FileInfo;
import com.example.exception.FileUploadException;
import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import io.minio.messages.Item;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * MinIO 文件上传工具类
 * 提供完整的文件管理功能，包括上传、下载、删除、查询等操作
 * 
 * @author haibara
 * @version 2.0
 */
@Slf4j
@Component
public class MinioUtils {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private FileUploadConfig fileUploadConfig;

    @Value("${minio.bucketName}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String endpoint;

    // 文件大小单位正则
    private static final Pattern SIZE_PATTERN = Pattern.compile("^(\\d+(?:\\.\\d+)?)\\s*(B|KB|MB|GB)$", Pattern.CASE_INSENSITIVE);

    /**
     * 上传文件 - 随机文件名
     */
    public FileInfo upload(String fileType, MultipartFile file) {
        return upload(fileType, file, null, null);
    }

    /**
     * 上传文件 - 指定文件名
     */
    public FileInfo upload(String fileType, MultipartFile file, String fileName) {
        return upload(fileType, file, fileName, null);
    }

    /**
     * 上传文件 - 完整配置
     * @param fileType  文件类型
     * @param file      上传的文件
     * @param fileName  指定文件名（不含扩展名），null时使用UUID
     * @param customDir 自定义目录，null时使用配置目录
     */
    public FileInfo upload(String fileType, MultipartFile file, String fileName, String customDir) {
        try {
            // 获取上传规则
            FileUploadConfig.UploadRule rule = fileUploadConfig.getRule(fileType);
            
            // 文件验证
            validateFile(file, rule);
            
            // 构建文件名和路径
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String finalFileName = (fileName != null ? fileName : UUID.randomUUID().toString()) + "." + fileExtension;
            String directory = customDir != null ? ensureDirectoryFormat(customDir) : rule.getDirectory();
            String objectName = directory + finalFileName;
            
            // 执行上传
            uploadToMinio(file, objectName);
            
            // 构建返回信息
            return FileInfo.builder()
                    .fileName(finalFileName)
                    .originalName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .url(buildFileUrl(objectName))
                    .objectName(objectName)
                    .uploadTime(LocalDateTime.now())
                    .directory(directory)
                    .build();
                    
        } catch (FileUploadException e) {
            throw e;
        } catch (Exception e) {
            log.error("文件上传失败: {}", e.getMessage(), e);
            throw FileUploadException.uploadFailed(e.getMessage());
        }
    }

    /**
     * 下载文件
     */
    public InputStream downloadFile(String objectName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            log.error("文件下载失败: {}", e.getMessage(), e);
            throw FileUploadException.fileNotFound(objectName);
        }
    }

    /**
     * 生成预签名下载URL
     */
    public String getPresignedUrl(String objectName, int expiredHours) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expiredHours, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            log.error("生成预签名URL失败: {}", e.getMessage(), e);
            throw new FileUploadException("生成预签名URL失败: " + e.getMessage());
        }
    }

    /**
     * 删除单个文件
     */
    public boolean deleteFile(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("文件删除成功: {}", objectName);
            return true;
        } catch (Exception e) {
            log.error("文件删除失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 批量删除文件
     */
    public Map<String, Boolean> deleteFiles(List<String> objectNames) {
        Map<String, Boolean> results = new HashMap<>();
        
        if (objectNames == null || objectNames.isEmpty()) {
            return results;
        }

        try {
            List<DeleteObject> deleteObjects = objectNames.stream()
                    .map(DeleteObject::new)
                    .toList();

            RemoveObjectsArgs args = RemoveObjectsArgs.builder()
                    .bucket(bucketName)
                    .objects(deleteObjects)
                    .build();

            Iterable<Result<DeleteError>> deleteResults = minioClient.removeObjects(args);
            
            // 初始化所有文件为成功
            objectNames.forEach(name -> results.put(name, true));
            
            // 处理删除错误
            for (Result<DeleteError> result : deleteResults) {
                try {
                    DeleteError error = result.get();
                    results.put(error.objectName(), false);
                    log.error("文件删除失败: {} - {}", error.objectName(), error.message());
                } catch (Exception e) {
                    log.error("处理删除结果时出错: {}", e.getMessage(), e);
                }
            }
            
        } catch (Exception e) {
            log.error("批量删除文件失败: {}", e.getMessage(), e);
            objectNames.forEach(name -> results.put(name, false));
        }

        return results;
    }

    /**
     * 检查文件是否存在（高性能版本）
     */
    public boolean isFileExist(String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            return true;
        } catch (ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code())) {
                return false;
            }
            log.error("检查文件存在性失败: {}", e.getMessage(), e);
            throw new FileUploadException("检查文件存在性失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("检查文件存在性失败: {}", e.getMessage(), e);
            throw new FileUploadException("检查文件存在性失败: " + e.getMessage());
        }
    }

    /**
     * 列出指定目录下的所有文件
     */
    public List<FileInfo> listFiles(String directory) {
        List<FileInfo> fileInfos = new ArrayList<>();
        String formattedDir = ensureDirectoryFormat(directory);

        try {
            ListObjectsArgs args = ListObjectsArgs.builder()
                    .bucket(bucketName)
                    .prefix(formattedDir)
                    .build();

            Iterable<Result<Item>> results = minioClient.listObjects(args);

            for (Result<Item> result : results) {
                try {
                    Item item = result.get();
                    if (!item.objectName().endsWith("/")) { // 排除目录
                        FileInfo fileInfo = FileInfo.builder()
                                .fileName(extractFileName(item.objectName()))
                                .objectName(item.objectName())
                                .size(item.size())
                                .url(buildFileUrl(item.objectName()))
                                .directory(extractDirectory(item.objectName()))
                                .build();
                        fileInfos.add(fileInfo);
                    }
                } catch (Exception e) {
                    log.error("处理文件列表项时出错: {}", e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("列出文件失败: {}", e.getMessage(), e);
            throw new FileUploadException("列出文件失败: " + e.getMessage());
        }

        return fileInfos;
    }

    /**
     * 获取文件信息
     */
    public FileInfo getFileInfo(String objectName) {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );

            return FileInfo.builder()
                    .fileName(extractFileName(objectName))
                    .objectName(objectName)
                    .contentType(stat.contentType())
                    .size(stat.size())
                    .url(buildFileUrl(objectName))
                    .directory(extractDirectory(objectName))
                    .build();
                    
        } catch (Exception e) {
            log.error("获取文件信息失败: {}", e.getMessage(), e);
            throw FileUploadException.fileNotFound(objectName);
        }
    }

    // ================================ 私有方法 ================================

    // 文件验证
    private void validateFile(MultipartFile file, FileUploadConfig.UploadRule rule) {
        if (file == null || file.isEmpty()) {
            throw FileUploadException.fileEmpty();
        }

        // 验证文件大小
        long maxSizeBytes = parseSize(rule.getMaxSize());
        if (file.getSize() > maxSizeBytes) {
            throw FileUploadException.fileTooLarge(rule.getMaxSize());
        }

        // 验证文件格式
        String extension = getFileExtension(file.getOriginalFilename());
        if (!rule.getAllowedFormats().contains(extension.toLowerCase())) {
            throw FileUploadException.unsupportedFormat(rule.getAllowedFormats());
        }
    }

    // 执行MinIO上传
    private void uploadToMinio(MultipartFile file, String objectName) throws Exception {
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build();

            minioClient.putObject(args);
            log.info("文件上传成功: {}", objectName);
        }
    }

    // 获取文件扩展名
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new FileUploadException("文件名无效或缺少扩展名");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    // 确保目录格式正确（以/结尾）
    private String ensureDirectoryFormat(String directory) {
        if (directory == null || directory.trim().isEmpty()) {
            return "";
        }
        return directory.endsWith("/") ? directory : directory + "/";
    }

    // 构建文件访问URL
    private String buildFileUrl(String objectName) {
        return String.format("%s/%s/%s", endpoint, bucketName, objectName);
    }

    // 从完整路径中提取文件名
    private String extractFileName(String objectName) {
        return objectName.substring(objectName.lastIndexOf("/") + 1);
    }

    // 从完整路径中提取目录
    private String extractDirectory(String objectName) {
        int lastSlashIndex = objectName.lastIndexOf("/");
        return lastSlashIndex > 0 ? objectName.substring(0, lastSlashIndex + 1) : "";
    }

    // 解析文件大小字符串为字节数
    private long parseSize(String sizeStr) {
        if (sizeStr == null || sizeStr.trim().isEmpty()) {
            return Long.MAX_VALUE;
        }

        var matcher = SIZE_PATTERN.matcher(sizeStr.trim());
        if (!matcher.matches()) {
            throw new IllegalArgumentException("无效的文件大小格式: " + sizeStr);
        }

        double size = Double.parseDouble(matcher.group(1));
        String unit = matcher.group(2).toUpperCase();

        return switch (unit) {
            case "B" -> (long) size;
            case "KB" -> (long) (size * 1024);
            case "MB" -> (long) (size * 1024 * 1024);
            case "GB" -> (long) (size * 1024 * 1024 * 1024);
            default -> throw new IllegalArgumentException("不支持的文件大小单位: " + unit);
        };
    }
}
```

## 使用示例

### 1. 基本上传

```java
@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private MinioUtils minioUtils;

    // 上传用户头像
    @PostMapping("/upload/avatar")
    public ResponseEntity<FileInfo> uploadAvatar(@RequestParam("file") MultipartFile file) {
        FileInfo fileInfo = minioUtils.upload("avatar", file);
        return ResponseEntity.ok(fileInfo);
    }

    // 上传文章封面（指定文件名）
    @PostMapping("/upload/article-cover")
    public ResponseEntity<FileInfo> uploadArticleCover(
            @RequestParam("file") MultipartFile file,
            @RequestParam("articleId") String articleId) {
        FileInfo fileInfo = minioUtils.upload("article-cover", file, "cover_" + articleId);
        return ResponseEntity.ok(fileInfo);
    }

    // 上传到自定义目录
    @PostMapping("/upload/custom")
    public ResponseEntity<FileInfo> uploadToCustomDir(
            @RequestParam("file") MultipartFile file,
            @RequestParam("directory") String directory) {
        FileInfo fileInfo = minioUtils.upload("document", file, null, directory);
        return ResponseEntity.ok(fileInfo);
    }
}
```

### 2. 文件管理

```java
@Service
public class FileService {

    @Autowired
    private MinioUtils minioUtils;

    // 获取用户文件列表
    public List<FileInfo> getUserFiles(String userId) {
        return minioUtils.listFiles("user/" + userId + "/");
    }

    // 删除用户所有文件
    public void deleteUserFiles(String userId) {
        List<FileInfo> userFiles = getUserFiles(userId);
        List<String> objectNames = userFiles.stream()
                .map(FileInfo::getObjectName)
                .toList();
        
        Map<String, Boolean> results = minioUtils.deleteFiles(objectNames);
        results.forEach((name, success) -> {
            if (!success) {
                log.warn("删除文件失败: {}", name);
            }
        });
    }

    // 生成临时下载链接
    public String generateDownloadLink(String objectName, int hours) {
        if (!minioUtils.isFileExist(objectName)) {
            throw new FileUploadException("文件不存在");
        }
        return minioUtils.getPresignedUrl(objectName, hours);
    }
}
```

### 3. 异常处理

```java
@ControllerAdvice
public class FileUploadExceptionHandler {

    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<ErrorResponse> handleFileUploadException(FileUploadException e) {
        ErrorResponse error = ErrorResponse.builder()
                .code(e.getErrorCode())
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.badRequest().body(error);
    }
}

@Data
@Builder
class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
}
```

## 高级特性

### 1. 文件分片上传（大文件）

```java
// 分片上传大文件
public FileInfo uploadLargeFile(String fileType, MultipartFile file, String fileName) {
    // 实现分片上传逻辑
    // 这里可以扩展支持大文件的分片上传
    return upload(fileType, file, fileName);
}
```

### 2. 图片处理

```java
// 上传并生成缩略图
public FileInfo uploadWithThumbnail(String fileType, MultipartFile file) {
    // 上传原图
    FileInfo originalFile = upload(fileType, file);
    
    // 生成缩略图（需要图片处理库）
    // generateThumbnail(originalFile);
    
    return originalFile;
}
```

### 3. 文件同步

```java
// 同步文件到其他存储
public void syncToOtherStorage(String objectName) {
    // 实现文件同步逻辑
    try (InputStream inputStream = minioUtils.downloadFile(objectName)) {
        // 同步到其他存储系统
    } catch (Exception e) {
        log.error("文件同步失败: {}", e.getMessage(), e);
    }
}
```
