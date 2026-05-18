package com.media.e_learning.service.impl;

import com.media.e_learning.common.Const;
import com.media.e_learning.service.FfmpegService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class FfmpegServiceImpl implements FfmpegService {

    @Override
    public long encodeToMp4(String videoAbsPath, String outputAbsPath, Const.Quality quality) {
        QualityProfile profile = QualityProfile.of(quality);
        log.info("Đang encode video to {}: {}", quality, outputAbsPath);

        List<String> cmd = new ArrayList<>(List.of(
            Const.FfmpegProperties.FFMPEG_PATH,
            "-i", videoAbsPath,
            "-vf", "scale=" + profile.scale(),          // Scale resolution
            "-c:v", "libx264",                          // Codec video H.264
            "-preset", "fast",                          // Tốc độ encode
            "-crf", String.valueOf(profile.crf()),      // Chất lượng (18-28, thấp hơn = tốt hơn)
            "-maxrate", profile.maxRate(),              // Bitrate tối đa
            "-bufsize", profile.bufSize(),              // Buffer size
            "-c:a", "aac",                              // Codec audio AAC
            "-b:a", "128k",                             // Audio bitrate
            "-movflags", "+faststart",                  // Cho phép stream trước khi download xong
            "-y",
            outputAbsPath
        ));

        runCommand(cmd, 3600); // Timeout 1 tiếng

        try {
            return Files.size(Paths.get(outputAbsPath));
        } catch (IOException e) {
            log.warn("Không đọc được kích thước output file: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private void runCommand(List<String> cmd, int timeoutSeconds) {
        log.debug("Chạy lệnh: {}", String.join(" ", cmd));

        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true); // ffmpeg ghi log ra stderr, gộp vào stdout

            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Lệnh ffmpeg timeout sau " + timeoutSeconds + "s");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                String errOutput = output.toString();
                log.error("ffmpeg thất bại (exit {}): {}", exitCode, errOutput);
                throw new RuntimeException(
                        "ffmpeg thất bại với exit code " + exitCode + ". Chi tiết: " +
                                errOutput.lines().reduce((a, b) -> b).orElse("unknown")
                );
            }

        } catch (IOException e) {
            throw new RuntimeException(
                "Không thể chạy ffmpeg. Hãy kiểm tra ffmpeg đã được cài đặt và có trong PATH: " + e.getMessage(), e
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Encode bị gián đoạn", e);
        }
    }

    private record QualityProfile(String scale, int crf, String maxRate, String bufSize, int bitrateKbps) {
        static QualityProfile of(Const.Quality quality) {
            return switch (quality.getName()) {
                case "480p"  -> new QualityProfile("854:-2",   23, "1000k", "2000k",  800);
                case "720p"  -> new QualityProfile("1280:-2",  22, "2500k", "5000k",  2000);
                case "1080p" -> new QualityProfile("1920:-2",  21, "5000k", "10000k", 4000);
                default      -> throw new RuntimeException("Quality không hợp lệ: " + quality);
            };
        }
    }
}
