package com.e_learning.common;

import com.e_learning.helper.DataUtil;

import java.time.LocalDateTime;

public final class EmailBody {
    public static String createBodySendVerifyCode(String verifyCode, LocalDateTime expireAt) {
        return  "<p>Bạn đang yêu cầu xác thực tài khoản. Vui lòng sử dụng mã dưới đây:</p>" +
                "<div class=\"code\">" + verifyCode + "</div> " +
                "<p>Mã này sẽ hết hạn lúc <strong>" + DataUtil.formatDateTime(expireAt, Const.FORMAT_DATETIME_PATTERN_DD_MM_YYYY_HH_MM_SS) + "</strong>.</p> " +
                "<p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>";
    }
    public static String createBodySendNewPassword(String newPassword) {
        return  "<p>Bạn đang yêu cầu đặt lại mật khẩu mới.</p>" +
                "<p>Mật khẩu mới của bạn là: <strong>" + newPassword + "</strong></p> ";
    }
}
