package com.media.e_learning.controller;

import com.media.e_learning.dto.PhotoResponse;
import com.media.e_learning.dto.ResponseApi;
import com.media.e_learning.entity.Photo;
import com.media.e_learning.service.PhotoService;
import com.media.e_learning.validator.image.ImageConstraint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseApi<List<PhotoResponse>> uploadPhoto(
            @RequestPart("files") @Valid @NotEmpty List<@ImageConstraint MultipartFile> files,
            @RequestParam(value = "isTemp", required = false) Boolean isTemp) {
        return ResponseApi.createSuccess(photoService.uploadPhoto(files, isTemp));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> loadPhoto(@PathVariable String id) {
        Photo img = photoService.loadPhoto(id);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(img.getData().getContentType()))
            .body(img.getData().getData());
    }

    @PostMapping(value = "/remove")
    public ResponseApi<?> removePhoto(@RequestBody @NotEmpty List<String> ids) {
        photoService.removePhoto(ids, false);
        return ResponseApi.createSuccess();
    }

    @PostMapping(value = "/active")
    public ResponseApi<?> activePhoto(@RequestBody @NotEmpty Set<String> ids) {
        return ResponseApi.createSuccess(photoService.activePhoto(ids));
    }
}
