package com.media.service;

import com.media.common.Const;

public interface FfmpegService {
    long encodeToMp4(String videoAbsPath, String outputAbsPath, Const.Quality quality);
}
