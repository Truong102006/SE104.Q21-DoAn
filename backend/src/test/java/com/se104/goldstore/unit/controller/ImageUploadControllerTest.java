package com.se104.goldstore.unit.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.se104.goldstore.controller.ImageUploadController;
import com.se104.goldstore.dto.response.UploadImageResponse;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.GlobalExceptionHandler;
import com.se104.goldstore.service.ImageUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ImageUploadControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ImageUploadService imageUploadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders
            .standaloneSetup(new ImageUploadController(imageUploadService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void uploadShouldReturnSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "ring.jpg", "image/jpeg", "fake".getBytes());
        when(imageUploadService.uploadImage(org.mockito.ArgumentMatchers.any()))
            .thenReturn(new UploadImageResponse("https://res.cloudinary.com/demo/image/upload/ring.jpg", "ring"));

        mockMvc.perform(multipart("/api/uploads/images").file(file))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.imageUrl").value("https://res.cloudinary.com/demo/image/upload/ring.jpg"))
            .andExpect(jsonPath("$.data.publicId").value("ring"));
    }

    @Test
    void uploadShouldReturnBadRequestWhenServiceFails() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "ring.jpg", "image/jpeg", "fake".getBytes());
        when(imageUploadService.uploadImage(org.mockito.ArgumentMatchers.any()))
            .thenThrow(new BusinessException("Kich thuoc anh toi da la 5MB"));

        mockMvc.perform(multipart("/api/uploads/images").file(file))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }
}
