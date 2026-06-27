package com.e_learning.service;

import com.e_learning.client.dto.GoogleUserInfoResponse;
import com.e_learning.dto.request.LinkGoogleAccountRequest;

public interface GoogleApiService {
    GoogleUserInfoResponse getInfoUser(LinkGoogleAccountRequest request);
}
