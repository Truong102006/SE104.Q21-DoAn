package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.se104.goldstore.dto.response.UploadImageResponse;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.service.impl.CloudinaryImageUploadServiceImpl;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

class CloudinaryImageUploadServiceImplTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private CloudinaryImageUploadServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new CloudinaryImageUploadServiceImpl(cloudinary, "gold-store/products");
    }

    @Test
    void uploadImageShouldReturnSecureUrlAndPublicId() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "ring.jpg", "image/jpeg", "fake".getBytes());
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(
            Map.of("secure_url", "https://res.cloudinary.com/demo/image/upload/x.jpg", "public_id", "x")
        );

        UploadImageResponse response = service.uploadImage(file);

        assertEquals("https://res.cloudinary.com/demo/image/upload/x.jpg", response.getImageUrl());
        assertEquals("x", response.getPublicId());
        verify(cloudinary).uploader();
    }

    @Test
    void uploadImageShouldRejectUnsupportedMimeType() {
        MockMultipartFile file = new MockMultipartFile("file", "file.txt", "text/plain", "abc".getBytes());

        assertThrows(BusinessException.class, () -> service.uploadImage(file));
        verify(cloudinary, never()).uploader();
    }

    @Test
    void uploadImageShouldRejectOversizedFile() {
        byte[] oversized = new byte[(5 * 1024 * 1024) + 1];
        MockMultipartFile file = new MockMultipartFile("file", "huge.png", "image/png", oversized);

        assertThrows(BusinessException.class, () -> service.uploadImage(file));
        verify(cloudinary, never()).uploader();
    }

    @Test
    void uploadImageShouldRequireCloudinaryConfig() {
        CloudinaryImageUploadServiceImpl notConfigured = new CloudinaryImageUploadServiceImpl(null, "folder");
        MockMultipartFile file = new MockMultipartFile("file", "ring.jpg", "image/jpeg", "fake".getBytes());

        assertThrows(BusinessException.class, () -> notConfigured.uploadImage(file));
    }
}
