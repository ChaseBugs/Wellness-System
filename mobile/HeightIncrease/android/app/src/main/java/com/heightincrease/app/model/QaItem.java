package com.heightincrease.app.model;

public class QaItem {
    public final String question;
    public final String answer;
    public final boolean appTopic;

    public QaItem(String question, String answer, boolean appTopic) {
        this.question = question;
        this.answer = answer;
        this.appTopic = appTopic;
    }
}
