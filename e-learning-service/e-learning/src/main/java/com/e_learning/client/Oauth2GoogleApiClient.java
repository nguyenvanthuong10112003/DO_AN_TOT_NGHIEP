package com.e_learning.client;

import com.e_learning.client.dto.GoogleIntrospectRequest;
import com.e_learning.client.dto.GoogleIntrospectResponse;
import com.e_learning.client.dto.GoogleUserInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import java.util.Map;

@FeignClient(value = "${client.oauth2-google-api.name}",
        name = "${client.oauth2-google-api.name}",
        url = "${client.oauth2-google-api.base-url}")
public interface Oauth2GoogleApiClient {

    @RequestMapping(method = RequestMethod.POST, value = "/token")
    ResponseEntity<GoogleIntrospectResponse> introspect(@RequestBody GoogleIntrospectRequest request);

    @RequestMapping(method = RequestMethod.GET, value = "/oauth2/v2/userinfo")
    ResponseEntity<GoogleUserInfoResponse> userInfo(@RequestHeader Map<String, String> headers);
}
