package com.media.e_learning.service;

import com.media.e_learning.common.Const;

public interface FfmpegService {
    long encodeToMp4(String videoAbsPath, String outputAbsPath, Const.Quality quality);
}
