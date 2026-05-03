package com.e_learning.client;

import com.e_learning.dto.response.PhotoResponse;
import com.e_learning.dto.response.ResponseApi;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@FeignClient(value = "${client.media-service.name}",
        name = "${client.media-service.name}",
        url = "${client.media-service.base-url}")
public interface MediaServiceClient {
    @PostMapping(value = "/photos/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<ResponseApi<List<PhotoResponse>>> uploadPhoto(@RequestHeader Map<String, String> headers, @RequestPart("files") List<MultipartFile> files, @RequestParam(value = "isTemp") Boolean isTemp);
    @PostMapping(value = "/photos/remove")
    ResponseEntity<ResponseApi<?>> removePhoto(@RequestHeader Map<String, String> headers, @RequestBody List<String> ids);
    @PostMapping(value = "/photos/active")
    ResponseEntity<ResponseApi<List<PhotoResponse>>> activePhoto(@RequestHeader Map<String, String> headers, @RequestBody List<String> ids);
}
