package com.se104.goldstore.service;

import com.se104.goldstore.dto.response.UploadImageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageUploadService {

    UploadImageResponse uploadImage(MultipartFile file);
}
