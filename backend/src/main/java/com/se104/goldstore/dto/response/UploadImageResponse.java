package com.se104.goldstore.dto.response;

public class UploadImageResponse {

    private String imageUrl;
    private String publicId;

    public UploadImageResponse() {
    }

    public UploadImageResponse(String imageUrl, String publicId) {
        this.imageUrl = imageUrl;
        this.publicId = publicId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }
}
