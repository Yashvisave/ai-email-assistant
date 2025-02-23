package com.yashcore.email_reply_generator.app;

import lombok.Data;

@Data
public class EmailRequest {

    private String emailContent;
    private String tone;
}
