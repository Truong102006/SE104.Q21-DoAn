package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.ThamSoRequest;
import com.se104.goldstore.dto.response.ThamSoResponse;
import java.util.List;

public interface ThamSoService {

    List<ThamSoResponse> getAll(String keyword);

    ThamSoResponse getById(String maThamSo);

    ThamSoResponse create(ThamSoRequest request);

    ThamSoResponse update(String maThamSo, ThamSoRequest request);

    void delete(String maThamSo);
}