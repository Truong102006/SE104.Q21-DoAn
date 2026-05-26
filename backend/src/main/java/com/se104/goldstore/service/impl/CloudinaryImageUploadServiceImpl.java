package com.se104.goldstore.service.impl;

import com.cloudinary.Cloudinary;
import com.se104.goldstore.dto.response.UploadImageResponse;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.service.ImageUploadService;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryImageUploadServiceImpl implements ImageUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    private final Cloudinary cloudinary;
    private final String uploadFolder;

    public CloudinaryImageUploadServiceImpl(Cloudinary cloudinary, String uploadFolder) {
        this.cloudinary = cloudinary;
        this.uploadFolder = uploadFolder;
    }

    @Autowired
    public CloudinaryImageUploadServiceImpl(
        @Value("${application.cloudinary.cloud-name:}") String cloudName,
        @Value("${application.cloudinary.api-key:}") String apiKey,
        @Value("${application.cloudinary.api-secret:}") String apiSecret,
        @Value("${application.cloudinary.upload-folder:}") String uploadFolder
    ) {
        this(buildCloudinary(cloudName, apiKey, apiSecret), uploadFolder);
    }

    @Override
    public UploadImageResponse uploadImage(MultipartFile file) {
        validateFile(file);
        ensureConfigured();

        try {
            Map<String, Object> uploadOptions = new HashMap<>();
            if (uploadFolder != null && !uploadFolder.isBlank()) {
                uploadOptions.put("folder", uploadFolder.trim());
            }

            @SuppressWarnings("rawtypes")
            Map result = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
            String secureUrl = toStringValue(result.get("secure_url"));
            String publicId = toStringValue(result.get("public_id"));

            if (secureUrl == null || secureUrl.isBlank()) {
                throw new BusinessException("Khong lay duoc URL anh sau khi upload");
            }

            return new UploadImageResponse(secureUrl, publicId);
        } catch (IOException ex) {
            throw new BusinessException("Khong the doc file anh de upload");
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessException("Upload anh that bai");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File anh khong duoc de trong");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Chi ho tro anh JPG, PNG hoac WEBP");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException("Kich thuoc anh toi da la 5MB");
        }
    }

    private void ensureConfigured() {
        if (cloudinary == null) {
            throw new BusinessException("Cloudinary chua duoc cau hinh");
        }
    }

    private static Cloudinary buildCloudinary(String cloudName, String apiKey, String apiSecret) {
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            return null;
        }

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName.trim());
        config.put("api_key", apiKey.trim());
        config.put("api_secret", apiSecret.trim());
        config.put("secure", "true");
        return new Cloudinary(config);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String toStringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
