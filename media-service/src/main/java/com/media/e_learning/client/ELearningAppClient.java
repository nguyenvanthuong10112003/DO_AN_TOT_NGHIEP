package com.media.e_learning.client;

import com.media.e_learning.dto.ResponseApi;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient(value = "${apis.e-learning-service.name}", url = "${apis.e-learning-service.base-url}")
public interface ELearningAppClient {

    @RequestMapping(method = RequestMethod.POST, value = "/auth/introspect")
    ResponseEntity<ResponseApi<IntrospectTokenResponse>> introspectToken(@RequestBody IntrospectTokenRequest request);

}
