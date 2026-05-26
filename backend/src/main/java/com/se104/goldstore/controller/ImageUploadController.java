package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.UploadImageResponse;
import com.se104.goldstore.service.ImageUploadService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({ApiPaths.UPLOADS_IMAGES, ApiPaths.V1_UPLOADS_IMAGES})
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    public ImageUploadController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_QL_SP')")
    public ResponseEntity<ApiResponse<UploadImageResponse>> upload(@RequestParam("file") MultipartFile file) {
        UploadImageResponse response = imageUploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Upload anh thanh cong", response));
    }
}
