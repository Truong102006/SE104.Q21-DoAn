package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.NhomNguoiDungRequest;
import com.se104.goldstore.dto.response.NhomNguoiDungResponse;
import java.util.List;

public interface NhomNguoiDungService {

    List<NhomNguoiDungResponse> getAll(String keyword);

    NhomNguoiDungResponse getById(String maNhom);

    NhomNguoiDungResponse create(NhomNguoiDungRequest request);

    NhomNguoiDungResponse update(String maNhom, NhomNguoiDungRequest request);

    void delete(String maNhom);
}