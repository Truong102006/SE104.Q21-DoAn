package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.NguoiDungRequest;
import com.se104.goldstore.dto.response.NguoiDungResponse;
import java.util.List;

public interface NguoiDungService {

    List<NguoiDungResponse> getAll(String keyword);

    NguoiDungResponse getById(String tenDangNhap);

    NguoiDungResponse create(NguoiDungRequest request);

    NguoiDungResponse update(String tenDangNhap, NguoiDungRequest request);

    void delete(String tenDangNhap);
}